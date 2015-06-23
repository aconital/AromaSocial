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
        <Result filename={this.props.filename} postid={this.props.postid} tags={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid} datatype="Publication"/>
        <File data={this.state.data}/>
      </div>
    );
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

var SearchZoom = React.createClass({
  render: function(){
    return (
    <div className="row">
      <div className="col-sm-8 col-sm-offset-2">
        <div className = "panel panel-default">
          <div className="row">
            <div className="col-sm-6">
              <button className="btn btn-default" onClick={this.showList}><span className="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>Back To Search</button>
            </div>
          </div>
          <ZoomSearchResult url={this.props.url} filename={this.props.filename} postid={this.props.postid} tagString={this.props.tagString} title={this.props.title} date={this.props.date} 
          description={this.props.description} author={this.props.author} year={this.props.year} pubid={this.props.pubid}/>
        </div>
      </div>
    </div>
    );
  },
  showList: function(){
    revertToListSearch(this.props.searchphrase);
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
