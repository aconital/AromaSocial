var NewsFeed = React.createClass({
  getInitialState: function() {
      return {
          organizations: [],
          data: []
      };
   },
  componentWillMount: function() {
      socket.on('commentReceived', this._reloadComments);
      $.ajax({
          url: '/newsfeeddata',
          dataType: 'json',
          cache: false,
          success: function(data) {
              this.setState({data: data});
          }.bind(this),
          error: function(error) {
              console.error(error.toString());
          }.bind(this)
      });
      $.ajax({
          url: '/organizations',
          dataType: 'json',
          cache: false,
          success: function(data) {
              this.setState({organizations: data});
          }.bind(this),
          error: function(error) {
              console.error(error.toString());
          }.bind(this)
      });
  },

  createOrg: function() {
    window.location = '/create/organization';
  },

  _reloadComments: function(data) {
      var feedId= data.feedId;
      var feedNumber=data.feedNumber;
      var comment= data.comment;
      var feedItems= this.state.data.slice();
               //TODO UPDATE DOESNT WORK
                feedItems[feedNumber].comments.push(comment);
                this.setState({data:  feedItems});
  },

  render: function() {
      return (
          <div className="container-newsFeed">
              <div className="row">
                  <div className="col-xs-8">
                      {this.state.data.map(function(item, i) {
                          return (
                              <div>
                                  <NewsFeedList key={i}
                                        date={item.date}
                                        feedId={item.feedId}
                                        objectTitle={item.objectTitle}
                                        objectURL={item.objectURL}
                                        objectPicture={item.objectPicture}
                                        description={item.description}
                                        adderName={item.adderName}
                                        adderPicture={item.adderPicture}
                                        adderURL={item.adderURL}
                                        comments={item.comments}
                                        message={item.message} />
                                    <CommentBox key={"box"+item.feedId} feedId ={item.feedId} comments= {item.comments}/>
                                    <CommentForm key={"form"+item.feedId} feedNumber={i} feedId ={item.feedId} />
                                </div>);
                      })}
                  </div>
                      <div className="col-xs-4">
                          <div className = "createorg_panel">
                        <button onClick={this.createOrg} className="btn btn-panel createorg_btn" value="Create Research Lab or Network"><span className="nfButton"><i className="fa fa-plus" aria-hidden="true"></i> Create Organizational Homepage</span></button>
                      </div>
                        <div className = "panel search-panel your-groups">
                        <h4 className="white"><span className="nfButton">Your Networks</span></h4>
                          {this.state.organizations.map(function(item, i) {
                              return (<div className="list-group" key={i}>
                                  <a href={"organization/" + item.orgLink} key={i} className="list-group-item groups-list">&#x25cf; {item.orgName}</a>
                              </div>);
                          })}
                    </div>

                  </div>
              </div>
        </div>
      );
    }
});

// <b>Abstract:</b> {this.props.description.substr(0,250)}... <a href={"/" + typeLink + "/" + this.props.itemId} className="body-link">Show Full Abstract</a><br/>

