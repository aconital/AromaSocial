// Modal component used by all entries. Currently supports deleting entry. Future: changing file/image upload
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;
var Tab = ReactBootstrap.Tab, Tabs = ReactBootstrap.Tabs;

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

var SettingsModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false,
            activeKey: 3,
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
    handleSelect(eventKey) {
        event.preventDefault();
        console.log(`selected ${eventKey}`);
        this.setState({ activeKey: eventKey });
    },

    render() {
        const tooltip_settings = (
            <Tooltip id="tooltip_settings"><strong>Settings</strong></Tooltip>
        );

        return (
            <span>
                <OverlayTrigger placement="top" overlay={tooltip_settings}>
                    <span className="glyphicon glyphicon-pencil space settings-btn" onClick={this.open}></span>
                </OverlayTrigger>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs activeKey={this.state.activeKey} onSelect={this.handleSelect}>
                            <Tab  eventKey={1} title="Update File">
                                <UpdateTab type="File" msg={this.state.message} />
                            </Tab>
                            <Tab  eventKey={2} title="Update Picture">
                                <UpdateTab type="Picture" msg={this.state.message} />
                            </Tab>
                            <Tab eventKey={3} title="Delete">
                                <DeleteTab delete={this.delete} msg={this.state.message} />
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button><Button bsStyle="primary" className="del-btn" onClick={this.close} disabled={this.state.isDisabled}>Save</Button>
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
        };
    },

    render() {
        return (
            <div id="">
                <h4>Update Uploaded {this.props.type}</h4>
                <p>You can upload a new {this.props.type} to associate with this entry page.</p>
                <input className="form-control" type="file" name="publication-upload" id="" required onChange={this.handleFile} />
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
