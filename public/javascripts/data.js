var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Data = React.createClass ({
    getInitialState: function(){
     return {
        title: title,
        description: description,
        objectId: objectId,
        image_URL: image_URL,
        imgSubmitText: "Upload",
        imgSubmitDisabled: false,

        fromModelTab: false,
        pictureChosen: null,

        filename: filename,
        license: license,
        keywords: keywords,

        collaborators: collaborators,
        url: url,
        path: path,
        creator: {username: creatorName,
                  imgUrl: creatorImg},

        picture: null, pictureType: ''
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {title: this.state.title,
                        description: this.state.description.replace(/(\r\n|\n|\r|\\)/gm,'\\n'),
                        url: this.state.url,
                        license: this.state.license};

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    handleTagsInputChange: function(e) {
        var keywordsSubmit = (JSON.stringify(e));
        this.setState({keywords:keywordsSubmit}, function(){ console.log(this.state.keywords); this.submitArrayChange(); }.bind(this));
    },
    handleCollabsInputChange: function(e) {
        var collabsSubmit = (JSON.stringify(e));
        this.setState({collaborators:collabsSubmit}, function(){ console.log(this.state.collaborators); this.submitCollabsArrayChange(); }.bind(this));
    },
    submitCollabsArrayChange: function() {
        var dataForm = { collaborators: this.state.collaborators };

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    submitArrayChange: function() {
        var dataForm = { keywords: this.state.keywords };

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    clickOpen() {
      this.setState({ showModal: true });
    },
    clickClose() {
      this.setState({ imgSubmitText: "Upload" });
      this.setState({ imgSubmitDisabled: false });
      this.setState({ showModal: false});
    },
    openFileUpload() {
	    var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.fileChosen.on('fileselect', function(event, numFiles, label) {
            console.log(numFiles);
            console.log(label);
            return input;
        });
	},
    handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
         self.setState({
           pictureChosen: upload.target.result,
           picture: upload.target.result,
           pictureType: extension,
         });
        }
        reader.readAsDataURL(file);
    },
    handleSubmitData: function(e) {
// <<<<<<< HEAD
        var randomNumber = Math.floor(Math.random() * 100000000);
        var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType, randomNumber: randomNumber};
        var changeImgURL = "https://s3-us-west-2.amazonaws.com/syncholar/" + this.state.objectId + "_data_picture_" + randomNumber + "." + this.state.pictureType;
        this.setState({ imgSubmitText: "Uploading. Give us a sec..." });
        this.setState({ imgSubmitDisabled: true });
        var $this = this;
// =======
//         var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType};
// >>>>>>> 066d0da34bc0c5a8d4507a6417069090ac217e26
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(status) {
                console.log(status);
                this.setState({image_URL: this.state.picture});
                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/picture", status, err.toString());
            }.bind(this)
        }).then(function(){
            $this.clickClose();
            $this.setState({image_URL:changeImgURL});
        }, function(err) {
            $this.setState({ imgSubmitText: "Error. Please select an image and click me again." });
            $this.setState({ imgSubmitDisabled: false });
        });

        return;
    },
    // function declared in ./settings.js
    deleteEntry: settingsModalDeleteEntry.bind(this),
    // deleteEntry: function(callback) {
    //     console.log("bad bug", path);
    //     $.ajax({
    //         url: path,
    //         type: 'DELETE'
    //     }).done(function(status) {
    //         callback('Successfully deleted.')
    //         setTimeout(function(){ // redirect to homepage
    //             window.location = '../..';
    //         }, 3000);
    //     }).fail(function(xhr, status, err) {
    //         console.log(status + ': ' + err);
    //         callback('Error: ' + err);

    //     });
    // },
    render: function() {
        var creator = (this.state.creator) ? '/profile/' + this.state.creator.username : '',
            avatar = (this.state.creator) ? this.state.creator.imgUrl : '',
            fileExists;

        if (this.state.filename || false) {
            fileExists = <a href={filename} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a>;
        }

        return (
        <div className="content-wrap-item-page">
            <div className="content-wrap-item-page-100">
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>Update Data Image</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                        <div id="field1-container">
                            <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.handlePicture} />
                        </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <input className="publication-button" type="submit" disabled={this.state.imgSubmitDisabled} value={this.state.imgSubmitText} onClick={this.handleSubmitData}/>
                  </Modal.Footer>
                </Modal>

                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{title}</h2>}
                    <h2 className="corner">
                        {fileExists}
                        {(currentUserId == creatorId) ?  <SettingsModal delete={this.deleteEntry}/> : <span></span>}
                    </h2>
                    <div className="contain-panel-big-item-image">
                        {(currentUserId == creatorId) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.image_URL} className="contain-panel-big-image"/><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={image_URL} className="contain-panel-big-image"/>}
                    </div>
                    <div className="contain-panel-big item-info">
                        <h4 className="no-margin h4-item-inside-panel-wrap h4-item-inside-panel-spacing">Description</h4>
                        {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" type="text" name="description" className="p-editable p-editable-bottom-spacing" onChange={this.handleChange}  onBlur={this.submitChange}>{this.state.description}</textarea></p> : <pre className="p-non-editable-bottom-wrap">{description}</pre>}
                    </div>
                </div>

                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Uploaded By</h3>
                    <div className="item-authors-div">
                        <a href={creator} className="nostyle"><img src={avatar} className="contain-panel-small-image"/></a>
                    </div>
                </div>

                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Information</h3>
                    <div className="item-info-div">
                    <table className="item-info-table">
                        <tbody>
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="Title">Title:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="title" name="title" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.title}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="title">File Name:</label></td><td className="publication-table-info-right"><a href='#' className="body-link">{this.state.title}</a></td></tr>}
                            {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="license">License:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="license" name="license" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.license}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="filename">License:</label></td><td className="publication-table-info-right">{this.state.license}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label htmlFor="collaborators">Collaborators:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Collaborators (Enter Separated)", className: "l-editable-input", name: "collaborators", onChange : this.handleCollabsInputChange, value : JSON.parse(this.state.collaborators)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label htmlFor="collaborators">Collaborators:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.collaborators).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label htmlFor="keywords">Keywords:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", className: "l-editable-input", name: "keywords", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.keywords)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label htmlFor="keywords">Keywords:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.keywords).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="Url">URL:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="url" name="url" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.url}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="url">URL:</label></td><td className="publication-table-info-right"><a href='#' className="body-link">{this.state.url}</a></td></tr>}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
        );
    }
});

