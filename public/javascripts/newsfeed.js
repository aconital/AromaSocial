var NewsFeed = React.createClass({
  getInitialState: function() {
      return {
          organizations: [],
          data: []
      };
   },
  componentWillMount: function() {
      $.ajax({
          url: '/newsfeeddata',
          dataType: 'json',
          cache: false,
          success: function(data) {
              this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
              console.error(this.props.url, status, err.toString());
          }.bind(this)
      });
      $.ajax({
          url: '/organizations',
          dataType: 'json',
          cache: false,
          success: function(data) {
              this.setState({organizations: data});
          }.bind(this),
          error: function(xhr, status, err) {
              console.error(this.props.url, status, err.toString());
          }.bind(this)
      });
  },
  createOrg: function() {
    window.location = '/create/organization';
  },

  render: function() {
      return (
          <div className="container-newsFeed">
              <div className="row">
                  <div className="col-xs-8">
                      {this.state.data.map(function(item) {
                        return (<NewsFeedList
                                              itemId={item.itemId}
                                              objId={item.objId}
                                              userName={item.username}
                                              fullname={item.fullname}
                                              userImg={item.userImg}
                                              image_URL={item.image_URL}
                                              type={item.type}
                                              date={item.date}
                                              year={item.year}
                                              filename={item.filename}
                                              title={item.title}
                                              description={item.description}
                                              upload={item.upload}
                                              keywords={item.keywords} />);
                      })}
                    </div>
                    <div className="col-xs-4">

                      <div className = "panel search-panel your-groups createorg_btn">
                        <button onClick={this.createOrg} className="btn btn-panel createorg_btn" value="Create Research Lab or Network">Create Research Lab or Network</button>;
                          </div>
                        <div className = "panel search-panel your-groups">
                        <h4 className="white">Your Labs & Networks</h4>
                          {this.state.organizations.map(function(item) {
                              return (<div className="list-group">
                                  <a href={"organization/" + item.orgId} className="list-group-item groups-list">&#x25cf; {item.orgName.split(".")[0]}</a>
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

  showMore: function() {
    var itemType = this.props.type;
    var author = this.props.author;
    console.log("TYPE FOR THIS GUY: ");
    console.log(itemType);
    console.log(this.props);
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

    // if (itemType == "pub") {
    //   window.location.href="/publication/" + this.props.objId['objectId'];
    // }
    // else if (itemType == "mod") {
    //   window.location.href="/model/" + this.props.objId['objectId'];
    // }

    // else if (itemType == "dat") {
    //   window.location.href="/data/" + this.props.objId['objectId'];
    // }
    return false;
  },

  render: function() {
    var date = moment(this.props.date).format("MMMM D, YYYY");
    switch (this.props.type) {
      case "pub":
        type="Publication"; 
        typeLink="publication";
        break;
      case "mod":
        type="Model"; 
        typeLink="model";
        break;
      case "dat":
        type="Data"; 
        typeLink="data";
        break;
      case "project":
        type="Project"; 
        typeLink="project";
        break;
      case "book":
        type="Book"; 
        typeLink="publication";
        break;
      case "conference":
        type="Conference";
        typeLink="publication";
        break;
      case "journal":
        type="Journal";
        typeLink="publication"
        break;
      case "patent":
        type="Patent";
        typeLink="publication"
        break;
      case "report":
        type="Report";
        typeLink="publication"
        break;
      case "thesis":
        type="Thesis";
        typeLink="publication"
        break;
      case "unpublished":
        type="Publication (Unpublished)";
        typeLink="publication"
        break;
      case "equipment":
        type="Equipment";
        typeLink="equipment"
        break;
      default:
        type="Default"; 
        typeLink="default";
        break;
    }
    // if (this.props.type=="pub"){ type="Publication"; typeLink="publication"; }
    // else if (this.props.type=="mod"){ type="Model"; typeLink="model"; }
    // else if (this.props.type=="dat"){ type="Data"; typeLink="data"; }
    if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
    else { var title = this.props.title; }
	return (
      <div className="item-panel-newsFeed contain-panel-newsFeed">
        <div className="row">
          <div className="col-xs-1 col-xs-1-5 no-padding">
            <a href={"/profile/" + this.props.userName}><img src={this.props.userImg} alt="" className="img-circle newsfeed-profile-pic"/></a>
          </div>
          <div className="col-xs-10 col-xs-10-5 no-padding-right">
            <a href={"/profile/" + this.props.userName} className="nostyle"><h3 className="non-inline">{this.props.fullname}</h3></a>
            <h4 className="black non-inline">Added a {type} on {date}</h4>
            <div className="item-box">
                {(this.props.type=="book" || this.props.type=="conference" || this.props.type=="journal" || this.props.type=="patent" || this.props.type=="report" || this.props.type=="thesis" || this.props.type=="unpublished") ? <div className="item-box-left"><img src="/images/paper.png" className="contain-image-preview" /></div> : <div className="item-box-left"><img src={this.props.image_URL} className="contain-image-preview" /></div>}
            <div className="item-box-right">
                <a href="#" onClick={this.showMore} className="body-link"><h3 className="no-margin-top nfHeader">{title}</h3></a>
                {(this.props.description=="undefined" || this.props.description=="") ? <div></div>:<pre className="hide-if-empty"> <span className="font-15 limit-text">{this.props.description}</span></pre>}
            </div>
            </div>
          </div>
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

    // if (itemType == "pub") {
    //   window.location.href="/publication/" + this.props.objId['objectId'];
    //   //showPublicationNewsFeed(this.props.itemId, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.username, this.props.img);
    // }
    // else if (itemType == "mod") {
    //   window.location.href="/model/" + this.props.objId['objectId'];
    //   //showModelNewsFeed();
    // }

    // else if (itemType == "data") {
    //   window.location.href="/data/" + this.props.objId['objectId'];
    // }
  },
  showPublication: function(){
    var author = this.props.author;
    if (author ==""){
      author = this.props.userName;
    }
    showPublicationNewsFeed(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.userName, this.props.img);
  }

});

ReactDOM.render(
  <NewsFeed url={getNewsFeedUrl} userName={userName} userId={userId}/>,
  document.getElementById('content')
);

function showPublicationNewsFeed(pubid, datatype, title, year, postid, filename, tags, date, description, author, user, profilepic){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  var search = false;
  ReactDOM.render(<Zoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} search={search} user={user} profilepic={profilepic}/>, document.getElementById("content"));
}