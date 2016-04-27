Parse.initialize("development", "Fomsummer2014", "Fomsummer2014");
Parse.serverURL = 'http://52.33.206.191:1337/parse/';
var Grid =  ReactBootstrap.Grid, Row =  ReactBootstrap.Row, Col =  ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput, Input = ReactBootstrap.Input;
var Panel =  ReactBootstrap.Panel, ListGroup = ReactBootstrap.ListGroup, ListGroupItem = ReactBootstrap.ListGroupItem;

var CreateOrganization = React.createClass({
    getInitialState: function() {
     return {
     	createStatus:'',
        // form
        picture: null, pictureType: '', name: '', description: '', location: '', prov: '', country: '', city: '', street: '', postalcode: '', website: ''
        };
    },
	render: function() {
		return (
			<div id="createOrganization"><Grid>
				<Row className="show-grid"><Col xs={12}> &nbsp; </Col></Row>
				<Row className="show-grid">
					<Col xs={9} xsOffset={2} md={6} mdOffset={3}>
						<Panel header="Create homepage for your research lab or network" >
							<p>Once you have created the home page, remember to connect to your home department, instituation, sponsors, etc. and more importantly invite your members to connect.  <br/> 	 <br/><br/> *If you are creating a homepage for your faculty, department, or an institution, we may already have a placeholder for you! use the autocomplete feature and </p>
							<ListGroup id="orgForm" fill>
								<ListGroupItem>
									<form onSubmit={this.handleSubmitData}>
										<label htmlFor="name">Name <Required content="*"/></label>
										<Input type="text" id="name" name="name"  placeholder="Name" onChange={this.handleChange} value={this.state.name} />
										<Input type="file" name="picture" label="Profile Image" help="Please upload the organization's logo."
											accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
										<Input type="textarea" name="description" label="About" placeholder="Description of organization" onChange={this.handleChange} value={this.state.description} />
										<Input type="text" name="location" label="Address" placeholder="Country,State/province, City" onChange={this.handleChange} value={this.state.location} />
										<Input type="text" name="country" placeholder="Country" onChange={this.handleChange} value={this.state.country} />
										<Input type="text" name="prov" placeholder="State/province" onChange={this.handleChange} value={this.state.prov} />
										<Input type="text" name="city" placeholder="City" onChange={this.handleChange} value={this.state.city} />
										<Input type="text" name="street" placeholder="Street # and name, Unit #" onChange={this.handleChange} value={this.state.street} />
										<Input type="text" name="postalcode" placeholder="Zip/postal code" onChange={this.handleChange} value={this.state.postalcode} />
										<Input type="text" name="website" label="Website" placeholder="Website url" onChange={this.handleChange} value={this.state.website} />
										<ButtonInput className="center-block" type="submit" value="Create New Organization" />
									</form>
								</ListGroupItem>
								<ListGroupItem style={{textAlign:'center'}}>{this.state.createStatus}</ListGroupItem>
							</ListGroup>

						</Panel>
                  </Col>
				</Row>
			</Grid></div>
		);
	},
	handleChange: function(e) {
		var changedState = {};
		changedState[e.target.name] = e.target.value;
		this.setState( changedState );
	},
	// handlePicture: function(e) {
	// 	var self = this;
	// 	var reader = new FileReader();
	// 	var file = e.target.files[0];
	// 	var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

	// 	reader.onload = function(upload) {
	// 		self.setState({
	// 			picture: upload.target.result,
	// 			pictureType: extension,
	// 		});
	// 	}
	// 	reader.readAsDataURL(file);
	// },
	handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
         console.log("FILE UPLOAD: ");
         console.log(upload);
         self.setState({
           picture: upload.target.result,
           pictureType: extension,
           pictureFeedback: '#dff0d8'
         });
        }
        reader.readAsDataURL(file);
    },
	handleSubmitData: function(e) {
		e.preventDefault();
		var isValidForm = this.validateForm();
		if (isValidForm.length === 0) {
			var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType,
				description: this.state.description, name: this.state.name, location: this.state.location, country: this.state.country,
				prov: this.state.prov, city: this.state.city, street: this.state.street, postalcode: this.state.postalcode, website: this.state.website};
			this.setState({createStatus: 'In progress...'});

			$.ajax({
				url: '/create/organization',
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
				type: 'POST',
				data: JSON.stringify(dataForm),
				processData: false,
				success: function(data) {
					this.setState({createStatus: 'Organization created! Redirecting...'});
					window.location = '../organization/' + data.location;
				}.bind(this),
				error: function(xhr, status, err) {
					console.error('/create/organization', status, err.toString());
					this.setState({createStatus: 'Error creating organization: ' + err.toString()});
				}.bind(this)
			});
		}
		else {
			var message = '';
			if (isValidForm.indexOf('TITLE') > -1) {
				message += 'Organization title is required.';
			}
			if (isValidForm.indexOf('PICTURE') > -1) {
				message += ' Please upload an image file ending in png, gif, or jpg.';
			}
			this.setState({createStatus: message});
		}
		return;
	},
	validateForm: function() {
		var issues = []
		if (!this.state.name.trim()) {
			issues.push("TITLE");
		}
		if (this.state.picture && ['png','gif','jpg','jpeg'].indexOf(this.state.pictureType) < 0) {
			issues.push("PICTURE");
		}
		return issues;
	},
});

var Required = React.createClass({
	render: function() {
		var requiredField = {color: 'red', fontWeight: '800'}
		return (
			<span style={requiredField}>{this.props.content}</span>
		);
	},
});

ReactDOM.render(<CreateOrganization />, document.getElementById('content'));