var NewsFeedList = React.createClass({
    getInitialState: function() {
        return {createdAt:""};
    },
    componentWillMount: function() {
        this.setState({createdAt:moment(this.props.date).fromNow()});
        setInterval(this.refreshTime, 30000);
    },
    refreshTime: function () {
        this.setState({createdAt:moment(this.props.date).fromNow()});
    },
    truncate: function(text) {
        var maxLength = 140;
        var truncated = text;
        if (truncated.length > maxLength) {
            truncated = truncated.substr(0,maxLength-3) + "...";
        }
        return truncated;
    },

    render: function() {
        return (
            <div className="item-panel-newsFeed contain-panel-newsFeed">
                <div className="row">
                    <div className="col-xs-1 col-xs-1-5 no-padding">
                        <a href={this.props.adderURL}><img src={this.props.adderPicture} className="img-circle newsfeed-profile-pic"/></a>
                    </div>
                    <div className="col-xs-10 col-xs-10-5 no-padding-right">
                        <a href={this.props.adderURL} className="nostyle"><h3 className="non-inline">{this.props.adderName}</h3></a>
                        <p className="commentDate">{this.state.createdAt}</p>
                        <h4 className="black non-inline">{this.props.message}</h4>
                        <div className="item-box">
                            <div className="item-box-left"><img src={this.props.objectPicture} className="contain-image-preview" /></div>
                            <div className="item-box-right">
                                <a href={this.props.objectURL} className="body-link"><h3 className="no-margin-top nfHeader">{this.props.objectTitle}</h3></a>
                                <pre className="hide-if-empty"><span className="font-15">{this.truncate(this.props.description)}</span></pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var CommentBox = React.createClass({
  getInitialState: function() {
    return {limit:3};
  },
  showMore:function() {
      totalLength= this.props.comments.length;
      var currentLimit= this.state.limit;
      currentLimit+=5;
      var limit =Math.min(currentLimit, totalLength);
      this.setState({ limit: limit});
  },
  render: function() {

      var cls=this.props.comments.slice(0,this.state.limit);

          return (
        <div className="commentBox">
            <CommentList data={cls} />

            {this.props.comments.length>this.state.limit ? <div><a onClick={this.showMore} >show more</a></div>: null}
        </div>
    );
  }
});
var CommentList = React.createClass({
    getInitialState: function() {
        return {comments: []};
    },
    componentWillMount: function() {
        this.setState({comments: this.props.data});
    },
  render: function() {
    var commentNodes="";

    if(this.props.data.length >0) {
       commentNodes = this.props.data.map(function (comment) {
        return (
            <Comment createdAt={comment.createdAt} from={comment.from} key={comment.id}>
              {comment.content.msg}
            </Comment>
        );
      });
    }
    return (
        <div className="commentList">
          {commentNodes}
        </div>
    );
  }
});
var Comment = React.createClass({
    getInitialState: function() {
        return {from: {},children:{},createdAt:""};
    },
    componentWillMount: function() {
        this.setState({from: this.props.from,children:this.props.children.toString(),createdAt:moment(this.props.createdAt).fromNow()});
        setInterval(this.refreshTime, 30000);
    },
    refreshTime: function () {
      this.setState({createdAt:moment(this.props.createdAt).fromNow()});
    },
  rawMarkup: function() {
    var rawMarkup = marked(this.state.children, {sanitize: true});
    return { __html: rawMarkup };
  },
  render: function() {

    return (
        <div className="comment">
          <div className="row">
            <div className="col-xs-1 comment-pic-col">
              <a href={"/profile/" + this.state.from.username}><img className="comment-pic" src={this.state.from.img} alt=""/></a>
            </div>
            <div className="col-xs-5 comment-name">
              <p className="commentAuthor">{this.state.from.name}</p>
              <p className="commentDate">{this.state.createdAt}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-xs-12 comment-content">
              <span dangerouslySetInnerHTML={this.rawMarkup()} />
            </div>
          </div>

        </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {feedNumber:'',feedId: '', text: ''};
  },
  componentWillMount: function() {
        this.setState({feedNumber:this.props.feedNumber,feedId: this.props.feedId});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text;
    if (!text) {
      return;
    }
      $.ajax({
          url: '/comment',
          method:'post',
          data: {content: text, feedId: this.state.feedId,feedNumber:this.state.feedNumber},
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
        <div className="row commentForm">
          <div className="col-xs-1">
            <img className="comment-pic" src={userImg}/>
          </div>
          <div className="col-xs-11">
            <form  onSubmit={this.handleSubmit}>
              <input
                  className="comment-input"
                  type="text"
                  cols="40" rows="5"
                  placeholder="Say something..."
                  value={this.state.text}
                  onChange={this.handleTextChange}
                  />
                <input type="submit"
                       className="comment-submit"
                       tabIndex="-1" />
            </form>
          </div>
        </div>
    );
  }
});




var Update = React.createClass({
  render: function() {
	  //var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    var date = moment(this.props.date).format("MMM D, YYYY");
    var tagString = this.props.tags.replace(/\[\"/g, "");
    tagString = tagString.replace(/\",\"/g, " ");
    tagString = tagString.replace(/\"\]/g,"");
    this.props.tagString = tagString;
    
    var type=this.props.type;
    if (type=="pub"){
      type="publication";
    }
    else if (type=="mod") {
      type="model";
    }
    
    var profileurl = "/profile/"+ this.props.userName;
    
    return (

      <div className="item-panel contain-panel-newsfeed update">
        <div className="row">
          <div className="col-xs-2">
            <a href={profileurl}><img src={this.props.img} alt="" className="img-circle newsfeed-profile-pic"/></a>
          </div>
          <div className="col-xs-8">
            <a href={profileurl} className="nostyle"><h5 className="non-inline">{this.props.userName}</h5></a>
            <h5 className="black non-inline">added a {type}</h5>
          </div>
          <div className="col-xs-2 no-right-padding">
            <p className="newsfeed-date">{date}</p>
          </div>
        </div>
        <div className="row">
          <div className="col-xs-10 col-xs-offset-2 no-right-padding">
            <div className="bs-callout bs-callout-warning">
              <h3 className="black non-inline">{this.props.title}</h3>
              <p className="newsfeed-date grey non-inline">{this.props.year}</p>
              <p className="black smaller">{this.props.author}</p>
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showMore}>SEE FULL TEXT</a>
            </div>
          </div>
        </div>
      </div>
    );
  },
  showMore: function() {
    var itemType = this.props.type;
    var author = this.props.author;
    if (author ==""){
      author = this.props.username;
    }

    switch (itemType) {
      case "pub":
        window.location.href="/publication/" + this.props.objId['objectId'];
        break;
      case "mod":
        window.location.href="/model/" + this.props.objId['objectId'];
        break;
      case "dat":
        window.location.href="/data/" + this.props.objId['objectId'];
        break;
      case "project":
        window.location.href="/project/" + this.props.objId;
        break;
      case "book":
        window.location.href="/publication/book/" + this.props.objId;
        break;
      case "conference":
        window.location.href="/publication/conference/" + this.props.objId;
        break;
      case "journal":
        window.location.href="/publication/journal/" + this.props.objId;
        break;
      case "patent":
        window.location.href="/publication/patent/" + this.props.objId;
        break;
      case "report":
        window.location.href="/publication/report/" + this.props.objId;
        break;
      case "thesis":
        window.location.href="/publication/thesis/" + this.props.objId;
        break;
      case "unpublished":
        window.location.href="/publication/unpublished/" + this.props.objId;
        break;
      case "equipment":
        window.location.href="/equipment/" + this.props.objId;
        break;
      default:
        break;
    }
  },
  showPublication: function(){
    var author = this.props.author;
    if (author ==""){
      author = this.props.userName;
    }
    showPublicationNewsFeed(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.userName, this.props.img);
  }

});

$( document ).ready(function() {
  ReactDOM.render(
    <NewsFeed url={getNewsFeedUrl} userName={userName} userId={userId}/>,
    document.getElementById('content')
  );
});

function showPublicationNewsFeed(pubid, datatype, title, year, postid, filename, tags, date, description, author, user, profilepic){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  var search = false;
  $( document ).ready(function() {
    ReactDOM.render(<Zoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
      description={description} author={author} year={year} pubid={pubid} search={search} user={user} profilepic={profilepic}/>, document.getElementById("content"));
  });
}