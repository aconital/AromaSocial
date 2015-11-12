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
		   <Modal.Footer>
    		   <Button className="pull-right" onClick={this.close}>Continue</Button>
		   </Modal.Footer>
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
        buttonStyles: {maxWidth: 400, margin: '0 auto 10px'}
        };
    },

	render: function() {
		return (
		<div>
			<form className="form-horizontal">
			    <div className="well" style={this.buttonStyles}>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                        style={{display: this.showPictureUpload(this.props.fromModelTab)}}>
                        Add Picture <input type="file" onChange={this.handlePicture} />
                    </Button>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block>
                        Select Files... <input type="file" onChange={this.handleFile} />
                    </Button>
                  </div>
                {/*
                <div style={{display: this.showPictureUpload(this.props.fromModelTab)}} >
                    <span className="btn btn-default btn-file" onClick={this.openFileUpload}>
                        Add Picture <input type="file" onChange={this.handlePicture}/>
                    </span>
                </div>
                <div className="testo">
                    <Input type="text" placeholder="Title:" wrapperClassName="col-xs-6" />
                    <span className="btn btn-default btn-file" onClick={this.openFileUpload}>
                        Select files...<input type="file" onChange={this.handleFile}/>
                    </span>
                </div>
                */}
                <Input type="text" label="Title:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
                <Input type="text" label="Collaborators:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
                <Input type="date" label="Creation Date:" labelClassName="col-xs-2" wrapperClassName="col-xs-10"
                    onChange={this.props.publishDate} defaultValue="" className="form-control" id="" maxlength="524288" name="publication-date"/>
                <Input type="textarea" label="Description:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
                <Input type="text" label="License:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
                <Input type="text" label="Link to publication:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" />
                <Input type="text" label="Keywords:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Type in comma separated tags"/>
                <Input type="text" label="URL:" labelClassName="col-xs-2" wrapperClassName="col-xs-10" placeholder="Link to patent" />
              </form>
		</div>
		);
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
          });
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
                    <h3 className="no-margin-top">{this.props.title}</h3>
                    Collaborators: <a href="#" className="body-link">{this.props.author}</a><br/>
                    <p>PLACEHOLDER FOR ... FILE PREVIEW?</p>
                    Keywords: {this.props.keywords}
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
                    Collaborators: <a href="#" className="body-link">{this.props.author}</a><br/>
                    Keywords: {this.props.keywords}
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