// var SettingsModal = React.createClass({
//     getInitialState() {
//         return {
//             showModal: false,
//             message: 'This action cannot be undone.' };
//     },
//     close() {
//         this.setState({ showModal: false });
//     },
//     open() {
//         this.setState({ showModal: true });
//     },
//     setMsg(status) {
//         this.setState({ message: status });
//     },
//     delete() {
//         this.setMsg('In progress...');
//         this.props.delete(this.setMsg);
//         console.log("end");
//     },

//     render() {
//         return (
//             <div>
//                 <span className="glyphicon glyphicon-remove space" onClick={this.open}></span>

//                 <Modal show={this.state.showModal} onHide={this.close}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>Confirmation</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         {/*<div id="">
//                             <h4>Update Uploaded File</h4>
//                             <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handleFile} />
//                         </div>

//                         <div id="">
//                             <h4>Update Uploaded Picture</h4>
//                             <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handlePicture} />
//                         </div>

//                         <div id="">
//                             <h4>Delete Entry</h4>
//                             <p>Caution: This action cannot be undone. Please save changes to complete the operation.</p>
//                             <Button block bsStyle="danger" onClick={this.TODO}>Delete</Button>
//                         </div>*/}

//                         <h4>Are you sure you want to delete this entry?</h4>
//                         <p>{this.state.message}</p>
//                     </Modal.Body>
//                     <Modal.Footer>
//                         <Button onClick={this.close}>Cancel</Button><Button bsStyle="danger" onClick={this.delete}>Delete</Button>
//                     </Modal.Footer>
//                 </Modal>
//             </div>
//         );
//     }
// });


