var Comment = React.createClass({
  render: function() {
	var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="comment">
      	<div className="row">
	      	<div className="authorDiv col-sm-10">
		        <h2 className="commentAuthor">
		          {this.props.author}
		        </h2>
	        </div>
	        <div className="deleteComment col-sm-2"><RemoveCommentButton clickHandler={this.removeComment} postid={this.props.postid}/></div>
        </div>
        <div className="row">
        <div className="commentText">
        	<span dangerouslySetInnerHTML={{__html: rawMarkup}} />
        </div>
        </div>
      </div>
    );
  },
  removeComment: function(){
	  console.log("remove comment - " + this.props.postid);
	  $.ajax({
	      url: this.props.url,
	      dataType: 'json',
	      type: 'POST',
	      data: {"postid": this.props.postid},
	      cache: false,
	      success: function(data) {
	        this.setState({data: data});
	      }.bind(this),
	      error: function(xhr, status, err) {
		    console.log()
	        console.error(this.props.url, status, err.toString());
	      }.bind(this)
	  });
  }
});

var RemoveCommentButton = React.createClass({
	render: function(){
		return(
			<a className="deleteComment" href="javascript:void(0)" onClick={this.props.clickHandler} id={this.props.postid}><img className="close" src="images/close.png"/></a>
		);
	}
});


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
	    console.log()
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
	  var commentNodes = this.props.data.map(function (comment) {
      return (
        <Comment author={comment.author} postid={comment.postid} url="/removeComment">
          {comment.text}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});


var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
	this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
        <form className="commentForm chat" onSubmit={this.handleSubmit}>
	        <input id="author-form" type="text" placeholder="Your name" ref="author"/>
	        <textarea placeholder="Say something..." ref="text"/>
	        <button id="send" type="submit" value="Post">Post </button>
		</form>
    );
  }
});

$( document ).ready(function() {
  ReactDOM.render(
    <CommentBox url="/comments.json" pollInterval={2000} />,
    document.getElementById('content')
  );
});