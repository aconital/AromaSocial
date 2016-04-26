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

        filename: filename,
        license: license,
        keywords: keywords,

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
                        description: this.state.description,
                        feature: this.state.feature,
                        other: this.state.other,
                        filename: this.state.filename,
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
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{this.state.title}</h2>}
                    <h2 className="corner"><a href={this.state.image_URL} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a></h2>
                    <div className="contain-panel-big-item-image">
                        {(currentUserId == creatorId) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.image_URL} className="contain-panel-big-image"/><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={image_URL} className="contain-panel-big-image"/>}
                    </div>
                    <div className="contain-panel-big item-info">
                        <h4 className="no-margin h4-item-inside-panel-wrap h4-item-inside-panel-spacing">Description</h4>
                        {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" type="text" name="description" className="p-editable p-editable-bottom-spacing" onChange={this.handleChange}  onBlur={this.submitChange}>{this.state.description}</textarea></p> : <p className="p-non-editable-bottom-wrap">{description}</p>}
                    </div>
                    <table className="contain-panel-big-two "><tr><td>
                        <div className="contain-panel-big contain-panel-big-half-left item-info">
                            <h4 className="no-margin h4-item-inside-panel-wrap h4-item-inside-panel-spacing">Features</h4>
                            {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" type="text" name="feature" className="p-editable p-editable-bottom-spacing" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.feature}</textarea></p> : <p className="p-non-editable-bottom-wrap">{feature}</p>}
                        </div>
                    </td><td>
                        <div className="contain-panel-big contain-panel-big-half-right item-info">
                            <h4 className="no-margin h4-item-inside-panel-wrap h4-item-inside-panel-spacing">More Explanation</h4>
                            {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" type="text" name="other" className="p-editable p-editable-bottom-spacing" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.other}</textarea></p> : <p className="p-non-editable-bottom-wrap">{other}</p>}
                        </div>
                    </td></tr>
                    </table>
                </div>

                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Information</h3>
                    <div className="item-info-div">
                    <table className="item-info-table">
                        <tbody>
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="filename" name="filename" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.filename}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><a href={publication_link} className="body-link">{this.state.filename}</a></td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="license">License:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="license" name="license" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.license}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">License:</label></td><td className="publication-table-info-right">{this.state.license}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><p className="no-margin"><input type="date" name="publicationDate" id="publicationDate" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.publicationDate} className="p-editable date-editable-input"/></p></td></tr> : <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><span className="no-margin">{this.state.publicationDate}</span></td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", className: "l-editable-input", name: "keywords", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.keywords)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.keywords).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}

                           <tr className="p-noneditable padding-top-25"><td className="publication-table-info-left"><label for="createdAt">Created At:</label></td><td className="publication-table-info-right">{createdAt}</td></tr>
                           <tr className="p-noneditable"><td className="publication-table-info-left"><label for="updatedAt">Updated At:</label></td><td className="publication-table-info-right">{updatedAt}</td></tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Author(s)</h3>
                    <div className="item-authors-div">
                        <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-small-image"/></a>
                        <a href="/profile/erinbush" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/8/005/0b3/113/19491d0.jpg" className="contain-panel-small-image"/></a>
                    </div>
                </div>
            </div>
        </div>
        );
    }
});

ReactDOM.render(<Model/>, document.getElementById('content'));