// Sign up steps
var Button = ReactBootstrap.Button;
var Pagination = ReactBootstrap.Pagination;
var PageHeader = ReactBootstrap.PageHeader;
var Panel = ReactBootstrap.Panel;

var SignUpSteps = React.createClass({
	getInitialState() {
		return {
			step: parseInt(currStep) || 1, 
			maxStep: parseInt(currStep) || 1
		}
	},

	getStep() {
		switch(this.state.step) {
			case 1:
				return <Introduction setStep={this.setStep} finish={this.finish} />
			case 2:
				return <Profile setStep={this.setStep} />
			case 3:
				return <Import setStep={this.setStep} />
			case 4:
				return <Networks setStep={this.setStep} />
			case -1:
			case 5:
			default:
				return <Confirmation setStep={this.setStep} finish={this.finish} />
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

    finish() {
		var self = this,
			dataForm = {signup_steps: -1};
        $.ajax({
            url: path,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm)
        })
        .done(function(data) {
			self.setState({ maxStep: self.state.step });
			window.location = '../';
		})
		.fail(function(xhr, status, err) {
			console.error(path + "/post step", status, err.toString());
		});
	},

	render() {
		var stepPanel = this.getStep();
		return (
			<div className="getstarted-panel">
				<PageHeader>Getting Started <small>Tell other Syncholars a little about yourself</small></PageHeader>
				
				<Panel style={{textAlign: 'center'}}>
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
		this.setState({
	  		activePage: eventKey
		});
		this.props.setStep(eventKey);
	},

	render() {
		return (
			<div style={{textAlign: 'center'}}>
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

	next() {
		this.props.setStep(this.state.activePage+1);
	},

	render() {
		return (
			<div className="row">
				<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
					<h3>Let's start by filling in some basic details in your profile page.</h3>
					<p>All fields are optional and can be accessed later in your profile.</p><br />
					<Button className="passive-button" onClick={this.props.finish}>I'll do it later</Button> <Button className="active-button" onClick={this.next} >Begin</Button>
				</div>
			</div>
		);
	}
});

var Profile = React.createClass({
	getInitialState() {
		return {
	  		activePage: 2,
	  		summary: '',
	  		institution: '', start: null, end: null, degree: '', major: '', description: '',
	  		workCompany: '', workStart: null, workEnd: null, workTitle: '', workDescription: '', isCurrent: false
		};
	},

	handleChange(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    updateState(type,obj)
	{
		if(type ==="institution")
		{
			console.log(obj);
			this.setState( {institution:obj} );
		}
		else if(type==="company")
		{
			this.setState( {workCompany:obj} );
		}

	},
	next() {
		// Send education to server
		var education = {institution: this.state.institution, start_date: this.state.start, end_date: this.state.end,
			faculty: this.state.major, description: this.state.description, degree: this.state.degree};
        $.ajax({
            url: '/education',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(education),
            success: function(status) {
                console.log("Updated education");

                // Send work experience to server
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

		                // Send summary to server
		                $.ajax({
				            url: '/profile/' + username + '/updateSummary',
				            dataType: 'json',
				            contentType: "application/json; charset=utf-8",
				            type: 'POST',
				            data: JSON.stringify({summary: this.state.summary.replace(/(\r\n|\n|\r|\\)/gm,'\\n')}),
				            processData: false,
				            success: function(status) {
				                console.log("Updated summary");

				                // Proceed to next page
				                this.props.setStep(this.state.activePage+1);
				            }.bind(this),
				            error: function(xhr, status, err) {
				                console.error(path + "/post summary", status, err.toString());
				            }.bind(this)
				        });

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
				<div className="row">
					<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
						<p>Add some basic information about yourself. Give us a brief summary of your yourself, some of your research interests, and your most recent education and work experiences.</p>

						<div id="resume-education" className="div-relative"><hr/>
							<h3 className="no-margin-top">Summary</h3>
							<div className="h4-resume-item display-inline-block ">
								<textarea type="text" className="r-editable r-editable-full" name="summary" placeholder="Summary or Biography" onChange={this.handleChange} rows="5" value={this.state.summary} ></textarea>
							</div>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
						<div id="resume-education" className="div-relative"><hr/>
							<h3 className="no-margin-top">Education</h3>
							<div className="h4-resume-item display-inline-block ">
								<SearchInput name="institution" placeholder="Latest School" updateState={this.updateState}  />
								<span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
									<input type="date" name="start" onChange={this.handleChange} value={this.state.start} className="r-editable r-editable-date"/>
								</span>
								<span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
									 <input type="date" name="end" onChange={this.handleChange} value={this.state.end} className="r-editable r-editable-date"/>
								</span>
								<span><input type="text" className="r-editable r-editable-full" name="degree" placeholder="Degree" onChange={this.handleChange} value={this.state.degree}/></span>
								<span><input type="text" className="r-editable r-editable-full" name="major" placeholder="Major" onChange={this.handleChange} value={this.state.major}/></span>
								<textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleChange} value={this.state.description}></textarea>
							</div>
						</div>
					</div>
				</div>

                <div className="row">
					<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
						<div className="div-relative"><hr/>
							<h3 className="no-margin-top">Work Experience</h3>
							<div className="h4-resume-item display-inline-block">
								<SearchInput name="company" placeholder="Latest Company" updateState={this.updateState}/>
								<span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
									<input type="date" name="workStart" onChange={this.handleChange} value={this.state.workStart} className="r-editable r-editable-date"/>
								</span>
								<span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
									 <input type="date" name="workEnd" onChange={this.handleChange} value={this.state.workEnd} className="r-editable r-editable-date"/>
								</span>
								<span><input type="text" className="r-editable r-editable-full" name="position" placeholder="Position" onChange={this.handleChange} value={this.state.position}/></span>
								<textarea type="text" className="r-editable r-editable-full" name="workDescription" placeholder="Description" onChange={this.handleChange} value={this.state.workDescription} ></textarea>
							</div>
						</div>
					</div>
				</div>
                <Button className="passive-button">Previous</Button> <Button className="active-button" onClick={this.next}>Save & Next</Button>
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

	render() { // ImportContent is declared in public/javascripts/import.js
		return (
			<div className="row">
				<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
					<h3>Import Publications</h3>
					<p>Would you like to import your publications into your profile? We will search for your name as entered on signup. You can access this import tool anytime from the <strong>Publications</strong> tab in your profile.</p>
					<ImportContent signup={true} next={this.next} />
				</div>
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
			<div className="row">
				<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
					<h3>Connect</h3>
					Form here - Invite others, join recommended networks
				</div>
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
			<div className="row">
				<div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
					<h3>Almost there!</h3>
					<div>Are you done with sign up steps? You can edit all of these fields from your profile.</div><br />
					<Button className="active-button" onClick={this.props.finish}>Finish and continue to Syncholar</Button>
				</div>
			</div>
		);
	}
});


var SearchInput = React.createClass({
	getInitialState: function() {
		return {
			value: '',
			data: [],
			ajaxTimer: null
		};
	},
	componentWillMount: function() {
		this.state.ajaxTimer = setTimeout(this.inputChange, 60000);
		clearTimeout(this.state.ajaxTimer);
	},
	inputChangeWrapper: function(inputValue) {
		clearTimeout(this.state.ajaxTimer);
		this.state.ajaxTimer = setTimeout(this.inputChange.bind(null, inputValue), 200);
	},
	inputChange: function(inputValue) {
		this.state.data = [];
		if (inputValue.length <= 0) return;
		var newValue= {label: inputValue, value: inputValue, category: "Organizations", imgsrc: null, link: null, objectId: null, buttonText: null};
		this.setState({value: newValue});
		this.props.updateState(this.props.name,newValue);

		var that = this;
		var str = inputValue;
		var r = [];
		$.when(

			$.ajax({
				url: '/allorganizations',
				dataType: 'json',
				type: 'POST',
				data: {substr: str, limit: 5},
				cache: false,
				success: function(data) {
					$.map(data, function(item){
						var dlink = "/organization/" + item.name;
						r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
					});
				},
				error: function(xhr) {
					console.log(xhr.status);
				}
			})
		).then(function() {
				that.setState({data: r});
			});
	},
	updateValue (newValue) {
		this.setState({
			value: newValue
		});
		//pass it to the parent
		this.props.updateState(this.props.name,newValue);
	},

	preventDefault: function(link, event) {
		event.preventDefault();
		event.stopPropagation();
		// window.location.href = link;
	},
	truncate: function(str) {
		if (str.length >= 45) {
			return str.substring(0, 45) + "...";
		} else {
			return str;
		}
	},
	onBlurHandler: function(event) {
	},
	getOptions: function(input, callback) {
		var that = this;
		var str = input;
		var r = [];
		$.when(
			$.ajax({
				url: '/allorganizations',
				dataType: 'json',
				type: 'POST',
				data: {substr: str},
				cache: false,
				success: function(data) {
					$.map(data, function(item){
						var dlink = "/organization/" + item.name;
						r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
					});
				},
				error: function(xhr) {
					console.log(xhr.status);
				}
			})
		).then(function() {
				callback(
					null, {
						options: r
					}
				);
				that.setState({data: r});
			});
	},
	render: function () {
		return (
			<div>
				<div >
					<Select
						placeholder={this.props.placeholder}
						options={this.state.data}
						value={this.state.value}
						onInputChange={this.inputChangeWrapper}
						onChange={this.updateValue}
						onBlurResetsInput={false}
						onBlur={this.onBlurHandler} />
				</div>
			</div>
		)
	}
});

$( document ).ready(function() {
	ReactDOM.render(<SignUpSteps />, document.getElementById('content'));
});
