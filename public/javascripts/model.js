var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Model = React.createClass ({
    getInitialState: function() {
     return {
        title: title,
        description: description,

        objectId: objectId,
        image_URL: image_URL,
        image: image, // TODO rename associated with this

        license: license,
        keywords: keywords,
        collaborators: collaborators,
        url: url,
        path: path,
        creator: {username: creatorName,
                  imgUrl: creatorImg},

        fromModelTab: false,
        pictureChosen: null,

        picture: null, pictureType: ''
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {title: this.state.title,
                        description: this.state.description.replace(/(\r\n|\n|\r|\\)/gm,'\\n'),
                        feature: this.state.feature,
                        other: this.state.other,
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
        var changeImgURL = "https://s3-us-west-2.amazonaws.com/syncholar/" + this.state.objectId + "_model_picture_" + randomNumber + "." + this.state.pictureType;

        var $this = this;
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(status);
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
    render: function() {
        var creator = (this.state.creator) ? '/profile/' + this.state.creator.username : '',
            avatar = (this.state.creator) ? this.state.creator.imgUrl : '',
            fileExists;

        if (this.state.image || false) { // TODO: rename 'image' to something that makes actual sense
            fileExists = <h2 className="corner"><a href={image} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a></h2>;
        } else {
            fileExists = <h2 className="corner"></h2>;
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
                        <input className="publication-button" type="submit" value="Submit" onClick={this.handleSubmitData}/>
                    </Modal.Footer>
                </Modal>
                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" style={{width:'90%'}} onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{this.state.title}</h2>}
                    {fileExists}
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
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="title">Title:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="title" name="title" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.title}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="title">Title:</label></td><td className="publication-table-info-right"><a href='#' className="body-link">{this.state.title}</a></td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="license">License:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="license" name="license" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.license}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="filename">License:</label></td><td className="publication-table-info-right">{this.state.license}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label htmlFor="collaborators">Collaborators:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Collaborators (Enter Separated)", className: "l-editable-input", name: "collaborators", onChange : this.handleCollabsInputChange, value : JSON.parse(this.state.collaborators)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label htmlFor="collaborators">Collaborators:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.collaborators).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label htmlFor="keywords">Keywords:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", className: "l-editable-input", name: "keywords", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.keywords)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label htmlFor="keywords">Keywords:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.keywords).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label htmlFor="url">URL:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="url" name="url" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.url}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label htmlFor="url">URL:</label></td><td className="publication-table-info-right"><a href='#' className="body-link">{this.state.url}</a></td></tr>}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
        );
    }
});

ReactDOM.render(<Model/>, document.getElementById('content'));