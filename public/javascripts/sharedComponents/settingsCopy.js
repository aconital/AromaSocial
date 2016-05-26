// Modal component used by all entries. Currently supports deleting entry. Future: changing file/image upload
var Modal = ReactBootstrap.Modal;
var Nav = ReactBootstrap.Nav, NavItem = ReactBootstrap.NavItem, NavDropdown = ReactBootstrap.NavDropdown, MenuItem = ReactBootstrap.MenuItem;
var Button = ReactBootstrap.Button, DropdownButton = ReactBootstrap.DropdownButton;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;
// TODO restore

// used when the settings modal is accessed from a list of entries (eg. profile, organization)
var settingsModalDeleteListEntry = function(path, callback) {
    // TODO refresh parent somehow

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

var settingsUploadMoreFiles = function() {

};

var settingsEditFiles = function() {
    // TODO
}

var SettingsModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false,
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
    // delete() {
    //     console.log('here');
    //     this.setMsg('In progress...');
    //     if (this.props.isList) {
    //         this.props.delete(this.props.path, this.setMsg);
    //     } else {
    //         this.props.delete(this.setMsg);
    //     }
    //     console.log("end");
    // },
    handleSelect(eventKey) {
        event.preventDefault();
        alert(`selected ${eventKey}`);
    },

    render() {

        const tooltip_del = (
            <Tooltip><strong>Delete!</strong></Tooltip>
        );
        return (
            <span>
                <span className="glyphicon glyphicon-remove space settings-btn" onClick={this.open}></span>

                <DeleteEntryModal open={this.open} delete={this.props.delete} />
                    
                {/*<Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div id="">
                            <h4>Update Uploaded File</h4>
                            <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handleFile} />
                        </div>

                        <div id="">
                            <h4>Update Uploaded Picture</h4>
                            <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handlePicture} />
                        </div>

                        <div id="">
                            <h4>Delete Entry</h4>
                            <p>Caution: This action cannot be undone. Please save changes to complete the operation.</p>
                            <Button block bsStyle="danger" onClick={this.TODO}>Delete</Button>
                        </div>

    <DropdownButton bsStyle="default" className="glyphicon glyphicon-remove space settings-btn" noCaret id="dropdown-no-caret">
      <MenuItem eventKey="1">Action</MenuItem>
      <MenuItem eventKey="2">Another action</MenuItem>
      <MenuItem eventKey="3">Something else here</MenuItem>
      <MenuItem divider />
      <MenuItem eventKey="4">Separated link</MenuItem>
    </DropdownButton>

                        <h4>Are you sure you want to delete this entry?</h4>
                        <p>{this.state.message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button><Button bsStyle="danger" className="del-btn" onClick={this.delete} disabled={this.state.isDisabled}>Delete</Button>
                    </Modal.Footer>
                </Modal>*/}
            </span>
        );
    }
});

var DeleteEntryModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false,
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

    render() {
        <Modal show={this.state.showModal} onHide={this.close}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>Are you sure you want to delete this entry?</h4>
                <p>{this.state.message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={this.close}>Cancel</Button><Button bsStyle="danger" className="del-btn" onClick={this.delete} disabled={this.state.isDisabled}>Delete</Button>
            </Modal.Footer>
        </Modal>
    }
});

var UploadFilesModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
        };
    },

    render() {
        <Modal>
        </Modal>
    }
});

var DeleteFilesModal = React.createClass({
    getInitialState() {
        return {
            showModal: false,
        };
    },

    render() {
        <Modal>
        </Modal>
    }
});