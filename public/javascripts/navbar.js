/**
 * Created by hroshandel on 2016-01-19.
 */

var NavBar = React.createClass({

    render:function()
    {
        return (
            <nav className="navbar navbar-default">
                <div className="container-fluid" >
                    <div className="navbar-header">
                        <button type="button" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false" className="navbar-toggle collapsed"><span className="sr-only">Toggle Navigation</span><span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span></button><a href="/newsfeed" className="navbar-brand"><img alt="RT" src="/images/beaker-invert.png" width="30"/></a>
                    </div>
                        <div id="bs-example-navbar-collapse-1" className="collapse navbar-collapse">
                            <ul className="nav navbar-nav">
                                <li className="dropdown">
                                    <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                        <span className="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> Menu <span className="caret"></span>
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li><a href="/create/organization">Create Organization</a></li>
                                        <li><a href="/report">Report Problem</a></li>
                                    </ul>
                                </li>
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                <li><a href={"/profile/"+this.props.currentUsername}><img src={this.props.currentUserImg} alt="" width="34px" className="img-circle"/></a></li>
                                    <li className="dropdown">
                                        <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                            <span className="logout-button"><i className="fa fa-user-plus"></i></span>
                                        </a>
                                        <FriendRequest/>

                                    </li>
                                    <li className="dropdown"><a href="/signout" role="button" className="logout-button"><span className="glyphicon glyphicon-log-out body-link"></span></a>
                                    </li>
                                </ul>
                                <form role="search" method="post" action="/searchpage" className="navbar-form navbar-right">
                                    <div className="form-group form-inline" >
                                        <div className="input-group purple" >
                                            <input type="text" name="searchQuery" placeholder="Search..." className="form-control search-bar"/>
                                            <button type="submit" className="btn btn-primary btn-search"><span aria-hidden="true" className="glyphicon glyphicon-search"></span></button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </nav>
        );
    }
});

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
            <ul id="friendrequest-menu" className="dropdown-menu" aria-labelledby="dropdownMenuDivider">
                {this.state.data.map(person =>
                     <li id={person.username}>
                         <div className="row">
                        <div className="col-lg-3">
                            <a href={'/profile/'+person.username}> <img  src={person.userImgUrl} className="img-circle newsfeed-profile-pic" /></a>
                        </div>
                        <div className="col-lg-5">
                            <div>{person.fullname}</div>

                            </div>
                        <div className="col-lg-4">
                            <div><a onClick={this.pending_action.bind(this,person,"approve")} id="pending-action"><span id="pending-accept" className="glyphicon glyphicon-ok" aria-hidden="true"></span></a> <a onClick={this.pending_action.bind(this,person,"deny")}  id="pending-action"><span id="pending-deny" className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>

                        </div>
                       </div>
                    </li>
                    )}

            </ul>

        );
    }
});

ReactDOM.render(<NavBar currentUsername={userName} currentUserImg={userImg} />, document.getElementById('navbar'));