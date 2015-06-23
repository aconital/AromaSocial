var Modal = ReactBootstrap.Modal;
var ModalTrigger = ReactBootstrap.ModalTrigger;
var Button = ReactBootstrap.Button;
var OverlayMixin = ReactBootstrap.OverlayMixin;

var Publication = React.createClass({
  render: function() {
	  //var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
  	console.log(this.props.tags);
    var date = moment(this.props.date).format("MMM D, YYYY");
    var tagString = this.props.tags.replace(/\[\"/g, "");
    tagString = tagString.replace(/\",\"/g, " ");
    tagString = tagString.replace(/\"\]/g,"");
    return (

      <div className="result">
        <div className="row">
          <div className="col-sm-3">
            <img src="/images/greypaper.png" className="preview-image"/>
          </div>
          <div className="col-sm-9 result-text">
            <div className="row">
              <div className="col-sm-6">
                <h5 className="grey inline-text">{this.props.datatype}:</h5> <h5>{this.props.title}</h5>
              </div>
              <div className="col-sm-4">
                <h5 className="grey inline-text">Year Published: {this.props.year}</h5>
              </div>
              <div className="col-sm-2">
                <div className="deletePublication"><RemovePublicationButton clickHandler={this.removePublication} postid={this.props.postid} title={this.props.title}/></div>
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
  mixins: [OverlayMixin],
  getInitialState() {
    return {
      isModalOpen: false
    };
  },

  handleToggle() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

	render: function(){
		return(
  		<a className="deletePublication" href="javascript:void(0)" onClick={this.handleToggle}><img className="close" src="/images/close.png"/></a>

		);
	},
	//			<a className="deletePublication" href="javascript:void(0)" onClick={this.props.clickHandler} id={this.props.postid}><img className="close" src="/images/close.png"/></a>

	  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
  renderOverlay() {
    if (!this.state.isModalOpen) {
      return <span/>;
    }

    return (
      <Modal title={this.props.title} onRequestHide={this.handleToggle}>
        <div className='modal-body'>
          Are you sure you want to delete this publication?
        </div>
        <div className='modal-footer'>
          <Button onClick={this.handleToggle}>Close</Button>
          <Button onClick={this.props.clickHandler} id={this.props.postid}>Yes, Delete!</Button>
        </div>
      </Modal>
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
    //setInterval(this.loadPublicationsFromServer, this.props.pollInterval);
  },
  render: function() {
    var pubForm;
    if(this.props.myself == "true"){
      pubForm = <div className="panel panel-default">
          <div className="panel-body">
            <div className="row">
              <PublicationForm onPublicationSubmit={this.handlePublicationSubmit} username={this.props.username}/>
            </div>
          </div>
        </div>;
    }
    return (
      <div className="PublicationBox" id="publications">
        {pubForm}
        <div className="panel panel-default">
          <PublicationList data={this.state.data} />
        </div>
      </div>
    );
  }
});

var DisplayTab = React.createClass({
  render: function(){
    return(
      <div>
      <div className="blog-masthead">
        <div className="container">
          <nav className="blog-nav">
            <a className="blog-nav-item active" href="">Publications</a>
            <a className="blog-nav-item" href="">Data</a>
            <a className="blog-nav-item" href="">Images</a>
            <a className="blog-nav-item" href="">Tables</a>
          </nav>
        </div>
      </div>

      <ul className="list-group">
        <li className="list-group-item">
          <div className="row">
            <h5>Publications</h5>
            <PublicationList data={this.props.data}  />
          </div>
        </li>
      </ul>
      </div>
    )
  }
});


var PublicationList = React.createClass({
  render: function() {
	  var PublicationNodes = this.props.data.map(function (publication) {
  	  console.log(publication);
  	  var jsonString = JSON.stringify(publication.hashtags);
      return (
        <Publication filename={publication.filename} postid={publication.postid} tags={jsonString} title={publication.title} date={publication.date} 
          description={publication.description} author={publication.author} year={publication.year} datatype="Publication" url="/removePublication">

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
        
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="author">Author</label>
          <div className="col-sm-4">
                <input type="text" className="form-control" id="author" name="author" placeholder=""/>
          </div>
          <label className="col-sm-2 control-label" for="year">Year</label>
          <div className="col-sm-4">
                <input type="text" className="form-control" id="year" name="year" placeholder=""/>
          </div>
        </div>
        
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="description">Description</label>
          <div className="col-sm-10">
                <textarea className="form-control" id="description" name="description" placeholder=""/>
          </div>
        </div>

        <div className="form-group top-margin">
          <label className="col-sm-2 control-label" for="tags">Tags</label>
          <div id="tagsinput" className="col-sm-10 tags-input-class ">
            <TagsComponent valueString=""/>
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
  <PublicationBox url={getPublicationUrl} username={user} myself={isMe}/>,
  document.getElementById('content')
);

function switchToDataTab(){
  console.log("switch");
  React.unmountComponentAtNode(document.getElementById("publications"));
}

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    
    reader.onload = function (e) {
        $('#preview').attr('src', e.target.result);
    }
    
    reader.readAsDataURL(input.files[0]);
  }
}

$("#imginput").change(function(){
  readURL(this);
}); 

$( "#submit-photo" ).click(function() {
  $( "#upload-profile-pic" ).submit();
});

$("#edit-name").click(function(){
  var text = $("#add-your-name").text();
  $("#add-your-name").replaceWith("<input class=\"form-control edit-profile\" type=\"text\" name=\"inputname\" placeholder=\""+text+"\"></input>");
  $("#save-changes").show();
});

$("#edit-email").click(function(){
  var text = $("#add-your-email").text();
  $("#add-your-email").replaceWith("<input class=\"form-control edit-profile\" type=\"text\" name=\"inputemail\" placeholder=\""+text+"\"></input>");
  $("#save-changes").show();
});



React.render(overlayTrigger, document.getElementById("content-2"));