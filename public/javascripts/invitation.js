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
                        <ReactMultiSelect />
                        <input
                            placeholder="Enter email"
                            type="text" >
                        </input>
                        <textarea
                         rows="5" cols="50" >
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
			showModal: true
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
			<div>
			<Button onClick={this.openModal}>
	          Launch modal
	        </Button>

			<Modal show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Invite a Friend</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                       <InviteModal />
                </Modal.Body>
            </Modal>
            </div>
		)
	}
});


var DropDown = React.createClass({
	render: function() {
		return (
            <li className="dropdown">
                <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <span className="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span> Menu <span className="caret"></span>
                </a>
                <ul className="dropdown-menu">
                    <li><a href="/create/organization">Create Organizational Homepage</a></li>
                    <li><a href="/report">Report Problem | Share Idea</a></li>
                </ul>
            </li>
		)
	}
});
ReactDOM.render(
  <ModalButton />,
  document.getElementById('testDiv')
);