$( document ).ready(function() {
    ReactDOM.render(<Data />, document.getElementById('content'));
});


var Models = React.createClass({ //TODO delete?
  getInitialState: function() {
    return { showModal: false };
  },

  close() {
    this.setState({ showModal: false });
//    TODO: save all information; send file to AWS
  },

  open() {
    this.setState({ showModal: true });
  },

  render: function() {
    return (
		<div>
		 <Button className="pull-right add-resource-btn" onClick={this.open}>Add Model</Button>

		 <div>
		    <ModelItem title={"Some Model.xls"} author={"Me"} keywords={"help, me"} />
		 </div>

		 <Modal show={this.state.showModal} onHide={this.close}>
		   <Modal.Header closeButton>
			 <Modal.Title>Add Model</Modal.Title>
		   </Modal.Header>
		   <Modal.Body>

			 <ResourceAddForm fromModelTab={true}/>

		   </Modal.Body>
		   <Modal.Footer>
    		   <Button className="pull-right" onClick={this.close}>Continue</Button>
		   </Modal.Footer>
		 </Modal>
		</div>
     );
  }
});

var DataInline = React.createClass({ //TODO delete?
  getInitialState: function() {
    return { showModal: false };
  },
  close() {
    this.setState({ showModal: false });
//    TODO: save all information; send file to AWS
  },
  open() {
    this.setState({ showModal: true });
  },
  render: function() {
    return (
		<div>
		 <Button className="pull-right add-resource-btn" onClick={this.open}>Add Data</Button>

		 <DataItem title={"Some Data.csv"} author={"Me"} keywords={"help, me"} />

		 <Modal show={this.state.showModal} onHide={this.close}>
		   <Modal.Header closeButton>
			 <Modal.Title>Add Data</Modal.Title>
		   </Modal.Header>
		   <Modal.Body>

			 <ResourceAddForm />

		   </Modal.Body>
		 </Modal>
		</div>
     );
  }
});

