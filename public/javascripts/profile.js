
var Publication = React.createClass({
  render: function() {
	var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return (
      <div className="publication">
      	<div className="row">
	      	<div className="authorDiv small-10 columns">
		        <h6 className="publicationAuthor">
		          {this.props.author}
		        </h6>
	        </div>
	        <div className="deletePublication small-2 columns"><RemovePublicationButton clickHandler={this.removePublication} postid={this.props.postid}/></div>
        </div>
        <div className="row">
        <div className="publicationText">
        	<span dangerouslySetInnerHTML={{__html: rawMarkup}} />
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

var RemovePublicationButton = React.createClass({
	render: function(){
		return(
			<a className="deletePublication" href="javascript:void(0)" onClick={this.props.clickHandler} id={this.props.postid}><img className="close" src="images/close.png"/></a>
		);
	}
});


var PublicationBox = React.createClass({
  loadPublicationsFromServer: function() {
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
  handlePublicationSubmit: function(publication) {
    var publications = this.state.data;
    var newPublications = publications.concat([publication]);
    this.setState({data: newPublications});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: publication,
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
    this.loadPublicationsFromServer();
    setInterval(this.loadPublicationsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="PublicationBox" id="publications">

        <div className="panel">
          <div className="row">
            <p>{this.props.username}</p>
            <PublicationForm onPublicationSubmit={this.handlePublicationSubmit} username={this.props.username}/>
          </div>
        </div>
        <div className="panel">
          <div className="row">
            <div className ="large-3 columns">
              <a href="">Publications </a>
            </div>
            <div className ="large-3 columns">
              <a href="">Data </a>
            </div>
            <div className ="large-3 columns">
              <a href="">Images </a>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="row">
            <h5>Publications</h5>
            <PublicationList data={this.state.data} />
          </div>
        </div>
      </div>
    );
  }
});

var PublicationList = React.createClass({
  render: function() {
	  var PublicationNodes = this.props.data.map(function (publication) {
      return (
        <Publication author={publication.author} postid={publication.postid} url="/removePublication">
          {publication.text}
        </Publication>
      );
    });
    return (
      <div className="publicationList">
        {PublicationNodes}
      </div>
    );
  }
});


var PublicationForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if (!text || !author) {
      return;
    }
	this.props.onPublicationSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = '';
    React.findDOMNode(this.refs.text).value = '';
    return;
  },
  render: function() {
    return (
        /*<form className="publicationForm chat" onSubmit={this.handleSubmit}>
	        <input id="author-form" type="text" placeholder="Your name" ref="author"/>
	        <textarea placeholder="Say something..." ref="text"/>
	        <button id="send" type="submit" value="Post">Post </button>
        </form>              
        <PublicationTab></PublicationTab>
*/
      <FormTabs/>
    );
  }
});



var PublicationTab = React.createClass({
  render:function(){
    return(
      <form action="/profile/{this.props.username}/publications" enctype="multipart/form-data" method="post">
        <div className="small-3 large-2 columns form-label">
          <span className="prefix">Title</span>
        </div>
        <div className="small-9 large-10 columns form-label">
          <input type="text" name="title" placeholder=""/>
        </div>
        <div className="row">
          <div className="large-12 columns">
            <div id="tags">
              <TagsComponent/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="small-3 large-2 columns left-margin">
            <div className="fileUpload">
                <input multiple="multiple" name="upload" type="file" className="upload" />
            </div>
          </div>
          <div className="large-4 columns">
            <input className="button" type="submit" value="Upload" />
          </div>
        </div>
      </form>
      
    );
  }
});


var tabList = [
    { 'id': 1, 'name': 'Publications', 'url': '/publications' },
    { 'id': 2, 'name': 'Data', 'url': '/data' },
    { 'id': 3, 'name': 'Images', 'url': '/images' },
    { 'id': 4, 'name': 'Tables', 'url': '/tables' }
];

var Tab = React.createClass({
    handleClick: function(e){
        e.preventDefault();
        this.props.handleClick();
    },
    
    render: function(){
        return (
            <li className={this.props.isCurrent ? 'tab-title active' : 'tab-title'}>
                <a onClick={this.handleClick} href={this.props.url}>
                    {this.props.name}
                </a>
            </li>
        );
    }
});

var Tabs = React.createClass({
    handleClick: function(tab){
        this.props.changeTab(tab);
    },
    
    render: function(){
        return (
            <nav>
                <ul className="tabs" data-tab>
                {this.props.tabList.map(function(tab) {
                    return (
                        <Tab
                            handleClick={this.handleClick.bind(this, tab)}
                            key={tab.id}
                            url={tab.url}
                            name={tab.name}
                            isCurrent={(this.props.currentTab === tab.id)}
                         />
                    );
                }.bind(this))}
                </ul>
            </nav>
        );
    }
});

var Content = React.createClass({
    render: function(){
        return(
            <div className="tabs-content">
                {this.props.currentTab === 1 ?
                <div className="content active">
                    <PublicationTab></PublicationTab>
                </div>
                :null}

                {this.props.currentTab === 2 ?
                <div className="content active">
                    <img src="http://s.mlkshk.com/r/103AG" />
                </div>
                :null}

                {this.props.currentTab === 3 ?
                <div className="content active">
                    <img src="http://s.mlkshk.com/r/JAUD" />
                </div>
                :null}
            
                {this.props.currentTab === 4 ?
                <div className="content active">
                    <img src="http://s.mlkshk.com/r/ZJPL" />
                </div>
                :null}
            </div>
        );
    }
});

var FormTabs = React.createClass({
    getInitialState: function () {        
        return {
            tabList: tabList,
            currentTab: 1
        };
    },

    changeTab: function(tab) {
        this.setState({ currentTab: tab.id });
    },

    render: function(){
        return(
            <div>
                <Tabs
                    currentTab={this.state.currentTab}
                    tabList={this.state.tabList}
                    changeTab={this.changeTab}
                />
                <Content currentTab={this.state.currentTab} />
            </div>
        );
    }
});

  

React.render(
  <PublicationBox url="/publications.json" username={user} pollInterval={2000} />,
  document.getElementById('content')
);

function switchToDataTab(){
  console.log("switch");
  React.unmountComponentAtNode(document.getElementById("publications"));
}