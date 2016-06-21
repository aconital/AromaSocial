/**
 * Created by hroshandel on 2016-01-19.
 */

var Notification = React.createClass({
    getInitialState: function() {
        return { notication_list: []};
    },
    deleteNotification:function(id)
    {   var i=0;
        var found =false;

        var notifications=this.state.notication_list;
        while(!found && i<notifications.length)
        {
            if(notifications[i].id == id) {
                notifications.splice(i, 1);
                found=true;
            }
            i++;
        }
        this.setState({notication_list: notifications});
    },
    loadFriendRequests :function()
    {
        $.ajax({
            url: "/friendrequest",
            success: function(data) {

                var notifications = this.state.notication_list.slice();
                for (var i=0;i<data.length;i++)
                    notifications.push(data[i]);
                this.setState({notication_list: notifications});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    loadOrgRequests :function()
    {
        $.ajax({
            url: "/orgrequest",
            success: function(data) {
                var notifications = this.state.notication_list.slice();
                for (var i=0;i<data.length;i++)
                    notifications.push(data[i]);
                this.setState({notication_list: notifications});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    loadOrg2OrgRequests :function()
    {
        $.ajax({
            url: "/org2orgrequest",
            success: function(data) {
                console.log(data);
                var notifications = this.state.notication_list.slice();
                for (var i=0;i<data.length;i++)
                    notifications.push(data[i]);

                this.setState({notication_list: notifications});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    componentDidMount : function(){
        this.loadFriendRequests();
        this.loadOrgRequests();
        this.loadOrg2OrgRequests();
        socket.on('friendrequest', this._friendrequest);
        socket.on('orgrequest', this._orgrequest);
        socket.on('org2orgrequest', this._org2orgrequest);
    },
    _orgrequest(data){
        var notifications = this.state.notication_list.slice();
        notifications.push(data.data);
        this.setState({notication_list:notifications});

    },
    _friendrequest(data){
        var notifications = this.state.notication_list.slice();
        notifications.push(data.data);
        this.setState({notication_list:notifications});
    },
    _org2orgrequest(data){
        var notifications = this.state.notication_list.slice();
        notifications.push(data.data);
        this.setState({notication_list:notifications});

    },
    pending_action:function(notification,action)
    {
        if (notification.type =="orgrequest") {

            $.ajax({
                url: "/organization/" + notification.extra.id + "/pending_person_action",
                method: "POST",
                data: {personId: notification.from.userId, mode: action},
                success: function (data) {

                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("couldnt retrieve people");
                }.bind(this)
            });

            this.deleteNotification(notification.id);
        }
        else if(notification.type == "friendrequest")
        {
            $.ajax({
                url: "/friendrequest/",
                method: "POST",
                data: {mode: action, person: notification.from},
                success: function (data) {

                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("couldnt retrieve people");
                }.bind(this)
            });
            this.deleteNotification(notification.id);
        }
        else if(notification.type == "org2orgrequest")
        {
            console.log(notification.extra.id)
            console.log(notification.from.userId)
            $.ajax({
                url: "/organization/" + notification.extra.id + "/pending_organization_action",
                method: "POST",
                data: {organizationId: notification.from.userId, mode: action},
                success: function (data) {

                }.bind(this),
                error: function (xhr, status, err) {
                    console.error("couldnt retrieve people");
                }.bind(this)
            });

            this.deleteNotification(notification.id);
        }

    },
    render: function() {
        if(this.state.notication_list.length <=0) {
            $('.notification-counter').hide();
            return(
                <li><a href="#" className="align-center">You have no connection requests at this moment. &nbsp;&nbsp;</a></li>
            );
        }
        else {
            $('.notification-counter').show();
            $(".notification-counter").text(this.state.notication_list.length);
            return (
                <li>
                    {this.state.notication_list.map(notification =>
                            <div id={notification.from.username} className="friend-request-item" key={notification.id}>
                                <div className="friend-request-left">
                                    <div className="friend-request-image-wrap">
                                        <a href={'/profile/'+notification.from.username}>
                                            <img  src={notification.from.userImgUrl} className="friend-request-image" />
                                        </a>
                                    </div>
                                </div>
                                <div className="friend-request-center" id="friend-request-info">
                                    <a href={'/profile/'+notification.from.username} className="body-link">
                                        <b><h3 className="no-margin-padding margin-top-5">{notification.from.name}</h3></b>
                                    </a>
                                    {notification.msg}
                                    <a href={'/organization/'+notification.extra.id} className="body-link">
                                        <b> {notification.extra.name}</b>
                                    </a>
                                </div>
                                <div className="friend-request-right">
                                    <button className="btn btn-primary friend-request-button" onClick={this.pending_action.bind(this,notification,"accept")} id="pending-action">Accept</button>
                                    <button className="btn btn-primary friend-request-button margin-top-10" onClick={this.pending_action.bind(this,notification,"reject")}  id="pending-action">Deny</button>
                                </div>
                                <div className="clear"></div>
                            </div>
                    )}

                </li>

            );
        }
    }
});


ReactDOM.render(<Notification />, document.getElementById('notification'));
