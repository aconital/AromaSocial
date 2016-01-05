var Modal = ReactBootstrap.Modal;
var ModalTrigger = ReactBootstrap.ModalTrigger;
var Button = ReactBootstrap.Button;
var OverlayMixin = ReactBootstrap.OverlayMixin;

var Publication = React.createClass({
  getInitialState: function() {
    return {show: false};
  },
  showDescription: function(event) {
    this.setState({show: !this.state.show});
  },
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
    var text = this.state.show ? description : '';
    
    var deletePub;
    if(this.props.myself == "true"){
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
            <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showDescription}>SEE DESCRIPTION </a><span> - </span>
            <a className="newsfeed-link" href="javascript:void(0)" onClick={this.showPublication}>SEE FULL TEXT</a>
            <p>{text}</p>
          </div>
          <div className="col-xs-3">
            <p className="grey smaller">Uploaded: {date}</p>
          </div>
        </div>
        <hr/>
      </div>
    );
  },
  removePublication: function(){	  
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
	  this.props.refresh();
  },
  showPublication: function(){
    showPublication(this.props.pubid, this.props.datatype, this.props.title, this.props.year, this.props.postid, this.props.filename, this.props.tagString, this.props.date, this.props.description, this.props.author, this.props.username);
  },
  componentWillUnmount: function() {
    $(this.getDOMNode()).children().get().forEach(function(node) {
      React.unmountComponentAtNode(node);
    });
  }

});


var RemovePublicationButton = React.createClass({
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
  
  handleDelete(){
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
    this.props.clickHandler();
  },

	render: function(){
		return(
  		<a className="deletePublication" href="javascript:void(0)" onClick={this.handleToggle}><img className="close" src="/images/close.png"/></a>
		);
	},

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
          <Button onClick={this.handleDelete} id={this.props.postid}>Yes, Delete!</Button>
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
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadPublicationsFromServer();
  },
  render: function() {
    var pubForm;
    if(this.props.myself == "true"){
      pubForm = <div className="panel panel-default">
          <div className="panel-body">
            <div className="row">
              <PublicationForm username={this.props.username}/>
            </div>
          </div>
        </div>;
    }
    return (
      <div className="PublicationBox">
        {pubForm}
        <div className="panel panel-default profile-panel">
          <PublicationList data={this.state.data} username={this.props.username} myself={this.props.myself} refresh={this.loadPublicationsFromServer}/>
        </div>
      </div>
    );
  }
});


var PublicationList = React.createClass({
  render: function() {
    var username = this.props.username;
    var myself = this.props.myself;
    var refresh = this.props.refresh;
	  
	  var PublicationNodes = this.props.data.map(function (publication) {
  	  var jsonString = JSON.stringify(publication.hashtags);
  	  var deleteurl = "/profile/" +username+"/publications";

      return (
        <Publication filename={publication.filename} postid={publication.postid} tags={jsonString} title={publication.title} date={publication.date} 
          description={publication.description} author={publication.author} year={publication.year} pubid={publication.id} datatype="Publication" url={deleteurl} 
          myself={myself} refresh={refresh} username={username}>
        </Publication>
      );
    });
    
    if (this.props.data.length == 0){
      PublicationNodes = 
          <div className="no-results">
            <h5>This user has not uploaded any publications</h5>
          </div>;
    }
    return (
      <div className="publicationList" id="container">

          {PublicationNodes}

      </div>
    );
  }

});

var PublicationForm = React.createClass({
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
      <form action={url} encType="multipart/form-data" method="post" className="upload-form form-horizontal" id="upload-publication" >
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

var DataTab = React.createClass({
  render:function(){
    return(
      <form encType="multipart/form-data" method="post" className="upload-form form-horizontal" >
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="inputTitle">Title</label>
          <div className="col-sm-10">
                <input type="text" className="form-control" id="inputTitle" name="title" placeholder=""/>
          </div>
        </div>
        
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="inputReference">Reference</label>
          <div className="col-sm-10">
                <input type="text" className="form-control" id="inputReference" name="title" placeholder=""/>
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
            <button className="btn btn-primary">Upload</button>
          </div>
        </div>
      </form>
      
    );
  }
});

var ImageTab = React.createClass({
  render:function(){
    return(
      <form encType="multipart/form-data" method="post" className="upload-form form-horizontal" >
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="inputTitle">Title</label>
          <div className="col-sm-10">
                <input type="text" className="form-control" id="inputTitle" name="title" placeholder=""/>
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
            <button className="btn btn-primary">Upload</button>
          </div>
        </div>
      </form>
      
    );
  }
});

var ModelTab = React.createClass({
  render:function(){
    return(
      <form encType="multipart/form-data" method="post" className="upload-form form-horizontal" >
        <div className="form-group ">
          <label className="col-sm-2 control-label" for="inputTitle">Title</label>
          <div className="col-sm-10">
                <input type="text" className="form-control" id="inputTitle" name="title" placeholder=""/>
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
            <button className="btn btn-primary">Upload</button>
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
    { 'id': 4, 'name': 'Models', 'url': '/tables' }
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
                  <DataTab></DataTab>
                </div>
                :null}

                {this.props.currentTab === 3 ?
                <div className="tab-pane fade in active">
                  <ImageTab></ImageTab>
                </div>
                :null}
            
                {this.props.currentTab === 4 ?
                <div className="tab-pane fade in active">
                  <ModelTab></ModelTab>
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

$('#upload-publication').submit( function(e){
    $.ajax({
      url: "/profile/"+user+"/publications",
      type: 'POST',
      data: new FormData( this ),
      processData: false,
      contentType: false,
      success: function(data){
        revertToList();
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }
    });
    e.preventDefault();

});

$('#upload-profile-pic').submit( function(e){
    $.ajax({
      url: "/uploadimage/"+user,
      type: 'POST',
      data: new FormData( this ),
      processData: false,
      contentType: false,
      success: function(data){
        window.location.href = "/profile/"+user;     
      },
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }
    });
    e.preventDefault();

});



function showPublication(pubid, datatype, title, year, postid, filename, tags, date, description, author, username){
  var works = document.getElementById("content");
  React.unmountComponentAtNode(works);
  React.render(<ProfileZoom url="/loadPublicationFile" filename={filename} postid={postid} tagString={tags} title={title} date={date} 
    description={description} author={author} year={year} pubid={pubid} username={username}/>, document.getElementById("content"));
}
