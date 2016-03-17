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
       setInterval( this.loadRequests, 2000);

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

        if(this.state.data.length <=0)
            return(
                <li><div className="empty-list">You have no request at this moment</div></li>
            ) ;
        else
        return (
            <li>
                {this.state.data.map(person =>
                        <div id={person.username} className="row friendrequest" key={person.username}>
                            <div className="col-lg-3">
                                <a href={'/profile/'+person.username}> <img  src={person.userImgUrl} className="friendrequest-pic" /></a>
                            </div>
                            <div className="col-lg-4" id="friendrequest-name">
                                <div>{person.fullname}</div>
                            </div>
                            <div className="col-lg-5" id="friendrequest-actions">
                               <button className="pending"onClick={this.pending_action.bind(this,person,"approve")} id="pending-action">Accept</button> <button className="pending" onClick={this.pending_action.bind(this,person,"deny")}  id="pending-action">Deny</button>

                            </div>

                        </div>
                )}

            </li>

        );
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
        setInterval( this.loadRequests, 2000);

    },
    render: function() {

        if(this.state.data.length >0)
            return <div className="notification-badge"></div>
        else
        return <div></div>;


    }
});

ReactDOM.render(<Notification />, document.getElementById('notification-request'));