var ResourceAddForm = React.createClass({ //TODO delete?
    getInitialState: function() {
     return {
        fromModelTab: false,
        fileChosen: null,
        pictureChosen: null,
        buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},

        // form
        picture: null, file: null, title: '', description: '', collaborators: '', creationDate: '',
        description: '', license: '', pubLink: '', keywords: '', url: ''
        };
    },

	render: function() {
		return (
		<div>
			<form className="form" onSubmit={this.handleSubmitData}>
			    <div className="well" style={this.buttonStyles}>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={{display: this.showPictureUpload(this.props.fromModelTab)}}>
                        Add Picture <input type="file" onChange={this.handlePicture} />
                    </Button>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block>
                        Select Files... <input type="file" onChange={this.handleFile} />
                    </Button>
                  </div>

                <Input type="text" placeholder="Title:" name="title" onChange={this.handleChange} value={this.state.title} />
                <Input type="text" placeholder="Collaborators:" name="collaborators" onChange={this.handleChange} value={this.state.collaborators} />
                <Input type="date" placeholder="Creation Date:" name="creationDate"
                   onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
                <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
                <Input type="text" placeholder="License:" name="license" onChange={this.handleChange} value={this.state.license} />
                <Input type="text" placeholder="Link to publication:" name="pubLink" onChange={this.handleChange} value={this.state.pubLink} />
                <Input type="text" placeholder="Keywords (type in comma separated tags)" name="keywords" onChange={this.handleChange} value={this.state.keywords} />
                <Input type="text" placeholder="URL (Link to patent)" name="url" onChange={this.handleChange} value={this.state.url} />

                {/*<Button className="pull-right" type="submit" onClick={this.close}>Continue</Button>*/}

		   <Modal.Footer>
    		   <Input className="btn btn-default pull-right" type="submit" value="Continue" />
		   </Modal.Footer>
              </form>
		</div>
		);
	},
	
	handleChange: function(e) {
	    var changedState = {};
	    changedState[e.target.name] = e.target.value;
	    this.setState( changedState );
	},

	handleSubmitData: function(e) {
        e.preventDefault();
        var dataForm = {
            title: "mytitle",
            file: this.state.fileChosen,
            picture: this.state.pictureChosen,
            collaborators: this.state.collaborators,
            creationDate: this.state.creationDate,
            description: this.state.description.replace(/(\r\n|\n|\r|\\)/gm,'\\n'),
            license: this.state.license,
            pubLink: this.state.pubLink,
            keywords: this.state.keywords,
            url: this.state.url};

        $.ajax({
            url: path + "/data",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
                console.log("Data upload done");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/data", status, err.toString());
            }.bind(this)
        });

        return;
    },

    handleDataSubmit: function(dataForm) {
        this.setState({data: dataForm});
        $.ajax({
            url: "localhost:3000" + path + "/data",
            dataType: 'json',
            type: 'POST',
            data: dataForm,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },

	showPictureUpload(fromModel) {
	    if (fromModel) {
            return '';
	    }
	    return 'none';
	},

	openFileUpload() {
	    var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
        //TODO save file into props
        this.state.fileChosen.on('fileselect', function(event, numFiles, label) {
            console.log(numFiles);
            console.log(label);
            return input;
        });
	},

	handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
          self.setState({
            fileChosen: upload.target.result,
            file: upload.target.result,
          });
        var contentType = upload.target.result.match(/^data:(\w+\/\w+)/);
        console.log(JSON.stringify(contentType));
        }

        reader.readAsDataURL(file);
        console.log(reader);
    },

    handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];

        reader.onload = function(upload) {
         self.setState({
           pictureChosen: upload.target.result,
           picture: upload.target.result,
         });
        }

        reader.readAsDataURL(file);
        console.log(reader);
    }
});

var DataItem = React.createClass({ //TODO delete?
    render: function() {
        return (
            <div className="publication-box">
                <div className="publication-box-left">
                    <h3 className="no-margin-top">
                        <div className="pull-left">{this.props.title}</div>
                        <div className="pull-right">2015</div>
                    </h3>
                    <div style={{clear: 'both'}}>
                        Collaborators: <a href="#" className="body-link">{this.props.author}</a><br/>
                        <p>PLACEHOLDER FOR ... FILE PREVIEW?</p>
                        Keywords:  <a href="#" className="body-link">{this.props.keywords}</a>
                    </div>
                </div>

                <ItemInfo />
            </div>
        );
    }
});

var ModelItem = React.createClass({  //TODO delete?
    render: function() {
        return (
            <div className="publication-box">
                <div className="publication-box-left">
                    <div className="model-preview-img pull-left"><img src="" />TODO</div>
                    <h3 className="no-margin-top">{this.props.title}</h3>
                    <div>
                        Collaborators: <a href="#" className="body-link">{this.props.author}</a><br/>
                        Keywords: <a href="#" className="body-link">{this.props.keywords}</a>
                    </div>
                    <p>
                    I assume some text is supposed to be here I assume some text is supposed to be here
                    I assume some text is supposed to be here I assume some text is supposed to be here
                    I assume some text is supposed to be here I assume some text is supposed to be here
                    I assume some text is supposed to be here I assume some text is supposed to be here
                    I assume some text is supposed to be here I assume some text is supposed to be here
                    </p>
                </div>

                <ItemInfo />
            </div>
        );
    }
});

var ItemInfo = React.createClass({ //TODO delete?
    render: function() {
        return (
            <div className="publication-box-right">
                <h5>Information</h5><br/>
                Published<br/>
                ## Syncholar Factor<br/>
                ## Times Cited<br/>
                XX License<br/>
                XX Uses this!
            </div>
        );
    }
});