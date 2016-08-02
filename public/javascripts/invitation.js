var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;

var InviteUserModal = React.createClass({
	getInitialState: function() {
		return {
			user: {},
			msg: ''
		}
	},
	handleUsersChange: function(usr) {
		console.log(usr);
		this.setState({user: usr});
		console.log(this.state.user);
	},
	handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
	handleSubmit: function() {
		this.props.submitHandler(this.state.user.objectId);
		//console.log(this.state.user);
	},
	render:function(){
        return (
            <div className="row">
                <div className="col-xs-12">
                    <form className="form" onSubmit={this.handleSubmit}>
                        <b>Send notifications to users part of Syncholar</b>
                        <ReactMultiSelect changeHandler={this.handleUsersChange} multi={false}/>
                        {/*<Input type="textarea" label="Message" name="msg" onChange={this.handleChange} value={this.state.msg} rows="5"/>*/}
                        <Modal.Footer>
                            <div>
		                        <a onClick={this.handleSubmit} className="submit-discussion">Invite</a>
		                    </div>
                        </Modal.Footer>
                    </form>
                </div>
            </div>
        );
    }
});

var InviteNonUserModal = React.createClass({
	getInitialState: function() {
		return {
			email: '',
			msg: ''
		}
	},
	handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
	handleSubmit: function() {
		this.props.submitHandler(this.state.email);
		//console.log(this.state.email);
	},
	render: function() {
		return (
            <div className="row">
                <div className="col-xs-12">
                    <form className="form" onSubmit={this.handleSubmit}>
                        <Input type="text" label="Invite through E-mail" name="email" onChange={this.handleChange} value={this.state.email} />
                        <Input type="textarea" label="Message" name="msg" onChange={this.handleChange} value={this.state.msg} rows="5"/>
                        <Modal.Footer>
                            <div>
		                        <a onClick={this.handleSubmit} className="submit-discussion">Invite</a>
		                    </div>
                        </Modal.Footer>
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
	handleUserSubmit: function(userId) {
		var url = "/organization/" + this.props.orgId + "/invite/" + userId;
		console.log(url);
		$.ajax({
          url: url,
          dataType: 'json',
          type: 'GET',
          cache: false,
          success: function(response) {
            console.log("Ajax for user notification successful: ", response);
          }.bind(this),
          error: function(xhr, status, err) {
            console.log("Ajax for user notification failed with err: ", err);
          }.bind(this)
        });
	},
	handleNonUserSubmit: function(email, message) {
		console.log(email);
		var emailBody ="<h3> You've been invited to join {{user.fullname}}'s network on Syncholar! </h3><br> <p> You can sign up for Syncholar for free by clicking on the link below: </p>" +
                                            '<a href="https://syncholar.com/">www.syncholar.com</a>' +
                                            '<br><p><b>Invitation code: </b>summer2016 <br><br><p> Syncholar is an information sharing platform and a dynamic and social networked alternative for your research lab or profile webpage.' +
                                            '<br> Academics use Syncholar to:<br>' +
                                            ' - Create a homepage for their research group, lab or network and connect their members.<br>' +
                                            '- Store and share their research outputs.<br>' +
                                            '- Stay up-to-date with their networks activities.<br>' +
                                            '- Discover knowledge and expertise.<br>' +
                                            '- Streamline collaboration within their networks.<br><br>' +
                                            message + '</p>' + '<p><br>-------------------<br>Syncholar Team</p>';
		$.ajax({
          url: "/inviteBuddy",
          dataType: 'json',
          type: 'POST',
          data: {addr: email, msg: message, emailBody: emailBody, invType: 'org2people'},
          cache: false,
          success: function(response) {
            console.log("Ajax for email successful: ", response);
          }.bind(this),
          error: function(xhr, status, err) {
            console.log("Ajax for email failed with err: ", err);
          }.bind(this)
        });
        this.closeModal();
	},
	render: function() {
		return (
			<div>
				<Button className="btn btn-panel createorg_btn" onClick={this.openModal}>
		          {this.props.buttonText}
		        </Button>

				<Modal show={this.state.showModal} onHide={this.closeModal}>
	                <Modal.Header closeButton>
	                    <Modal.Title>Invite a Friend</Modal.Title>
	                </Modal.Header>
	                <Modal.Body>
	                       {this.props.buttonText === "Invite Users" ? <InviteUserModal submitHandler={this.handleUserSubmit}/>:<InviteNonUserModal submitHandler={this.handleNonUserSubmit} />}
	                </Modal.Body>
	            </Modal>
            </div>
		)
	}
});

// ReactDOM.render(
//   <ModalButton />,
//   document.getElementById('testDiv')
// );