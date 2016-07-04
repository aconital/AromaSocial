/**
 * Created by hroshandel on 6/15/2016.
 */
var Home = React.createClass({
    getInitialState: function() {
        return {others:[],discussion:null}
    },
    componentWillMount : function() {
        socket.on('DiscussionPostReceived', this._PostAdded);
        socket.on('DiscussionPostDeleted',this._PostDeleted);
        this.loadOtherDiscussions();
        var discussionsUrl= "/organization/"+orgName+"/discussions/"+discId+"/1";

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
    _PostAdded: function(data)
    {   var post= data.post;
        var disc= this.state.discussion;
        disc.posts.push(post);
        this.setState({discussion:  disc});

    },
    _PostDeleted: function(data)
    {
        var postId= data.postId;
        var disc= this.state.discussion;
        disc.posts=_.without( disc.posts, _.findWhere( disc.posts, {id: postId}));
        this.setState({discussion:  disc});

    },
    loadOtherDiscussions:function()
    {
        var otherDiscussionsUrl= "/organization/"+orgName+"/discussions";
        $.ajax({
            type: 'GET',
            url: otherDiscussionsUrl,
            success: function(data) {
                console.log(data);
                this.setState({ others: data.discussions });

            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve discussions!");
            }.bind(this)
        });
    },
    render:function(){
        var discussion= "";
       if(this.state.discussion != null) {

           discussion = <Discussion discId={this.state.discussion.id} topic={this.state.discussion.topic}
                                    createdAt={this.state.discussion.created} madeBy={this.state.discussion.madeBy}
                                    posts ={this.state.discussion.posts} key={this.state.discussion.id}>{this.state.discussion.content.msg}</Discussion>;
       }
        var others ="";
        if(this.state.others != undefined) {
            if(this.state.others.length>1) {
                others = this.state.others.map(function (other, i) {
                    if (discId != other.id && i < 6)
                        return (
                            <a href={"/organization/"+orgName+"/discussions/"+other.id}
                               className="list-group-item groups-list">{other.topic}</a>
                        );
                });
            }
            else
                others = <a className="list-group-item groups-list">No other discussion available!</a>

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
                        <a href={"/organization/"+orgName} className="btn btn-panel action_btn" value="Create Discussion"><span className="nfButton"><i className="fa fa-arrow-left" aria-hidden="true"></i> Back To Organization</span></a>
                    </div>
                    <div className = "createorg_panel">
                        <span className="btn btn-panel createorg_btn"><span className="nfButton"><i className="fa fa-comments-o" aria-hidden="true"></i> Recent Discussions</span></span>
                    </div>
                    <div className = "panel search-panel your-groups">
                        <div className="list-group">
                            {others}
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
    deleteDiscussion:function(discId)
    {   console.log(discId);
        swal({   title: "Are you sure?",
            text: "You will not be able to recover this discussion and its posts!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            loseOnConfirm: false },
            function(){
                $.ajax({
                    type: 'DELETE',
                    url: "/organization/"+orgId+"/discussions/",
                    data:{discId:discId,orgName:orgName},
                    success: function(data) {
                        swal("Deleted!", "Your Discussion has been deleted.", "success");
                        window.location.replace(data.url)
                    }.bind(this),
                    error: function(xhr, status, err) {
                        console.error("Couldn't Retrieve discussions!");
                    }.bind(this)
                });
            });
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
                    <div className="col-xs-8 col-lg-9 discussion-user-info">
                        <a href={"/profile/"+this.props.madeBy.username} className="body-link"><h4 className="margin-top-bottom-5">{this.props.madeBy.fullname}</h4></a>
                        <p className="discussion-about">{this.props.madeBy.about}</p>
                        <p className="discussion-Date">{this.state.createdAt}</p>
                    </div>
                    <div className="col-xs-1 col-lg-1">
                        { username == this.props.madeBy.username? <a onClick={this.deleteDiscussion.bind(this,this.props.discId)} className="discussion-remove"><i className="fa fa-times" aria-hidden="true"></i></a>:""}
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
     deletePost:function(postId)
     {
            swal({   title: "Are you sure?",
                    text: "You will not be able to recover this post!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    closeOnConfirm: false },
                function(){
                    $.ajax({
                        type: 'DELETE',
                        url: "/organization/"+orgId+"/discussions/"+discId,
                        data:{postId:postId},
                        success: function(data) {
                            swal("Deleted!", "Your post has been deleted.", "success");
                        }.bind(this),
                        error: function(xhr, status, err) {
                            console.error("Couldn't Retrieve discussions!");
                        }.bind(this)
                    });
                });
     },
    render:function(){

        return (
            <div  className="row post-row" id="item-list">
                <div className="col-xs-3 col-lg-2 discussion-user-img">
                    <a href={"/profile/"+this.props.from.username}><img src={this.props.from.img} className="discussion-userImg" /></a>
                </div>
                <div className="col-xs-8 col-lg-9 discussion-user-info">
                    <a href={"/profile/"+this.props.from.username} className="body-link"><h4 className="margin-top-bottom-5">{this.props.from.name}</h4></a>
                    <p className="discussion-about">{this.props.from.about}</p>
                    <p className="discussion-Date">{this.state.createdAt}</p>
                </div>
                <div className="col-xs-1 col-lg-1">
                    { username == this.props.from.username? <a onClick={this.deletePost.bind(this,this.props.postId)} className="discussion-remove"><i className="fa fa-times" aria-hidden="true"></i></a>:""}
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
            url: '/organization/'+orgName+'/discussions/'+discId,
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