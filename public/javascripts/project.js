var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Project = React.createClass ({
    getInitialState: function() {
         return {
             objectId: objectId,
             title: title,
             imgSubmitText:'Upload',
             imgSubmitDisabled:false,
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
           picture: upload.target.result,
           pictureType: extension,
         });
        }
        reader.readAsDataURL(file);
    },
    handleSubmitData: function(e) {
        var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType};
        this.setState({imgSubmitText: "Uploading. Give us a sec..."});
        this.setState({imgSubmitDisabled: true});
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({image_URL: this.state.picture});
                this.setState({imgSubmitDisabled: false });
                this.clickClose();
                console.log(data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/picture", status, err.toString());
                this.setState({ imgSubmitText: "Error. Please select an image and click me again." });
                this.setState({ imgSubmitDisabled: false });
            }.bind(this)
        });
        return;
    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteEntry.bind(this),

    render: function() {
        var fileExists;

        if (this.state.file_path || false) {
            fileExists = <a href={file_path} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a>;
        }

        return (
        <div className="content-wrap-item-page">
            <Modal show={this.state.showModal} onHide={this.clickClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Project Image</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id="field1-container">
                        <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.handlePicture} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <input className="publication-button" type="submit" disabled={this.state.imgSubmitDisabled} value={this.state.imgSubmitText} onClick={this.handleSubmitData} />
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

$( document ).ready(function() {
    ReactDOM.render(<Project/>,document.getElementById('content'));
});