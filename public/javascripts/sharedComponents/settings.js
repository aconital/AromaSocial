// Modal component used by all entries. Currently supports deleting entry. Future: changing file/image upload
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;
var Tab = ReactBootstrap.Tab, Tabs = ReactBootstrap.Tabs;

// used when the settings modal is accessed from a list of entries (eg. profile, organization)
var settingsModalDeleteListEntry = function(path, callback) {
    // TODO refresh parent somehow; add functionality

    $.ajax({
        url: path,
        type: 'DELETE'
    }).done(function(status) {
        callback('Successfully deleted.')
        setTimeout(function(){
            console.log('TODO: refresh')
        }, 3000); 
    }).fail(function(xhr, status, err) {
        console.log(status + ': ' + err);
        callback('Error: ' + err);
    });
};

// used when the settings modal is accessed from entry detail pages
var settingsModalDeleteEntry = function(callback) {
    if (this.pub_class) {
        // need to overwrite path for publications and add query params
        path = '/publication/' + this.objectId + '?pub_class=' + this.pub_class;
    }

    $.ajax({
        url: path, // this is bound to parent's path var
        type: 'DELETE'
    }).done(function(status) {
        callback('Successfully deleted. Redirecting to newsfeed in a jiffy...', false);
        setTimeout(function(){ // redirect to homepage
            window.location = '../..';
        }, 2000); 
    }).fail(function(xhr, status, err) {
        console.log(status + ': ' + err);
        callback('Error: ' + err, true);
    });
};

// used to update uploaded file or picture
var settingsModalUpdateEntry = function(callback) {

};

var SettingsModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false,
            activeKey: 1,
            message: 'This action cannot be undone.' };
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    setMsg(status, buttonState) {
        this.setState({ message: status, isDisabled: buttonState });
    },
    delete() {
        console.log('here');
        this.setMsg('In progress...');
        if (this.props.isList) {
            this.props.delete(this.props.path, this.setMsg);
        } else {
            this.props.delete(this.setMsg);
        }
        console.log("end");
    },
    update() {
        // ...
        this.props.update();
    },
    handleSelect(eventKey) {
        event.preventDefault();
        console.log(`selected ${eventKey}`);
        this.setState({ activeKey: eventKey });
    },

    render() {
        const tooltip_settings = (
            <Tooltip id="tooltip_settings"><strong>Settings</strong></Tooltip>
        );
        var isPub = window.location.pathname.indexOf('publication') > 0;

        return (
            <span>
                <OverlayTrigger placement="top" overlay={tooltip_settings}>
                    <span className="glyphicon glyphicon-cog space settings-btn" onClick={this.open}></span>
                </OverlayTrigger>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs id="settings-menu" activeKey={this.state.activeKey} onSelect={this.handleSelect}>
                            <Tab id="file" eventKey={1} title="Update File">
                                <UpdateTab type="File" msg={this.state.message} isPub={isPub} />
                            </Tab>
                            {/* <Tab id="picture" disabled={isPub} eventKey={2} title="Update Picture">
                                <UpdateTab type="Picture" msg={this.state.message} />
                            </Tab> */}
                            <Tab id="delete" eventKey={3} title="Delete">
                                <DeleteTab delete={this.delete} msg={this.state.message} />
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Done</Button>
                    </Modal.Footer>
                </Modal>
            </span>
        );
    }
});

var UpdateTab = React.createClass({
    getInitialState() {
        return {
            disabled: false,
            buttonText: 'Update',
        };
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
    handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
         self.setState({
           file: upload.target.result,
           fileType: extension,
         });
        }
        reader.readAsDataURL(file);
    },
    handleButton: function(e) {
        var dataForm = {file: this.state.file, fileType: this.state.fileType};
        this.setState({ buttonText: "Uploading. Give us a sec...",
                        disabled: true });
        if (this.props.isPub) {
            console.log(path);
            dataForm['pub_class'] = path.match(/\/publication\/(.*)\//i)[1];
            path = '/publication' + path.substr(path.lastIndexOf("/")); // get objectId
            console.log(path, dataForm.pub_class);
        }

        $.ajax({
            url: path + "/upload",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(status) {
                console.log(status);
                // this.setState({file: this.state.file});
                this.setState({ buttonText: "Update",
                                disabled: false });
                location.reload();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/upload", status, err.toString());
                this.setState({ buttonText: "Error. Please try again." });
                this.setState({ disabled: false });
            }.bind(this)
        });
        return;
    },

    render() {
        return (
            <div id="">
                <h4>Update Uploaded {this.props.type}</h4>
                <p>You can upload a new {this.props.type} to associate with this entry page.</p>
                <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handleFile} />
                <p></p>
                <Button block bsStyle="success" disabled={this.state.disabled} onClick={this.handleButton}>{this.state.buttonText}</Button>
            </div>
        );
    }
});

var DeleteTab = React.createClass({
    getInitialState() {
        return {
            disabled: false,
            buttonText: 'Delete'
        };
    },
    handleButton(e) {
        var conf = confirm("Are you sure you want to delete this page?");
        if (conf == true) {
            this.setState({ disabled: true,
                            buttonText: 'Deleting entry. Please wait...' });
            this.props.delete();
        } else {
            console.log("not deleted");
        }
    },

    render() {
        return (
            <div id="">
                <h4>Delete Entry</h4>
                <p>You can delete the current entry page and all of its contents.</p>
                <p>Caution: This action cannot be undone.</p>
                <Button block bsStyle="danger" disabled={this.state.disabled} onClick={this.handleButton}>{this.state.buttonText}</Button>
            </div>
        );
    }
});
