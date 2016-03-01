Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Grid =  ReactBootstrap.Grid, Row =  ReactBootstrap.Row, Col =  ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput, Input = ReactBootstrap.Input;
var Panel =  ReactBootstrap.Panel, ListGroup = ReactBootstrap.ListGroup, ListGroupItem = ReactBootstrap.ListGroupItem;

var CreateReport = React.createClass({
    getInitialState: function() {
        return {
            createStatus:'',
            // form
            location: '', assignTo: '', description: ''
        };
    },
    render: function() {
        return (
            <div id="createReport"><Grid>
                <Row className="show-grid"><Col xs={12}> &nbsp; </Col></Row>
                <Row className="show-grid">
                    <Col xs={9} xsOffset={2} md={6} mdOffset={3}>
                        <Panel header="Report a Problem">
                            <p>Description and instructions go here. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            <ListGroup id="reportForm" fill>
                                <ListGroupItem>
                                    <form onSubmit={this.handleSubmitData}>
                                        <Input type="select" name="location" label="Location" onChange={this.handleChange} value={this.state.location}>
                                            <option value="General">General</option>
                                            <option value="Navigation bar">Navigation bar</option>
                                            <option value="Create Organization">Create Organization</option>
                                            <option value="Search">Search</option>
                                            <option value="Newsfeed">Newsfeed</option>
                                            <option value="Sign-in">Sign-in</option>
                                            <option value="Sign-up">Sign-up</option>
                                            <option value="Personal Profile - sidebar">Personal Profile - sidebar</option>
                                            <option value="Personal Profile - about">Personal Profile - about</option>
                                            <option value="Personal Profile - connections">Personal Profile - connections</option>
                                            <option value="Personal Profile - organizations">Personal Profile - organizations</option>
                                            <option value="Personal Profile - equipments">Personal Profile - equipments</option>
                                            <option value="Personal Profile - projects">Personal Profile - projects</option>
                                            <option value="Personal Profile - publications">Personal Profile - publications</option>
                                            <option value="Personal Profile - data">Personal Profile - data</option>
                                            <option value="Personal Profile - models">Personal Profile - models</option>
                                            <option value="Organization Profile - sidebar">Organization Profile - sidebar</option>
                                            <option value="Organization Profile - about">Organization Profile - about</option>
                                            <option value="Organization Profile - connections">Organization Profile - connections</option>
                                            <option value="Organization Profile - people">Organization Profile - people</option>
                                            <option value="Organization Profile - equipments">Organization Profile - equipments</option>
                                            <option value="Organization Profile - publications">Organization Profile - publications</option>
                                            <option value="Organization Profile - data">Organization Profile - data</option>
                                            <option value="Organization Profile - model">Organization Profile - model</option>
                                            <option value="Organization Profile - manage">Organization Profile - manage</option>
                                            <option value="Publication Profile">Publication Profile</option>
                                            <option value="Model Profile">Model Profile</option>
                                            <option value="Data Profile">Data Profile</option>
                                            <option value="Equipment Profile">Equipment Profile</option>
                                            <option value="Project Profile">Project Profile</option>
                                        </Input>
                                        <Input type="select" name="assignTo" label="Assign to" onChange={this.handleChange} value={this.state.assignTo}>
                                            <option value="Anyone">Anyone</option>
                                            <option value="Saeed">Saeed</option>
                                            <option value="Newton">Newton</option>
                                            <option value="Lisa">Lisa</option>
                                            <option value="Shariq">Shariq</option>
                                            <option value="Hirad">Hirad</option>
                                        </Input>
                                        <label htmlFor="Describe">Description <Required content="*"/></label>
                                        <Input type="textarea" name="description" placeholder="Description of the problem" onChange={this.handleChange} value={this.state.description} />
                                        <ButtonInput className="center-block" type="submit" value="Submit Report" />
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

    handleSubmitData: function(e) {
        e.preventDefault();

        var isValidForm = this.validateForm();
        if (isValidForm.length === 0) {
            var dataForm = {assignTo: this.state.assignTo, location: this.state.location, description: this.state.description};
            this.setState({createStatus: 'In progress...'});

            $.ajax({
                url: '/report',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify(dataForm),
                processData: false,
                success: function(data) {
                    this.setState({createStatus: 'Report submited! Redirecting...'});
                    window.location = '../newsfeed/';
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error('/report', status, err.toString());
                    this.setState({createStatus: 'Error submitting report: ' + err.toString()});
                }.bind(this)
            });
        }
        else {
            var message = '';

            if (isValidForm.indexOf('DESCRIPTION') > -1) {
                message += ' Please describe the problem in descriptions.';
            }
            this.setState({createStatus: message});
        }
        return;
    },
    validateForm: function() {
        var issues = []
        if (!this.state.description.trim()) {
            issues.push("DESCRIPTION");
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

ReactDOM.render(<CreateReport />, document.getElementById('content'));