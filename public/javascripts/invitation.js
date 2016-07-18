var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var InviteModal = React.createClass({
	getInitialState: function() {
		return {

		}
	},
	handleSubmit: function() {

	},
	render:function(){
        return (
            <div className="row">
                <div className="col-xs-12">
                    <form>
                        <label>Title</label>
                        < ReactMultiSelect />
                        <input>
                            placeholder="Enter email"
                            className="creatediscussion-topic"
                            type="text"
                        </input>
                        <textarea
                         rows="8" cols="50"
                         className="creatediscussion-input" >
                        </textarea>
                        <button type="submit" value="Submit"></button>
                    </form>
                </div>
            </div>
        );
    }
});

var ModalButton = React.createClass({
	getInitialState: function() {
		return {
			showModal: false
		}
	},
	closeModal: function() {
		this.setState({showModal: false});
	},
	openModal: function() {
		this.setState({showModal: true});
	},
	render: function() {
		return (
			<Modal show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Invite a Friend</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                       <InviteModal />
                </Modal.Body>
            </Modal>
		)
	}
});

var DropDown = React.createClass({
	render: function() {
		return (
            <ul className="dropdown-menu">
                <li><a href="/create/organization">Create Organizational Homepage</a></li>
                <li><a href="/report">Report Problem | Share Idea</a></li>
                <li><ModalButton /></li>
            </ul>
		)
	}
});
ReactDOM.render(
  <DropDown />,
  document.getElementById('mainDropdown')
);