var Models = React.createClass({
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

var Data = React.createClass({
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

var ResourceAddForm = React.createClass({
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
        var dataForm = {title: "mytitle", description: "my descrption!!!!!", file: this.state.fileChosen,
            picture: this.state.pictureChosen, collaborators: this.state.collaborators, creationDate: this.state.creationDate,
            description: this.state.description, license: this.state.license, pubLink: this.state.pubLink,
            keywords: this.state.keywords, url: this.state.url};

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

var DataItem = React.createClass({
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

var ModelItem = React.createClass({
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

var ItemInfo = React.createClass({
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