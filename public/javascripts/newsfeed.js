var NewsFeed = React.createClass({
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
  getInitialState: function() {
    return {data: [], groups:[{name: "UBC"}, {name: "Natural Scientists Of Canada"}]};
  },
  componentDidMount: function() {
    this.loadFeedFromServer();
    //this.loadGroupsFromServer();
    //setInterval(this.loadPublicationsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="newsfeedlist">
        <div className="row">
          <div className="col-xs-4 col-xs-offset-3">
            <NewsFeedList data={this.state.data}/>
          </div>
          <div className="col-xs-3">
            <div className = "panel search-panel your-groups">
              <h4 className="white">YOUR GROUPS</h4>
              <GroupsList groups={this.state.groups}/>
            </div>
          </div>
        </div>
      </div> 
    );
  }
});

var GroupsList = React.createClass({
  render: function(){
    var GroupNodes = this.props.groups.map(function(group){
      return (<Group groupname={group.name}/>);
    });
    return(
      <div className="list-group">
        {GroupNodes}
      </div>
    );
  }
});

var Group = React.createClass({
  render: function(){
    return(
      <a href="organization/AJgSwufvvO" className="list-group-item groups-list">{this.props.groupname} <span aria-hidden="true">{String.fromCharCode(215)}</span></a>
    );
  }
});

var NewsFeedList = React.createClass({
  render: function() {
	  var NewsFeedNodes = this.props.data.map(function (item) {
  	  console.log(item);
  	  var jsonString = JSON.stringify(item.hashtags);
  	  var author = item.author;
  	  if(author==""){
    	  author = item.username;
  	  }
      return (
        <Update filename={item.filename} type={item.type} tags={jsonString} title={item.title} date={item.date} 
          description={item.description} author={author} username={item.username} year={item.year} img={item.userImg}>
        </Update>
      );
    });
    return (
      <div className="publicationList" id="container">

          {NewsFeedNodes}

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
    
    var profileurl = "/profile/"+ this.props.username;
    
    return (

      <div className="update">
        <hr/>
        <div className="row">
          <div className="col-xs-2">
            <a href={profileurl}><img src={this.props.img} alt="" className="img-circle newsfeed-profile-pic"/></a>
          </div>
          <div className="col-xs-8">
            <a href={profileurl} className="nostyle"><h5 className="non-inline">{this.props.username}</h5></a>
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
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showPublication}>SEE FULL TEXT</a>
            </div>
          </div>
        </div>
      </div>
    );
  },
  showPublication: function(){
    var author = this.props.author;
    if (author ==""){
      author = this.props.username;
    }
    showPublicationNewsFeed(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.username, this.props.img);
  }

});


React.render(
  <NewsFeed url={getNewsFeedUrl} username={user}/>,
  document.getElementById('content')
);

function showPublicationNewsFeed(pubid, datatype, title, year, postid, filename, tags, date, description, author, user, profilepic){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  var search = false;
  React.render(<Zoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} search={search} user={user} profilepic={profilepic}/>, document.getElementById("content"));
}