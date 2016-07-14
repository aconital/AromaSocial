/**
 * Created by hroshandel on 6/28/2016.
 */
/**
 * Created by hroshandel on 2016-01-19.
 */

var GeneralNotification = React.createClass({
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
    componentDidMount : function(){

        socket.on('discussionPost', this._updateNotificationList);
        this.loadNotifications();
    },
    loadNotifications:function()
    {
        $.ajax({
            url: "/notifications/general",
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
    _updateNotificationList(data){
        var notifications = this.state.notication_list.slice();
        notifications.push(data.data);
        this.setState({notication_list:notifications});
    },
    action:function(url)
    {
        window.location = url;
    },
    render: function() {
        if(this.state.notication_list.length <=0) {
            $('.general-notification-counter').hide();
            return(
                <li><a href="#" className="align-center">You have no notification at this moment. &nbsp;&nbsp;</a></li>
            );
        }
        else {
            $('.general-notification-counter').show();
            $(".general-notification-counter").text(this.state.notication_list.length);
            return (
                <li>
                    {this.state.notication_list.map(notification =>

                            <div onClick={this.action.bind(this,notification.extra.url)} id={notification.from.username} className="friend-request-item" key={notification.id}>
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
                                    <div>
                                        <a href={notification.extra.url} className= "discussion-topic">
                                            {notification.extra.title}
                                        </a>
                                    </div>
                                    {notification.msg}
                                </div>
                                <div className="clear"></div>
                            </div>

                    )}

                </li>

            );
        }
    }
});


ReactDOM.render(<GeneralNotification />, document.getElementById('general-notification'));


$("#general-notification-button").click(function(e){
    $.ajax({
        method: "POST",
        url: "/seen",
        success: function(data) {
        },
        error: function(xhr, status, err) {
            console.error("couldnt update seen");
        }
    });
});