var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Model = React.createClass ({
    getInitialState: function() {
     return {
        title: [title],
        description: [description],
        feature: [feature],
        other: [other],

        objectId: [objectId],
        image_URL: [image_URL],

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
                        other: this.state.other};

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
        <div className="content-wrap">
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
            <div className="item-bottom-big">
                    <div className="item-panel contain-panel-big">
                    <div>
                        {(currentUserId == creatorId) ? <h2 className="no-margin"><textarea rows="1" className="contain-panel-big-h2 p-editable" type="text" name="title" onChange={this.handleChange}>{this.state.title}</textarea></h2> : <h2 className="contain-panel-big-h2 p-noneditable">{title}</h2>}
                        <h2 className="corner"><a href="#" className="image-link"><span className="glyphicon glyphicon-check space"></span></a>
                            <a href={image_URL} className="image-link"><span className="glyphicon glyphicon-download space"></span></a>
                        </h2>
                    </div>
                    <div>
                    <table className="model-layout">
                    <tr><td className="model-layout-td-left">
                        <div className="contain-panel-big-p2">
                            <h4>Description</h4>
                            {(currentUserId == creatorId) ? <p className="no-margin"><textarea type="text" name="description" className="p-editable" onChange={this.handleChange}  onBlur={this.submitChange}>{this.state.description}</textarea></p> : <p className="p-noneditable">{description}</p>}
                        </div>
                    </td><td>
                        {(currentUserId == creatorId) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.image_URL} className="contain-panel-big-image"/><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={image_URL} className="contain-panel-big-image"/>}
                    </td></tr>
                    <tr><td className="model-layout-td-left">
                        <div className="contain-panel-big-p">
                            <h4>Features</h4>
                            {(currentUserId == creatorId) ? <p className="no-margin"><textarea type="text" name="feature" className="p-editable" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.feature}</textarea></p> : <p className="p-noneditable">{feature}</p>}
                        </div>
                    </td><td>
                        <div className="contain-panel-big-p">
                            <h4>More Explanation</h4>
                            {(currentUserId == creatorId) ? <p className="no-margin"><textarea type="text" name="other" className="p-editable" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.other}</textarea></p> : <p className="p-noneditable">{other}</p>}
                        </div>
                    </td></tr>
                    </table>
                    </div>
                    </div>
                    <div className="item-panel contain-panel-big">
                    <div>
                        <h4 className="contain-panel-big-h4">Developer(s)</h4>
                    </div>
                    <div>
                        <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons"/></a>
                        <a href="/profile/erinbush" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/8/005/0b3/113/19491d0.jpg" className="contain-panel-big-icons"/></a>
                    </div>
                    </div>
                    <div className="item-panel contain-panel-big">
                    <div>
                        <h4 className="contain-panel-big-h4">Discussions</h4>
                    </div>
                    <div>
                    <table>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    </table>

                    <form role="comment" method="post" action="/comment">
                        <div className="input-group contain-panel-big-input-group">
                            <input type="text" placeholder="Comment..." className="form-control comment-bar"/>
                            <button type="submit" className="btn btn-primary btn-comment">Post</button>
                        </div>
                    </form>
                    </div>
                    </div>
            </div>
            <div className="item-bottom-3">
                    <div className="item-panel contain-panel-above"><h5>Publication Link</h5><br/>
                        <a href={"/publication/" + publication_link} className="body-link">Published Here!</a>
                    </div>
                    <div className="item-panel contain-panel"><h5>Ratings</h5><br/>
                        48 Syncholarity Factor<br/>
                        2000 Times Cited<br/>
                        12000 Profile Views
                    </div>
                    <div className="item-panel contain-panel"><h5>Who Has Used This</h5><br/>
                        {this.props.groups.map(function(listValue){
                            return <a href="#" className="body-link">{listValue}<br/></a>;
                        })}
                    </div>
                    <div className="item-panel contain-panel"><h5>License Information</h5><br/>
                        {license}
                    </div>
                    <div className="item-panel contain-panel"><h5>Developed At</h5><br/>
                        <a href="/organization/AJgSwufvvO" className="body-link">University of British Columbia (UBC)</a>
                    </div>
                    <div className="item-panel contain-panel"><h5>Keywords</h5><br/>
                        {this.props.keywords.map(function(listValue){
                            return <a href="#" className="body-link">{listValue} </a>;
                        })}
                    </div>
                    <div className="item-panel contain-panel"><h5>Date Created</h5><br/>
                        {createdAt}
                    </div>
                <div className="extend-bottom">&nbsp;</div>
            </div>
        </div>
        );
    }
});

ReactDOM.render(<Model
    groups={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    keywords={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}/>,
    document.getElementById('content'));