var ZoomPublication = React.createClass({
  loadPublicationFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
	      console.log();
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    //this.loadPublicationFromServer();
    //setInterval(this.loadPublicationsFromServer, this.props.pollInterval);
    //loadPDF();
    var wid = $("#zoom").width();
    var hei = parseFloat((wid).toFixed(2)) * 1.3;
    $('a.media').media({width:wid, height: hei});
  },
  render: function() {
    return (
      <div id="zoom">
        <Publication filename={this.props.filename} postid={this.props.postid} tags={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} datatype="Publication" url="/removePublication"/>
        <File data={this.state.data}/>
      </div>
    );
  }
});


var ZoomSearchResult = React.createClass({
  loadPublicationFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
	      console.log();
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    var wid = $("#zoom").width();
    var hei = parseFloat((wid).toFixed(2)) * 1.3;
    $('a.media').media({width:wid, height: hei});
  },
  render: function() {
    return (
      <div id="zoom">
        <LargerResult filename={this.props.filename} postid={this.props.postid} tags={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} datatype="Publication" user={this.props.user}/>
        <File/>
      </div>
    );
  }
});
     
var LargerResult = React.createClass({
  getInitialState: function() {
    return {show: false};
  },
  showDescription: function(event) {
    this.setState({show: !this.state.show});
  },
  render: function(){
    var text = this.state.show ? this.props.description : '';
    var profileurl = "/profile/"+this.props.user;
    return(
      <div className="result">
        
        <div className="row">
          <div className="col-xs-12 no-right-padding">
              <h3 className="black non-inline">{this.props.datatype}: {this.props.title}</h3>
              <p className="newsfeed-date grey non-inline">{this.props.year}</p>
              <p className="black smaller">{this.props.tags}</p>
          </div>
         
        </div>
        <div className="row author-click">
          <div className="col-xs-1 center-vertical">
            <a href={profileurl}><img src="/images/user.png" alt="" className="img-circle search-profile-pic"/></a>
          </div>
          <div className="col-xs-10 center-vertical-author">
            <a href={profileurl} className="black smaller nostyle">{this.props.author}</a>
          </div>   
        </div>
                      
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showDescription}>SEE DESCRIPTION </a><span> - </span>
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showPublication}>SEE FULL TEXT</a>
              <p>{text}</p>
        <hr/>
      </div>
    );
  },
  showPublication: function(){
    showPublicationSearch(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.searchphrase);
  }
});   

var File = React.createClass({
  render: function(){
    return(
      <div className="file">
        <hr/>
        <a className="media" href="/Untitled2015_06_23-13_27_10.pdf"></a> 
      </div>
    );
  }
});

var ProfileZoom = React.createClass({
  render: function(){
    return (
    <div className = "panel panel-default">
      <div className="row">
        <div className="col-sm-6">
          <button className="btn btn-default" onClick={this.showList}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>Back To Publications</button>
        </div>
      </div>
      <ZoomPublication url={this.props.url} filename={this.props.filename} postid={this.props.postid} tagString={this.props.tagString} title={this.props.title} date={this.props.date} 
      description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid}/>
    </div>);
  },
  showList: function(){
    revertToList();
  }
});

function revertToList(){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);

  React.render(
    <PublicationBox url={getPublicationUrl} username={user} myself={isMe}/>,
    document.getElementById('content')
  );
}

var Zoom = React.createClass({
  render: function(){
    return (
    <div className="row">
      <div className="col-sm-3">
        <button className="btn btn-default btn-back" onClick={this.showList}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>
      </div>
      <div className="col-sm-6">
        <div className = "panel panel-default panel-zoom">
          <ZoomSearchResult url={this.props.url} filename={this.props.filename} postid={this.props.postid} tagString={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} user={this.props.user}/>
        </div>
      </div>
    </div>
    );
  },
  showList: function(){
    if(this.props.search){
      revertToListSearch(this.props.searchphrase);
    }
    else{
      revertToNewsFeed();
    }
  }
});

function revertToListSearch(searchphrase){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);

  React.render(
    <SearchPage url={searchurl} tagString={searchphrase}/>,
    document.getElementById('content')
  );
  
}

var NewsFeedZoom = React.createClass({
  render: function(){
    return(
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <div className = "panel panel-default">
            <div className="row">
              <div className="col-sm-6">
                <button className="btn btn-default" onClick={this.showNewsFeed}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>Back To Newsfeed</button>
              </div>
            </div>
            <ZoomSearchResult url={this.props.url} filename={this.props.filename} postid={this.props.postid} tagString={this.props.tagString} title={this.props.title} date={this.props.date} 
            description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid}/>
          </div>
        </div>
      </div>
    );
  },
  showNewsFeed: function(){
    revertToNewsFeed(this.props.searchphrase);
  }
});

function revertToNewsFeed(){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);

  React.render(
    <NewsFeed url={getNewsFeedUrl} username={user}/>,
    document.getElementById('content')
  );
}

