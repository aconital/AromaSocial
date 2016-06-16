/**
 * Created by hroshandel on 6/15/2016.
 */
var Home = React.createClass({
    getInitialState: function() {
        return {discussion:null}
    },
    componentWillMount : function() {
        socket.on('DiscussionPostReceived', this._reloadPosts);

        var discussionsUrl= "/organization/"+orgId+"/discussions/"+discId+"/1";

        $.ajax({
            type: 'GET',
            url: discussionsUrl,
            success: function(data) {
                this.setState({ discussion: data.discussion });

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve discussions!");
            }.bind(this)
        });
    },
    _reloadPosts: function(data)
    {
        var post= data.post;
        var disc= this.state.discussion;
        disc.posts.push(post);
        this.setState({discussion:  disc});

    },
    render:function(){
        var discussion= "";
       if(this.state.discussion != null) {
           discussion = <Discussion discId={this.state.discussion.id} topic={this.state.discussion.topic}
                                    createdAt={this.state.discussion.created} madeBy={this.state.discussion.madeBy}
                                    posts ={this.state.discussion.posts} key={this.state.discussion.id}>{this.state.discussion.content.msg}</Discussion>;
       }
        return (
            <div className="row">
                <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8">
                    <div className="items-list discussion-list">
                        {discussion}
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <h4 className="discussion-form-headline">Reply to discussion</h4>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                {this.state.discussion!=null?<CommentForm key={this.state.discussion.id} feedId ={this.state.discussion.id} />:""}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-3 col-md-3 col-lg-3">
                    <div className = "createorg_panel">
                        <button className="btn btn-panel createorg_btn" value="Create Discussion"><span className="nfButton"><i className="fa fa-calendar-plus-o" aria-hidden="true"></i> Create Event</span></button>
                    </div>
                    <div className = "panel search-panel your-groups">
                        <h4 className="white"><span className="nfButton">Upcoming Events</span></h4>
                        <div className="list-group">
                            <a href="#"  className="list-group-item groups-list">&#x25cf; BBQ Party</a>
                            <a href="#"  className="list-group-item groups-list">&#x25cf; All You can eat sushi</a>
                        </div>
                    </div>

                    <div className="row">
                        <div>
                            <h4><span className="nfButton">Members <small>(<a href="#">124</a>)</small></span></h4>
                        </div>
                        <div className="member-section">
                            <ul className="thumbnail-list">
                                <li><img src="http://159.203.60.67:1336/parse/files/development/f288f2f08b4f197c3d077fce068690d9_user_picture.jpg" /></li>
                                <li><img src="http://159.203.60.67:1336/parse/files/development/96c7110632da4e71812e74f8d2206bd7_user_picture.jpg" /></li>
                                <li><img src="http://159.203.60.67:1336/parse/files/development/8e73c4c765a8dc93ae945883e21ef82e_user_picture.jpg" /></li>
                                <li><img src="http://159.203.60.67:1336/parse/files/development/51bc3e7b22434d0036dc3f8821e0f0ce_user.png" /></li>
                            </ul>
                        </div>
                        <div className = "createorg_panel">
                            <button className="btn btn-panel createorg_btn" value="Create Discussion"><span className="nfButton"><i className="fa fa-user-plus" aria-hidden="true"></i> Invite Members</span></button>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
});
var Discussion = React.createClass ({
    getInitialState: function() {
        return {createdAt:""};
    },
    componentDidMount: function() {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
        setInterval(this.refreshTime, 30000);
    },
    refreshTime: function () {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
    },
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children, {sanitize: true});
        return { __html: rawMarkup };
    },
    render:function(){
        var posts = this.props.posts.map(function (post) {
            return (
                <Post postId= {post.id} createdAt={post.createdAt} from={post.from} key={post.id}>
                    {post.content.msg}
                </Post>
            );
        });

        return (
            <div className="container">
                <div  className="row discussion-row" id="item-list">
                    <div className="col-xs-3 col-lg-2 discussion-user-img">
                        <a href={"/profile/"+this.props.madeBy.username}><img src={this.props.madeBy.imgUrl} className="discussion-userImg" /></a>
                    </div>
                    <div className="col-xs-9 col-lg-10 discussion-user-info">
                        <a href={"/profile/"+this.props.madeBy.username} className="body-link"><h4 className="margin-top-bottom-5">{this.props.madeBy.fullname}</h4></a>
                        <p className="discussion-about">{this.props.madeBy.about}</p>
                        <p className="discussion-Date">{this.state.createdAt}</p>
                    </div>
                    <div className="col-xs-12 col-lg-12">
                        <p ><a className="discussion-topic">{this.props.topic}</a></p>
                        <p className="discussion-content" dangerouslySetInnerHTML={this.rawMarkup()} />
                    </div>
                </div>
                {posts}
            </div>
        );
    }


});

var Post = React.createClass ({
    getInitialState: function() {
        return {createdAt:""};
    },
    componentDidMount: function() {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
        setInterval(this.refreshTime, 30000);
    },
    refreshTime: function () {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
    },
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children, {sanitize: true});
        return { __html: rawMarkup };
    },
    render:function(){

        return (
            <div  className="row post-row" id="item-list">
                <div className="col-xs-3 col-lg-2 discussion-user-img">
                    <a href={"/profile/"+this.props.from.username}><img src={this.props.from.img} className="discussion-userImg" /></a>
                </div>
                <div className="col-xs-9 col-lg-10 discussion-user-info">
                    <a href={"/profile/"+this.props.from.username} className="body-link"><h4 className="margin-top-bottom-5">{this.props.from.name}</h4></a>
                    <p className="discussion-about">{this.props.from.about}</p>
                    <p className="discussion-Date">{this.state.createdAt}</p>
                </div>
                <div className="col-xs-12 col-lg-12" >
                    <p className="discussion-content" dangerouslySetInnerHTML={this.rawMarkup()} />
                </div>
            </div>
        );
    }


});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {discId: '', text: ''};
    },
    componentWillMount: function() {
        this.setState({discId: this.props.discId});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var text = this.state.text;
        if (!text || text.trim()== "") {
            return;
        }
        $.ajax({
            url: '/organization/'+orgId+'/discussions/'+discId,
            method:'post',
            data: {content: text},
            success: function(data) {
                this.setState({text: ''});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    },
    render: function() {

        return (
            <div className="row discussionForm">
                <div className="col-xs-12">
                    <form>
                        <textarea
                            rows="8" cols="50"
                            className="discussion-input"
                            placeholder="Say something..."
                            value = {this.state.text}
                            onChange={this.handleTextChange}>
                            </textarea>
                        <a onClick={this.handleSubmit} className="submit-discussion">Submit</a>
                    </form>
                </div>
            </div>
        );
    }
});
ReactDOM.render(<Home />, document.getElementById('content'));