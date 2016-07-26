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

ReactDOM.render(
  <ModalButton />,
  document.getElementById('testDiv')
);