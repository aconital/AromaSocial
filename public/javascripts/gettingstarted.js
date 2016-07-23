// Sign up steps
var Button = ReactBootstrap.Button;
var Pagination = ReactBootstrap.Pagination;
var PageHeader = ReactBootstrap.PageHeader;
var Panel = ReactBootstrap.Panel;

var SignUpSteps = React.createClass({
	getInitialState() {
		console.log(currStep, typeof currStep);
		return {
			step: parseInt(currStep) || 1, 
			maxStep: parseInt(currStep) || 1
		}
	},

	getStep() {
		switch(this.state.step) {
			case 1:
				return <Introduction setStep={this.setStep} />
			case 2:
				return <Profile setStep={this.setStep} />
			case 3:
				return <Import setStep={this.setStep} />
			case 4:
				return <Networks setStep={this.setStep} />
			case -1:
			case 5:
				return <Confirmation setStep={this.setStep} />
		}
	},

	setStep(step) {
		this.setState({ step: step });
		if (step > this.state.maxStep) { // only want to POST furthest step reached
			console.log('update max step');
			this.sendStep(step);
		}
	},

	sendStep: function(step) {
        var dataForm = {signup_steps: step};
        $.ajax({
            url: path,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            success: function(status) {
                console.log("Updated");
                this.setState({ maxStep: this.state.step });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/post step", status, err.toString());
            }.bind(this)
        });
        return;
    },

	render() {
		var stepPanel = this.getStep();
		return (
			<div style={{textAlign: 'center'}}>
				<PageHeader>Getting Started <small>Tell other Syncholars a little about yourself</small></PageHeader>
				
				<Panel>
					{stepPanel}
				</Panel>
				<PageNav step={this.state.step} setStep={this.setStep} />
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
				<Pagination bsSize="large" items={5} activePage={this.props.step} onSelect={this.handleSelect} />
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
		var dataForm = {signup_steps: -1};
        $.ajax({
            url: path,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            success: function(status) {
                console.log("Updated and skipping");
                this.setState({ maxStep: this.state.step });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/post step", status, err.toString());
            }.bind(this)
        });
		window.location = '../';
	},

	next() {
		this.props.setStep(this.state.activePage+1);
	},

	render() {
		return (
			<div>
				<h3>Let's start by filling in some basic details in your profile page.</h3>
				<p>All fields are optional and can be accessed later in your profile.</p>
				<Button bsStyle="danger" onClick={this.skip}>Skip and continue to Syncholar</Button> <Button bsStyle="success" onClick={this.next} >Next Step</Button>
			</div>
		);
	}
});

var Profile = React.createClass({
	getInitialState() {
		return {
	  		activePage: 2,
	  		institution: '', start: null, end: null, degree: '', major: '', department: '', description: '',
	  		workCompany: '', workStart: null, workEnd: null, workTitle: '', workDescription: '', isCurrent: false
		};
	},

	handleChange(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },

	next() {
		var education = {institution: this.state.institution, start_date: this.state.start, end_date: this.state.end,
			faculty: this.state.major, description: this.state.description, department: this.state.department};
        $.ajax({
            url: '/education',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(education),
            success: function(status) {
                console.log("Updated education");

                var workDescription = {company: this.state.workCompany, start_date: this.state.workStart, end_date: this.state.workEnd,
					position: this.state.position, description: this.state.workDescription};
		        $.ajax({
		            url: '/workExperience',
		            dataType: 'json',
		            contentType: "application/json; charset=utf-8",
		            type: 'POST',
		            data: JSON.stringify(workDescription),
		            success: function(status) {
		                console.log("Updated workDescription");
		                // this.setState({ maxStep: this.state.step });

		                this.props.setStep(this.state.activePage+1);
		            }.bind(this),
		            error: function(xhr, status, err) {
		                console.error(path + "/post work", status, err.toString());
		            }.bind(this)
		        });

            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/post education", status, err.toString(), xhr);
            }.bind(this)
        });
	},

	render() {

		return (
			<div>
				<h3>Profile</h3>
				<p>Add some basic information about yourself. Give us a brief summary of your yourself, some of your research interests, and your most recent education and work experiences.</p>
				<div id="resume-education" className="div-relative"><hr/>
                    <h3 className="no-margin-top">Education</h3>
                	<div className="h4-resume-item display-inline-block ">
                        <input type="text" className="r-editable r-editable-full" name="institution" placeholder="Institution" onChange={this.handleChange} value={this.state.institution}/>
                        <span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                            <input type="date" name="start" onChange={this.handleChange} value={this.state.start} className="r-editable r-editable-date"/>
                        </span>
                        <span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
                             <input type="date" name="end" onChange={this.handleChange} value={this.state.end} className="r-editable r-editable-date"/>
                        </span>
                		<span><input type="text" className="r-editable r-editable-full" name="degree" placeholder="Degree" onChange={this.handleChange} value={this.state.degree}/></span>
                		<span><input type="text" className="r-editable r-editable-full" name="major" placeholder="Major" onChange={this.handleChange} value={this.state.major}/></span>
                		<textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleChange}>{this.state.description}</textarea>
                    </div>   	
                </div>

                <div className="div-relative"><hr/>
                    <h3 className="no-margin-top">Work Experience</h3>
                    <div className="h4-resume-item display-inline-block">
                        <input type="text" className="r-editable r-editable-full" name="company" placeholder="Company" onChange={this.handleChange} value={this.state.company}/>
                        <span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                            <input type="date" name="workStart" onChange={this.handleChange} value={this.state.workStart} className="r-editable r-editable-date"/>
                        </span>
                        <span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
                             <input type="date" name="workEnd" onChange={this.handleChange} value={this.state.workEnd} className="r-editable r-editable-date"/>
						</span>
						<span><input type="text" className="r-editable r-editable-full" name="position" placeholder="Position" onChange={this.handleChange} value={this.state.position}/></span>
						<textarea type="text" className="r-editable r-editable-full" name="workDescription" placeholder="Description" onChange={this.handleChange}>{this.state.workDescription}</textarea>
                    </div>
                </div>

                <Button>Previous</Button> <Button bsStyle="success" onClick={this.next}>Save & Next</Button>
			</div>
		);
	}
});

var Import = React.createClass({
	getInitialState() {
		return {
	  		activePage: 3
		};
	},

	next() {
		console.log('nav to networks recommended');
		this.props.setStep(this.state.activePage+1);
	},

	render() {
		return (
			<div>
				<h3>Import Publications</h3>
				<p>Would you like to import your publications into your profile? We will search for your name as entered on signup. You can access this import tool anytime from the <strong>Publications</strong> tab in your profile.</p>
				<ImportContent signup={true} next={this.next} />
			</div>
		);
	}
});

var Networks = React.createClass({
	getInitialState() {
		return {
	  		activePage: 4
		};
	},
	
	next() {
		console.log('nav to networks recommended');
		this.props.setStep(this.state.activePage+1);
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
	  		activePage: 5
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
