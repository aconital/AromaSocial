

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
        <LargerPublication filename={this.props.filename} postid={this.props.postid} tags={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} datatype="Publication" url="/removePublication"/>
        <File data={this.state.data}/>
      </div>
    );
  }
});

var LargerPublication = React.createClass({
  render: function() {
	  //var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
  	console.log(this.props.tags);
    var date = moment(this.props.date).format("MMM D, YYYY");
    var tagString = this.props.tags.replace(/\[\"/g, "");
    tagString = tagString.replace(/\",\"/g, " ");
    tagString = tagString.replace(/\"\]/g,"");
    this.props.tagString = tagString;
    
    var date = moment(this.props.date).format("MMM D, YYYY");
    
    var description = this.props.description ? this.props.description : 'No description provided.';
    
    var deletePub;
    if(isMe == "true"){
      deletePub = <div className="deletePublication" id="deletepub"><RemovePublicationButton clickHandler={this.removePublication} postid={this.props.postid} 
              title={this.props.title} pubid={this.props.pubid}/>
            </div> ;
    }

    return ( 
      <div className="result">  
        <div className="row">
          <div className="col-xs-10 no-right-padding">
              <h3 className="black non-inline">{this.props.datatype}: {this.props.title}</h3>
              <p className="black smaller">{tagString}</p>
              <p className="newsfeed-date grey non-inline">{this.props.year}</p>
              <p className="black smaller">{this.props.author}</p>
          </div>
          <div className="col-xs-2">
            {deletePub}         
          </div>
        </div>
        <div className="row">
          <div className="col-xs-9 no-right-padding">
            <h4 className="black non-inline">DESCRIPTION</h4>
            <p>{description}</p>
          </div>
          <div className="col-xs-3">
            <p className="grey smaller">Uploaded: {date}</p>
          </div>
        </div>
      </div>
    );
  },
  removePublication: function(){
	  console.log("remove publication - " + this.props.postid);
	  
	  $.ajax({
	      url: this.props.url,
	      dataType: 'json',
	      type: 'DELETE',
	      data: {"id": this.props.pubid},
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
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} datatype="Publication" user={this.props.user}
          profilepic={this.props.profilepic}/>
        <File/>
      </div>
    );
  }
});
     
var LargerResult = React.createClass({
  render: function(){
    var text = this.props.description ? this.props.description : 'No description provided.';

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
            <a href={profileurl}><img src={this.props.profilepic} alt="" className="img-circle search-profile-pic"/></a>
          </div>
          <div className="col-xs-10 center-vertical-author">
            <a href={profileurl} className="black smaller nostyle">{this.props.author}</a>
          </div>   
        </div>
        <div className="row">   
          <div className="col-xs-12">      
            <h4 className="black non-inline">DESCRIPTION</h4>
            <p className="black lighter">{text}</p>
          </div>
        </div>
      </div>
    );
  }
});   

var File = React.createClass({
  render: function(){
    return(
      <div className="file" id="file">
        <hr/>
        <a className="media" href="/Untitled2015_06_23-13_27_10.pdf"></a> 
      </div>
    );
  }
});

var ProfileZoom = React.createClass({
  render: function(){
    return (
    <div className = "panel panel-default profile-panel">
      <div className="row">
        <div className="col-sm-6 marg-bottom">
          <button className="btn btn-default btn-back no-pad" onClick={this.showList}><span className="glyphicon glyphicon-chevron-left"></span>BACK</button>
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
        <button className="btn btn-default btn-back marg-left" onClick={this.showList}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></button>
      </div>
      <div className="col-sm-6">
        <div className = "panel panel-default panel-zoom">
          <ZoomSearchResult url={this.props.url} filename={this.props.filename} postid={this.props.postid} tagString={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} user={this.props.user} profilepic={this.props.profilepic}/>
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

function revertToNewsFeed(){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);

  React.render(
    <NewsFeed url={getNewsFeedUrl} username={user}/>,
    document.getElementById('content')
  );
}

