Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");

var NewsFeed = React.createClass({
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
    return {
      data: [],
      load: "visible",
      main: "invisible"
    };
   },
  loadFeedFromServer: function() {
    console.log(this.props.url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
	    console.log()
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  loadGroupsFromServer: function(){
    $.ajax({
      url: this.props.groupsurl,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({groups: data});
      }.bind(this),
      error: function(xhr, status, err) {
	    console.log()
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  observe: function() {
    return {
      organizations: (new Parse.Query('Relationship').equalTo("userId", {__type: "Pointer",
                                                                        className: "_User",
                                                                        objectId: this.props.userId}))
    };
  },
  componentDidMount: function() {
    this.loadFeedFromServer();
  },
  render: function() {
    return (
      <div className="container-newsfeed">
        <div className="row">
          <div className="col-xs-8">
            {this.state.data.map(function(item) {
              return (<NewsFeedList itemId={item.itemId}
                                    objId={item.objId}
                                    userName={item.username}
                                    fullname={item.fullname}
                                    userImg={item.userImg}
                                    type={item.type}
                                    date={item.date}
                                    year={item.year}
                                    filename={item.filename}
                                    title={item.title}
                                    description={item.description}
                                    upload={item.upload}
                                    hashtags={item.hashtags} />);
            })}
          </div>
          <div className="col-xs-4">
            <div className = "panel search-panel your-groups">
              <h4 className="white">ORGANIZATIONS</h4>
              {this.data.organizations.map(function(organization) {
                  return (<OrganizationList organizationId={organization.orgId.objectId} organizationName={organization.orgId.name}/>);
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var OrganizationList = React.createClass({
  mixins: [ParseReact.Mixin],
  observe: function() {
    return {
      organization: (new Parse.Query('Organization').equalTo("objectId", this.props.organizationId).limit(1))
    };
  },
  render: function(){
    return(
    <div className="list-group">
      <a href={"organization/" + this.props.organizationId} className="list-group-item groups-list">&#x25cf; {this.props.organizationName}</a>
    </div>
    );
  }
});

// <b>Abstract:</b> {this.props.description.substr(0,250)}... <a href={"/" + typeLink + "/" + this.props.itemId} className="body-link">Show Full Abstract</a><br/>

var NewsFeedList = React.createClass({

  showMore: function() {
    var itemType = this.props.type;
    var author = this.props.author;

    if (itemType == "pub") {
      window.location.href="/publication/" + this.props.objId['objectId'];
    }
    else if (itemType == "mod") {
      window.location.href="/model/" + this.props.objId['objectId'];
    }

    else if (itemType == "data") {
      window.location.href="/data/" + this.props.objId['objectId'];
    }
    return false;
  },

  render: function() {
    var date = moment(this.props.date).format("MMMM D, YYYY");
    if (this.props.type=="pub"){ type="Publication"; typeLink="publication"; }
    else if (this.props.type=="mod"){ type="Model"; typeLink="model"; }
    else if (this.props.type=="data"){ type="Data"; typeLink="data"; }
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
            <div className="item-box-left">
                // <img src={this.props.image_URL} className="contain-image-preview" />
            </div>
            <div className="item-box-right">
                <a href="#" onClick={this.showMore} className="body-link"><h3 className="no-margin-top">{this.props.title}</h3></a>
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
  	console.log(this.props.tags);
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

    if (itemType == "pub") {
      window.location.href="/publication/" + this.props.objId['objectId'];
      //showPublicationNewsFeed(this.props.itemId, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.username, this.props.img);
    }
    else if (itemType == "mod") {
      window.location.href="/model/" + this.props.objId['objectId'];
      //showModelNewsFeed();
    }

    else if (itemType == "data") {
      window.location.href="/data/" + this.props.objId['objectId'];
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


ReactDOM.render(
  <NewsFeed url={getNewsFeedUrl} userName={userName} userId={userId}/>,
  document.getElementById('content')
);

function showPublicationNewsFeed(pubid, datatype, title, year, postid, filename, tags, date, description, author, user, profilepic){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  var search = false;
  React.render(<Zoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} search={search} user={user} profilepic={profilepic}/>, document.getElementById("content"));
}