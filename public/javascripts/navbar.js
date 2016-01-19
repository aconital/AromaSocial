/**
 * Created by hroshandel on 2016-01-19.
 */
var FriendRequest = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
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
    pending_action:function(person,action)
    {
        $.ajax({
            url:"/friendrequest/" ,
            method: "POST",
            data:{mode:action,person:person},
            success: function(data) {

                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });

    },
    render: function() {

        return (
            <ul id="friendrequest-menu" class="dropdown-menu" aria-labelledby="dropdownMenuDivider">
                {this.state.data.map(person =>
                     <li>
                        <div className="col-lg-3">
                            <a href={'/profile/'+person.username}> <img  src={person.userImgUrl} className="img-circle newsfeed-profile-pic" /></a>
                        </div>
                        <div className="col-lg-5">
                            <div>{person.fullname}</div>
                            <div>{person.workTitle}</div>
                            <div>{person.company}</div>
                            </div>
                        <div className="col-lg-4">
                            <div><a onClick={this.pending_action.bind(this,person,"approve")} id="pending-action"><span id="pending-accept" className="glyphicon glyphicon-ok" aria-hidden="true"></span></a> <a onClick={this.pending_action.bind(this,person,"deny")}  id="pending-action"><span id="pending-deny" className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>

                        </div>

                    </li>
                    )}

            </ul>

        );
    }
});

React.render(<FriendRequest />, document.getElementById('friendrequest'));