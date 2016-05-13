// Modal component used by all entries. Currently supports deleting entry. Future: changing file/image upload
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

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
        callback('Successfully deleted. Redirecting to newsfeed in a few seconds...', false);
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
        return (
            <span>
                <span className="glyphicon glyphicon-remove space settings-btn" onClick={this.open}></span>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {/*<div id="">
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
                        </div>*/}

                        <h4>Are you sure you want to delete this entry?</h4>
                        <p>{this.state.message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Cancel</Button><Button bsStyle="danger" onClick={this.delete} disabled={this.state.isDisabled}>Delete</Button>
                    </Modal.Footer>
                </Modal>
            </span>
        );
    }
});