/**
 * Created by hroshandel on 2016-01-19.
 */
var FriendRequest = React.createClass({
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
       setInterval( this.loadRequests, 5000);

    },
    pending_action:function(person,action)
    {
        $.ajax({
            url:"/friendrequest/" ,
            method: "POST",
            data:{mode:action,person:person},
            success: function(data) {

                this.loadRequests();

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });

    },
    render: function() {

        if(this.state.data.length <=0) {
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
                    {this.state.data.map(person =>
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
                                <div className="no-margin-padding margin-top-5">{person.work_title} @ {person.company}</div>
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

ReactDOM.render(<FriendRequest />, document.getElementById('friendrequest'));


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
        setInterval( this.loadRequests, 5000);

    },
    render: function() {

        if(this.state.data.length >0)
            return <div className="notification-badge"></div>
        else
        return <div></div>;


    }
});

ReactDOM.render(<Notification />, document.getElementById('notification-request'));