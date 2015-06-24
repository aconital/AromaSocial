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
  render: function(){
    var tags = this.props.tags;
    var tagString = "";
    for (var i = 0; i < tags.length; i++){
      tagString = tagString + " " + tags[i];
    }
    this.props.tagString = tagString;
    return(
      <div className="result">
        <div className="row">
          <div className="col-sm-3">
            <img src="/images/greypaper.png" className="preview-image"/>
          </div>
          <div className="col-sm-9 result-text">
            <div className="row">
              <div className="col-sm-6">
                <a href="javascript:void(0)" onClick={this.showPublication}>
                  <h5 className="grey inline-text">{this.props.datatype}:</h5> <h5>{this.props.title}</h5>
                </a>
              </div>
              <div className="col-sm-6">
                <h5 className="grey inline-text">Year Published: {this.props.year}</h5>
              </div>
            </div>
            <p className="search-text">{this.props.author}</p>
            <p className="search-text">Description: {this.props.description}</p>
            <p className="search-text">{this.props.filename}</p>
            <p>{tagString}</p>
          </div>
        </div>
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
  React.render(<SearchZoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} searchphrase={searchphrase}/>, document.getElementById("content"));
}
