// Sign up steps
var Button = ReactBootstrap.Button;
var Pagination = ReactBootstrap.Pagination;
var PageHeader = ReactBootstrap.PageHeader;
var Panel = ReactBootstrap.Panel;

var SignUpSteps = React.createClass({
	getInitialState() {
		return {
			step: 1
		}
	},

	getStep() {
		switch(this.state.step) {
			case 1:
				return <Introduction />
			case 2:
				return <Profile />
			case 3:
				return <Import />
			case 4:
				return <Networks />
			case 5:
				return <Confirmation />
		}
	},

	setStep(step) {
		console.log(step);
		this.setState({ step: step });
	},

	render() {
		var stepPanel = this.getStep();
		return (
			<div style={{textAlign: 'center'}}>
				<PageHeader>Getting Started <small>Tell other Sycholars a little about yourself</small></PageHeader>
				
				<Panel>
					{stepPanel}
				</Panel>
				<PageNav prev next step={this.state.step} setStep={this.setStep} />
			</div>
		);
	}
});

var PageNav = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	handleSelect(eventKey) {
		console.log(eventKey, this.props);
		this.setState({
	  		activePage: eventKey
		});
		this.props.setStep(eventKey);
	},

	render() {
		return (
			<div>
				<Pagination bsSize="large" items={5} activePage={this.state.activePage} onSelect={this.handleSelect} />
			</div>
		);
	}
});

var Introduction = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	skip() {
		//TODO POST to user, set signup_steps to -1
		window.location = '../';
	},

	render() {
		return (
			<div>
				<h3>Let's start by filling in some basic details in your profile page.</h3>
					
				<Button bsStyle="danger" onClick={this.skip} >Skip and continue to Syncholar</Button><Button bsStyle="success">Next Step</Button>
			</div>
		);
	}
});

var Profile = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	render() {
		return (
			<div>
				<h3>Profile</h3>
				Form here - Bio/Summary, Skills/Interests, Education, Work
			</div>
		);
	}
});

var Import = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	render() {
		return (
			<div>
				<h3>Import Publications</h3>
				Form here
			</div>
		);
	}
});

var Networks = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	render() {
		return (
			<div>
				<h3>Connect</h3>
				Form here - Invite others, join recommended networks
			</div>
		);
	}
});

var Confirmation = React.createClass({
	getInitialState() {
		return {
	  		activePage: 1
		};
	},

	render() {
		return (
			<div>
				<h3>Almost there!</h3>
				<div>Are you done with sign up steps? You can edit all of these fields from your profile.</div><br />
				<Button bsStyle="success">Finish and continue to Syncholar</Button>
			</div>
		);
	}
});

$( document ).ready(function() {
	ReactDOM.render(<SignUpSteps />, document.getElementById('content'));
});
