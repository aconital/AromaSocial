Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Grid =  ReactBootstrap.Grid, Row =  ReactBootstrap.Row, Col =  ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput, Input = ReactBootstrap.Input;
var Panel =  ReactBootstrap.Panel, ListGroup = ReactBootstrap.ListGroup, ListGroupItem = ReactBootstrap.ListGroupItem;

var CreateOrganization = React.createClass({
    getInitialState: function() {
     return {
     	createStatus:'',
        // form
        picture: null, pictureType: '', name: '', description: '', location: ''
        };
    },
	render: function() {
		return (
			<div id="createOrganization"><Grid>
				<Row className="show-grid"><Col xs={12}> &nbsp; </Col></Row>
				<Row className="show-grid">
					<Col xs={9} xsOffset={2} md={6} mdOffset={3}>
						<Panel header="Create New Organization">
							<p>Description and instructions go here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
							<ListGroup id="orgForm" fill>
								<ListGroupItem>
									<form onSubmit={this.handleSubmitData}>
										<Input type="text" name="name" label="Name" placeholder="Name" onChange={this.handleChange} value={this.state.name} />
										<Input type="file" name="picture" label="Profile Image" help="Please upload the organization's logo."
											accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
										<Input type="text" name="location" label="Location" placeholder="Location" onChange={this.handleChange} value={this.state.location} />
										<Input type="textarea" name="description" label="About" placeholder="Description of organization" onChange={this.handleChange} value={this.state.description} />
										<ButtonInput type="submit" value="Submit Button" />
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
	handlePicture: function(e) {
		var self = this;
		var reader = new FileReader();
		var file = e.target.files[0];
		var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

		reader.onload = function(upload) {
			self.setState({
				picture: upload.target.result,
				pictureType: extension,
			});
		}
		reader.readAsDataURL(file);
	},
	handleSubmitData: function(e) {
		e.preventDefault();

		var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType,
			description: this.state.description, name: this.state.name, location: this.state.location};
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
		return;
	},
});

ReactDOM.render(<CreateOrganization />, document.getElementById('content'));