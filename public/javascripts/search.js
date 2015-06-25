var SearchPage = React.createClass({
  loadSearchResultsFromServer: function(tagString) {
    $.ajax({
      url: "http://localhost:3000/search",
      type: "POST",
      data: {'tags': tagString},
      success: function(data) {
        console.log(data);
        this.setState({data: data, searchphrase: tagString});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSearchSubmit: function(tags) {
    var searchResults = this.state.data;
    $.ajax({
      url: "http://localhost:3000/search",
      type: "POST",
      data: tags,
      success: function(data) {
        console.log(data);
        this.setState({data: data, searchphrase: tags.tags});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
    return false;
  },
  getInitialState: function() {
    return {data: [], searchphrase: ""};
  },
  componentDidMount: function() {
    if(this.isMounted()){
      console.log("componentDidMount");
      this.loadSearchResultsFromServer(this.props.tagString);
    }
  },
  render: function() {
    loaded = true;
    return (
      <div className="SearchPage" id="search">
        <div className="row search-title">
          <div className="col-xs-6 col-xs-offset-3">
            <h3>Search</h3>
            <SearchForm onSearchSubmit={this.handleSearchSubmit} placeholder={this.state.searchphrase}/>
          </div>
        </div>
        <hr className="search-separator"/>
        <div className="row">
          <div className="col-xs-6 col-xs-offset-3">
            <div className="panel panel-default search-panel">
              <ResultList data={this.state.data} searchphrase={this.state.searchphrase} />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var SearchForm = React.createClass({
  handleSubmit: function(e){
    var tags = React.findDOMNode(this.refs.searchInput).value.trim();
    this.props.onSearchSubmit({tags});
    React.findDOMNode(this.refs.searchInput).value='';
    return;
  },
  render: function(){
    doSomething = function(e){
      console.log("dosomething");
        //this.handleSubmit();
        e.preventDefault();
        return false;
    }
    var placeholder = "#research";
    if(this.props.placeholder != ''){
      placeholder = this.props.placeholder;
    }
    return(
      <form className="searchForm form-horizontal" onsubmit={doSomething}>
        <div className="form-group">
          <div className="col-sm-10">
            <input className="form-control search-input" id="tagsInput" type="text" placeholder={placeholder} ref="searchInput"/>
          </div>
          <div className="col-sm-2">
            <button className="btn btn-default search-button" id="sendSearch" type="button" onClick={this.handleSubmit}>Search</button>
          </div>
        </div>
      </form>
    );
  }
});


var ResultList = React.createClass({
  render: function(){
    var phrase = this.props.searchphrase;
    var resultNodes = this.props.data.map(function(result){
      return(
        <Result filename={result.filename} postid={result.postid} title={result.title} tags={result.hashtags} author={result.author} description={result.description} 
          year={result.year} searchphrase={phrase} datatype="Publication">
        </Result>
      );
    });
    return(
      <div className="resultList">
        {resultNodes}
      </div>
    );
  }
});


var Result = React.createClass({
  getInitialState: function() {
    return {show: false};
  },
  showDescription: function(event) {
    this.setState({show: !this.state.show});
  },
  render: function(){
    var tags = this.props.tags;
    var tagString = "";
    for (var i = 0; i < tags.length; i++){
      tagString = tagString + " " + tags[i];
    }
    this.props.tagString = tagString;
    var description = this.props.description ? this.props.description : 'No description provided.';
    var text = this.state.show ? description : '';
    return(
      <div className="result">
        
        <div className="row">
          <div className="col-xs-11 no-right-padding">
              <h3 className="black non-inline">{this.props.datatype}: {this.props.title}</h3>
              <p className="black smaller">{tagString}</p>
              <p className="newsfeed-date grey non-inline">{this.props.year}</p>
              <p className="black smaller">{this.props.author}</p>
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showDescription}>SEE DESCRIPTION </a><span> - </span>
              <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showPublication}>SEE FULL TEXT</a>
              <p>{text}</p>
          </div>
          <div className="col-xs-1 center-vertical">
            <a href=""><img src="/images/user.png" alt="" className="img-circle search-profile-pic"/></a>
          </div>
        </div>
        <hr/>
      </div>
    );
  },
  showPublication: function(){
    showPublicationSearch(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.searchphrase);
  }
});


var loaded = false;

if (!loaded){
  React.render(
    <SearchPage url={searchurl} tagString={tags}/>,
    document.getElementById('content')
  );
}

$( "#tagsInput" ).keypress(function(e) {
  if(e.which == 13) {
    e.preventDefault();
    $( "#sendSearch" ).click();
  }
});


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};


function showPublicationSearch(pubid, datatype, title, year, postid, filename, tags, date, description, author, searchphrase){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  var search = true;
  React.render(<Zoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} searchphrase={searchphrase} search={search}/>, document.getElementById("content"));
}
