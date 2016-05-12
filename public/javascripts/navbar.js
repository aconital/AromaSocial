/**
 * Created by hroshandel on 2016-01-19.
 */

var FriendRequest = React.createClass({
    getInitialState: function() {
        return {friendRequest: [],orgRequest:[]};
    },
    loadFriendRequests :function()
    {
        $.ajax({
            url: "/friendrequest",
            success: function(data) {

                this.setState({friendRequest: data});
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
                this.setState({orgRequest: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    componentDidMount : function(){
        this.loadOrgRequests();
        this.loadFriendRequests();
        socket.on('friendrequest', this._friendrequest);
        socket.on('orgrequest', this._orgrequest);
    },
    _orgrequest(data){
        this.loadOrgRequests();
    },
    _friendrequest(data){
        this.loadFriendRequests();
    },
    pending_action:function(person,action)
    {
        $.ajax({
            url:"/friendrequest/" ,
            method: "POST",
            data:{mode:action,person:person},
            success: function(data) {

                this.loadFriendRequests();

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });

    },
    render: function() {

        if(this.state.friendRequest.length <=0) {
            $('.notification-counter').hide();
            return(
                <li><a href="#" className="align-center">You have no connection requests at this moment. &nbsp;&nbsp;</a></li>
            );
        }
        else {
            $('.notification-counter').show();
            $(".notification-counter").text(this.state.data.length);
            return (
                <li>
                    {this.state.friendRequest.map(person =>
                        <div id={person.username} className="friend-request-item" key={person.username}>
                            <div className="friend-request-left">
                                <div className="friend-request-image-wrap">
                                    <a href={'/profile/'+person.username}>
                                        <img  src={person.userImgUrl} className="friend-request-image" />
                                    </a>
                                </div>
                            </div>
                            <div className="friend-request-center" id="friend-request-info">
                                <a href={'/profile/'+person.username} className="body-link">
                                    <b><h3 className="no-margin-padding margin-top-5">{person.fullname}</h3></b>
                                </a>
                            </div>
                            <div className="friend-request-right">
                               <button className="btn btn-primary friend-request-button" onClick={this.pending_action.bind(this,person,"approve")} id="pending-action">Accept</button>
                               <button className="btn btn-primary friend-request-button margin-top-10" onClick={this.pending_action.bind(this,person,"deny")}  id="pending-action">Deny</button>
                            </div>
                            <div className="clear"></div>
                        </div>
                    )}

                </li>

            );
        }
    }
});

$( document ).ready(function() {
    ReactDOM.render(<FriendRequest />, document.getElementById('friendrequest'));
});

var Notification = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    loadRequests :function()
    {
        $.ajax({
            url: "/friendrequest",
            success: function(data) {

                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    componentDidMount : function(){
        socket.on('friendrequest', this._friendrequest);
        socket.on('orgrequest', this._orgrequest);
     },
    _orgrequest(data){

    },
    _friendrequest(data){
         console.log(data);
     },
    render: function() {

        if(this.state.data.length >0)
            return <div className="notification-badge"></div>
        else
        return <div></div>;


    }
});
$( document ).ready(function() {
    //if (document.getElementById('notification-request') != null) {
        ReactDOM.render(<Notification />, document.getElementById('notification-request'));
    //}
});