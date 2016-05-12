var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Equipment = React.createClass ({
    getInitialState: function() {
     return {
        objectId: objectId,
        title: title,
        description: description,
        image_URL: image_URL,
        file_path: file_path,

        showModal: false
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {title: this.state.title,
                        description: this.state.description.replace(/(\r\n|\n|\r|\\)/gm,'\\n')};

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
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
        var randomNumber = Math.floor(Math.random() * 100000000);
        var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType, randomNumber: randomNumber};
        var changeImgURL = "https://s3-us-west-2.amazonaws.com/syncholar/" + this.state.objectId + "_equipment_picture_" + randomNumber + "." + this.state.pictureType;

        var $this = this;
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/picture", status, err.toString());
            }.bind(this)
        }).then(function(){
            $this.clickClose();
            $this.setState({image_URL:changeImgURL});
        });

        return;
    },
    // function declared in ./settings.js
    deleteEntry: settingsModalDeleteEntry.bind(this),
    
    render: function() {
        var fileExists;

        if (this.state.filename || false) {
            fileExists = <a href={filename} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a>;
        }

        return (
        <div className="content-wrap-item-page">
            <Modal show={this.state.showModal} onHide={this.clickClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Equipment Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id="field1-container">
                        <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.handlePicture} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <input className="publication-button" type="submit" value="Submit" onClick={this.handleSubmitData}/>
                </Modal.Footer>
            </Modal>
            <div className="content-wrap-item-page-100">
                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{title}</h2>}
                    <h2 className="corner">
                        {fileExists}
                        {(currentUserId == creatorId) ?  <SettingsModal delete={this.deleteEntry}/> : <span></span>}
                    </h2>
                    {(currentUserId == creatorId) ? <a href="#" onClick={this.clickOpen} id="big-image"><div className="edit-overlay-div"><img src={this.state.image_URL} className="contain-panel-big-image"/><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={this.state.image_URL} className="contain-panel-big-image"/>}
                    <div className="contain-panel-big item-info">
                        <h4 className="no-margin h4-item-inside-panel-wrap h4-item-inside-panel-spacing">Description</h4>
                        {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" type="text" className="p-editable" name="description" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.description}</textarea></p> : <pre className="p-non-editable-bottom-wrap">{description}</pre>}
                    </div>
                </div>
            </div>
        </div>
        );
    }
});

ReactDOM.render(<Equipment />,document.getElementById('content'));