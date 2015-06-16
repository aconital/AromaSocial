
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
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="row">
              <p>{this.props.username}</p>
              <PublicationForm onPublicationSubmit={this.handlePublicationSubmit} username={this.props.username}/>
            </div>
          </div>
        </div>
        <div className="panel panel-default">
        <ul className="list-group">
          <li className="list-group-item">
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
          </li>
          <li className="list-group-item">
            <div className="row">
              <h5>Publications</h5>
              <PublicationList data={this.state.data} />
            </div>
          </li>
        </ul>
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
      <FormTabs username={this.props.username}/>
    );
  }
});



var PublicationTab = React.createClass({
  render:function(){
    var url = "/profile/"+this.props.username+"/publications";
    return(
      <form action={url} encType="multipart/form-data" method="post" className="upload-form form-horizontal" >
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="inputTitle">Title</label>
          <div className="col-sm-10">
                <input type="text" className="form-control" id="inputTitle" name="title" placeholder=""/>
          </div>
        </div>

        <div className="form-group top-margin">
          <label className="col-sm-2 control-label" for="tags">Tags</label>
          <div id="tagsinput" className="col-sm-10 tags-input-class ">
            <TagsComponent/>
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 control-label" for="files">Upload Files</label>
          <div className="col-sm-8">
            <div className="">
              <input multiple="multiple" name="upload" type="file" className="upload" id="files"/>
            </div>
          </div>

          <div className="col-sm-2">
            <input className="btn btn-primary" type="submit" value="Upload" />
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
            <li className={this.props.isCurrent ? 'active' : ''} role="presentation">
                <a onClick={this.handleClick} href={this.props.url} role="tab" data-toggle="tab">
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
            <div>
                <ul className="nav nav-tabs" role="tablist">
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
            </div>
        );
    }
});

var Content = React.createClass({
    render: function(){
        return(
            <div className="tab-content">
                {this.props.currentTab === 1 ?
                <div className="tab-pane fade in active" role="tabpanel">
                  <PublicationTab username={this.props.username}></PublicationTab>
                </div>
                :null}

                {this.props.currentTab === 2 ?
                <div className="tab-pane fade in active">
                  <PublicationTab></PublicationTab>
                </div>
                :null}

                {this.props.currentTab === 3 ?
                <div className="tab-pane fade in active">
                  <PublicationTab></PublicationTab>
                </div>
                :null}
            
                {this.props.currentTab === 4 ?
                <div className="tab-pane fade in active">
                  <PublicationTab></PublicationTab>
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
                <Content currentTab={this.state.currentTab} username={this.props.username} />
            </div>
        );
    }
});

  

React.render(
  <PublicationBox url="/publications.json" username={user} />,
  document.getElementById('content')
);

$(".react-tagsinput-input").attr("name", "tags");

function switchToDataTab(){
  console.log("switch");
  React.unmountComponentAtNode(document.getElementById("publications"));
}