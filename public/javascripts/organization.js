Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Organization = React.createClass ({
    getInitialState: function() {
        return {isAdmin: [], status: ''};
    },
    componentWillMount: function() {
      var connectURL= "/organization/"+objectId+"/join-status";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: status})
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    componentDidMount : function() {
        var peopleUrl = "/organization/" + objectId + "/admins";

        $.ajax({
            url: peopleUrl,
            success: function (data) {
                var isAdmin = false;
                for (var p in data) {
                    if (data[p].username == currentUsername)
                        isAdmin = true;
                }
                this.setState({isAdmin: isAdmin});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        })
    },
    clickJoin: function() {
      var connectURL= "/organization/"+objectId+"/join";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: "pending"});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    clickLeave: function() {
      var connectURL= "/organization/"+objectId+"/leave";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: "not-joined"});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    render: function() {
        var joinButton = <input className="btn btn-panel btn-right-side" value="" />;
        if (this.state.status == "joined") {
             joinButton = <input onClick={this.clickLeave} className="btn btn-panel btn-right-side" value="Leave" />;
        }
        else if (this.state.status == "pending") {
             joinButton = <input className="btn btn-panel btn-right-side" value="Pending" />;
        }
        else if (this.state.status == "not-joined") {
             joinButton = <input onClick={this.clickJoin} className="btn btn-panel btn-right-side" value="Join" />;
        }
        if(this.state.isAdmin)
            return (
                <div>
                    <div className="item-top item-top-container">
                    </div>
                    <div className="content-wrap">
                        <div className="item-bottom">
                            <div className="item-bottom-1">
                                <img src={organization_imgURL} className="contain-image" />
                                <div className="side-panel"><h5>NEWS AND EVENTS</h5></div>
                                <div className="side-panel"><h5>RATINGS</h5></div>
                                <div className="side-panel"><h5>OTHERS</h5></div>
                            </div>
                            <div id="item-bottom-2-organization" className="item-bottom-2-organization">
                                <h1 className="no-margin-padding align-left h1-title">{name}</h1>
                                <h3 className="no-margin-padding align-left h3-title">{orgLocation}</h3>
                                <OrganizationMenu tabs={['About', 'Connections', 'People', 'Equipments', 'Projects', 'Publications', 'Data', 'Models', 'Manage']} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        //not admin
        else
        return (
            <div>
                <div className="item-top item-top-container">
                </div>
                <div className="content-wrap">
                    <div className="item-bottom">
                        <div className="item-bottom-1">
                            <img src={organization_imgURL} className="contain-image" />
                            {/*
                            <div className="side-panel"><h5>NEWS AND EVENTS</h5></div>
                            <div className="side-panel"><h5>RATINGS</h5></div>
                            <div className="side-panel"><h5>OTHERS</h5></div>
                            */}
                        </div>
                        <div id="item-bottom-2-organization" className="item-bottom-2">
                            <div className="interact-buttons-wrap">
                                {joinButton}
                                <input className="btn btn-panel" value="Follow" />
                            </div>
                            <h1 className="no-margin-padding align-left h1-title">{name}</h1>
                            <h3 className="no-margin-padding align-left h3-title">{orgLocation}</h3>
                            <OrganizationMenu tabs={['About', 'Connections', 'People', 'Equipments', 'Projects', 'Publications', 'Data', 'Models']} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var OrganizationMenu = React.createClass ({
    getInitialState: function() {
        return { focused: 0 };
    },
    clicked: function(index) {
        this.setState({ focused: index });
    },
    render: function() {
        var self = this;

        var tabMap = {0: <About />,
                1: <Connections  />,
                2: <People />,
                3: <Equipments objectId={objectId}/>,
                4: <Projects objectId={objectId}/>,
                // 4: <Knowledge/>,
                5: <Publications objectId={objectId}/>,
                6: <Data objectId={objectId}/>,
                7: <Models objectId={objectId}/>,
                8: <Manage objectId={objectId}/>
                };
        return (
            <div>
                <div id="tabs">
                    <ul id="content-nav">
                        {this.props.tabs.map(function(tab,index){
                            var style = "";
                            if (self.state.focused == index) {
                                style = "selected-tab";
                            }
                        return <li id={style}>
                                <a href="#" onClick={self.clicked.bind(self, index)} id={style}>{tab}</a>
                               </li>;
                        })}
                    </ul>
                </div>
                <div id="content" className="content">
                    {tabMap.hasOwnProperty(self.state.focused) ? tabMap[self.state.focused] : ""}
                </div>
            </div>
        );
    }
});

var Connections = React.createClass({
    getInitialState: function() {
        return {data: [], showModal: false };
    },
    componentDidMount : function(){
        var connectionUrl= "/organization/"+objectId+"/connections";
        $.ajax({
            url: connectionUrl,
            success: function(data) {
                this.setState({data:data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve orgs");
            }.bind(this)
        });

        var isAdminURL= "/organization/"+objectId+"/isAdmin";
        $.ajax({
            type: 'GET',
            url: isAdminURL,
            success: function(isAdminData) {
                this.setState({ isAdmin: isAdminData.isAdmin });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
            }.bind(this)
        });
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    render: function() {
        var orgList = $.map(this.state.data,function(org) {
            return (
                <div className="item-box">
                    <div className="item-box-left">
                        <div className="item-box-image-outside">
                            <a href={'/organization/'+org.orgId}><img src={org.orgImgUrl} className="item-box-image" /></a>
                        </div>
                    </div>
                    <div className="item-box-right">
                        <a href={'/organization/'+org.orgId} className="body-link"><h3 className="margin-top-bottom-5">{org.name}</h3></a>
                        <span className="font-15">{org.location}</span>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Connection</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddConnection fromModelTab={this.props.fromModelTab} submitSuccess={this.close} list={this.list} />
                    </Modal.Body>
                </Modal>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tbody>
                        <tr>
                            <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                            {(this.state.isAdmin) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></td> : <td></td>}
                        </tr>
                        </tbody>
                    </table>
                </div>
                {orgList}
            </div>
        )
    }
});

var AddConnection = React.createClass({
    close: function(e) {
        if (typeof this.props.submitSuccess === 'function') {
            this.props.submitSuccess();
        }
    },
    getInitialState: function() {
        return {
           joinOrganization: '',
           joinType: ''
        };
    },
    componentDidMount : function(){
        var autocomplete=<script>
        $(function() {
            $('.auto2').autocomplete({
                source: function(req, res) {
                    $.ajax({
                        url: '/allorganizations',
                        dataType: 'json',
                        cache: false,
                        success: function(data) {
                            console.log("SUCCESS!!!!!!!");
                            console.log(data);
                            var arr = $.grep(data, function(item){
                                return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                            });
                            res($.map(arr, function(item){
                                return {
                                    label: item.name,
                                    value: item.objectId
                                };
                            }));
                        },
                        error: function(xhr) {
                            console.log("ERROR WTF!!!");
                            console.log(xhr.status);
                        }
                    });
                },
                messages: {
                    noResults: '',
                    results: function() {}
                }
            })
        });
        </script>
        $("#scriptContainer").append(autocomplete);
    },

    render: function() {
        return (
            <div>
                <div id="scriptContainer"></div>
                <form className="form" onSubmit={this.handleSubmitData}>
                    <Input className="auto2" type="text" placeholder="Organization:" name="joinOrganization" label="Organization" onChange={this.handleChange} value={this.state.organization}/>
                    <Input type="select" name="joinType" label="Connection type" onChange={this.handleChange} value={this.state.organizationtype}>
                        <option value=""></option>
                        <option value="contains">We are part of this organization</option>
                        <option value="sponsors">This organization sponsors us</option>
                        <option value="collaberates">We collaborate with this organization</option>
                    </Input>
                    <Modal.Footer>
                        <Input className="btn btn-default pull-right" type="submit" value="Continue" />
                        <div style={{textAlign:'center'}}>{this.state.formFeedback}</div>
                    </Modal.Footer>
                </form>
            </div>
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
        var connectionURL = "/organization/"+objectId+"/connect";
        if (isValidForm.length === 0) {
            var dataForm = {orgId: this.state.joinOrganization, type: this.state.joinType};
            this.setState({createStatus: 'In progress...'});
            $.ajax({
                url: connectionURL,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify(dataForm),
                processData: false,
                success: function(data) {
                    this.setState({createStatus: 'Connection request sent.'});
                    this.close();
                }.bind(this),
                error: function(xhr, status, err) {
                    this.setState({createStatus: 'Error creating connection: ' + err.toString()});
                    this.close();
                }.bind(this)
            });
        }
        else {
            var message = '';
            if (isValidForm.indexOf('TYPE') > -1) {
                message += ' Please describe this connection    .';
            }
            this.setState({createStatus: message});
        }
        return;
    },

    validateForm: function() {
        var issues = []
        if (!this.state.joinType.trim()) {
            issues.push("TYPE");
        }
        return issues;
    },
});

var People = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        var peopleUrl= "/organization/"+objectId+"/people";

      $.ajax({
          url: peopleUrl,
          success: function(data) {
              this.setState({data: data});
          }.bind(this),
          error: function(xhr, status, err) {
              console.error("Couldn't Retrieve People");
          }.bind(this)
      });
  },
  render: function() {

      var peopleList = $.map(this.state.data,function(objects) {
          var role= objects[0].title;
          var plist=[];
          for(var i in objects) {
              var person = objects[i];
              plist.push(person);
          }

          return (
                <div id="items-list">
                    <div className="clear"></div>
                    <div><h2 className="margin-top-bottom-5">{role}</h2></div>
                    <div className="clear"></div>
                    {plist.map(person =>
                        <div className="item-box" key={person.username} id="item-list">
                            <div className="item-box-left">
                                <div className="item-box-image-outside">
                                    <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="item-box-image" /></a>
                                </div>
                            </div>
                            <div className="item-box-right">
                                <a href={'/profile/'+person.username} className="body-link"><h3 className="margin-top-bottom-5">{person.fullname}</h3></a>
                                <span className="font-15">{person.workTitle} @ {person.company}</span>
                            </div>
                        </div>
                    )}
                </div>
          );
      });
    return (
      <div>
          {peopleList}
      </div>
    )
  }
});

var Manage = React.createClass({
    getInitialState: function() {
        return {
             name: name,
             about: about,
             orgLocation: orgLocation,
             organization_imgURL: organization_imgURL,
             cover_imgURL: cover_imgURL,
             pendingPeople: [],
             pendingOrganizations: [],
             admins: []
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {name: this.state.name, about: this.state.about, location: this.state.orgLocation};

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    componentDidMount : function(){
        $.ajax({
            type: 'GET',
            url: "/organization/"+objectId+"/pending_people",
            success: function(pendingPeopleData) {
                this.setState({pendingPeople: pendingPeopleData});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve People!");
            }.bind(this)
        }).then(this.admins);
        $.ajax({
            type: 'GET',
            url: "/organization/"+objectId+"/pending_organizations",
            success: function(pendingOrganizationsData) {
                this.setState({pendingOrganizations: pendingOrganizationsData});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Organizations!");
            }.bind(this)
        });
    },
    admins : function(){
        $.ajax({
            type: 'GET',
            url: "/organization/"+objectId+"/admins",
            success: function(adminsData) {
                this.setState({ admins: adminsData });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
            }.bind(this)
        });
    },
    pendingPersonAction: function(personId,action) {
        var dataForm = {personId: personId, mode: action};
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataForm),
            processData: false,
            url: "/organization/"+objectId+"/pending_person_action",
            success: function(data) {
                var displayPerson = document.getElementById("pending_person_" + personId);
                displayPerson.className += " hide";
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Do Action!");
            }.bind(this)
        }).then(this.admins);
    },
    pendingOrganizationAction: function(organizationId,action) {
        var dataForm = {organizationId: organizationId, mode: action};
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(dataForm),
            processData: false,
            url: "/organization/"+objectId+"/pending_organization_action",
            success: function(data) {
                var displayOrganization = document.getElementById("pending_organization_" + organizationId);
                displayOrganization.className += " hide";
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Do Action!");
            }.bind(this)
        });
    },
    deleteOrganization: function() {
        $.ajax({
            type: 'GET',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            processData: false,
            url: "/organization/"+objectId+"/delete",
            success: function(data) {
                window.location = '../';
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't delete organization.  " + err);
            }.bind(this)
        });
    },
    render: function() {
        var adminsList = $.map(this.state.admins,function(admin) {
            return (
                <a href={"/profile/" + admin.username} className="nostyle"><img src={admin.imgUrl} className="contain-panel-small-image"/></a>
            );
        });
        var peopleList = $.map(this.state.pendingPeople,function(person) {
            return (
                <div className="item-box" id={"pending_person_" + person.id}>
                    <div className="accept-reject-buttons">
                        <Button className="btn-primary btn-accept-reject" onClick={this.pendingPersonAction.bind(this,person.id,"admin")}>Admin</Button>
                        <Button className="btn-primary btn-accept-reject" onClick={this.pendingPersonAction.bind(this,person.id,"accept")}>Accept</Button>
                        <Button className="btn-primary btn-accept-reject" onClick={this.pendingPersonAction.bind(this,person.id,"reject")}>Reject</Button>
                    </div>
                    <div>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/profile/'+person.username} className="body-link"><h3 className="margin-top-bottom-5">{person.fullname} - {person.username}</h3></a>
                            <span className="font-15">{person.title}</span><br/>
                            <span className="font-15">{person.workTitle} @ {person.company}</span>
                        </div>
                    </div>
                </div>
            )
        }.bind(this));
        var organizationsList = $.map(this.state.pendingOrganizations,function(organization) {
            return (
                <div className="item-box" id={"pending_organization_" + organization.id}>
                    <div className="accept-reject-buttons">
                        <Button className="btn-primary btn-accept-reject" onClick={this.pendingOrganizationAction.bind(this,organization.id,"accept")}>Accept</Button>
                        <Button className="btn-primary btn-accept-reject" onClick={this.pendingOrganizationAction.bind(this,organization.id,"reject")}>Reject</Button>
                    </div>
                    <div>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/organization/'+organization.id}><img src={organization.profile_imgURL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/organization/'+organization.id} className="body-link"><h3 className="margin-top-bottom-5">{organization.name}</h3></a>
                            <span className="font-15">{organization.location}</span>
                        </div>
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div>
                <div className="organization-table-div">
                    <div>
                        <h3 className="summary-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-info-sign"></span> Information</h3>
                    </div>
                    <table className="organization-table-info">
                        <tbody>
                        <tr>
                            <td><b>Name: </b></td>
                            <td><input type="text" className="p-editable" name="name" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.name} /></td>
                        </tr>
                        <tr>
                            <td><b>About: </b></td>
                            <td><textarea rows="5" type="text" className="r-editable r-editable-full" id="about" name="about" onChange={this.handleChange} onBlur={this.submitChange}>{about}</textarea></td>
                        </tr>
                        <tr>
                            <td><b>Location: </b></td>
                            <td><input type="text" className="p-editable" name="orgLocation" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgLocation} /></td>
                        </tr>
                        <tr>
                            <td><b>Admins: </b></td>
                            <td><div>{adminsList}</div></td>
                        </tr>
                        <tr>
                            <td><Button onClick={this.deleteOrganization}bsStyle="primary">Delete Organization</Button></td>
                        </tr>
                        </tbody>
                    </table>
                </div><hr/>
                <div>
                    <h3 className="summary-margin-top"><span aria-hidden="true" className="fa fa-user-plus"></span> People - Pending Approval</h3>
                </div>
                <div>
                    {peopleList}
                </div>
                <div className="clear"></div>
                <hr/>
                <div>
                    <h3 className="summary-margin-top"><span aria-hidden="true" className="fa fa-building-o"></span> Connections - Pending Approval</h3>
                </div>
                <div>
                    {organizationsList}
                </div>
            </div>

        )
    }
});

var About = React.createClass({
  render: function() {
    return (
      <div>
        {about}
      </div>
    )
  }
});

var NewsAndEvents = React.createClass({
  render: function() {
    return (
      <div>
        News And Events
      </div>
    )
  }
});

var Knowledge = React.createClass({
  render: function() {
    return (
      <div>
        Knowledge
      </div>
    )
  }
});

var Equipments = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false, isAdmin: false };
    },
    componentWillMount : function() {
        var equipmentsURL= "/organization/"+objectId+"/equipments_list";

        $.ajax({
            type: 'GET',
            url: equipmentsURL,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Equipments!");
            }.bind(this)
        });
    },
    componentDidMount : function() {
        var isAdminURL= "/organization/"+objectId+"/isAdmin";

        $.ajax({
            type: 'GET',
            url: isAdminURL,
            success: function(isAdminData) {
                this.setState({ isAdmin: isAdminData.isAdmin });
                console.log(isAdminData.isAdmin);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
            }.bind(this)
        });
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(item) {
            return (
                <div className="item-box" key={item.objectId}>
                    <div>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/equipment/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/equipment/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">
                            <table className="item-box-right-tags">
                                <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>
                            </table>
                            </span>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>New Equipment</Modal.Title>
                    </Modal.Header>
                    <EquipmentAddForm submitSuccess={this.clickClose} />
                </Modal>
                <div className="item-search-div">
                <table className="item-search-field" width="100%">
                    <tr>
                        <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                        {(this.state.isAdmin) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></td> : <td></td>}
                    </tr>
                </table>
                </div>
                {itemsList}
            </div>
        )
    }
});

var EquipmentAddForm = React.createClass({
    close: function(e) {
        this.props.submitSuccess();
    },
    getInitialState: function() {
     return {
        alertVisible: false,
        buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
        formFeedback: '',
        fileFeedback: {},
        pictureFeedback: '',

        // form
        picture: null, file: null, pictureType: '', fileType: '', title: '', keywords: '',
        description: '', instructions: '', model: '', model_year: '', organizationId: objectId
        };
    },
    componentDidMount: function() {
        var eCode = <script>
                        $(function() {
                            $('.auto').autocomplete({
                                    source: function(req, res) {
                                        $.ajax({
                                          url: '/allusers',
                                          dataType: 'JSON',
                                          cache: false,
                                          success: function(data) {
                                            console.log("SUCCESS!!!!!!!");
                                            console.log(data);
                                            var arr = $.grep(data, function(item){
                                              return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                                            });
                                            res($.map(arr, function(item){
                                              return {
                                                label: item.fullname,
                                                value: item.username
                                              };
                                            }));
                                          },
                                          error: function(xhr) {
                                            console.log("ERROR WTF!!!");
                                            console.log(xhr.status);
                                          }
                                        });
                                    },
                                    messages: {
                                      noResults: '',
                                      results: function() {}
                                    }
                            })
                        });
                    </script>
        //var eCode = <script src="/javascripts/autocomplete.js"></script>
        $("#scriptContainer").append(eCode);
    },
	render: function() {
	    if (this.state.alertVisible) {
	        var alert = <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}> {this.state.formFeedback} </Alert>;
	    } else {var alert = "";}
		return (
		<div>
            <div id="scriptContainer"></div>
			<form className="form" onSubmit={this.handleSubmitData}>
			    <Modal.Body>
			    {alert}
			    <div className="well" style={this.buttonStyles}>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                    	style={{background: this.state.pictureFeedback}}>
                        Add Picture <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                    </Button>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                        Select Files... <input type="file" onChange={this.handleFile} />
                    </Button>
                  </div>

                <Input type="text" placeholder="Title:" name="title" onChange={this.handleChange} value={this.state.title} />
                <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
                <Input type="textarea" placeholder="Instructions:" name="instructions" onChange={this.handleChange} value={this.state.instructions} />
                <Input type="text" placeholder="Model:" name="model" onChange={this.handleChange} value={this.state.model} />
                <Input type="text" placeholder="Model Year:" name="model_year" onChange={this.handleChange} value={this.state.model_year} />
                <Input type="text" placeholder="Keywords (Comma Separated Tags):" name="keywords" onChange={this.handleChange} value={this.state.keywords} />
                </Modal.Body>
                <Modal.Footer>
                    <input className="full-button" type="submit" value="Submit"/>
                </Modal.Footer>
            </form>
		</div>
		);
	},
    handleAlertDismiss() {
        this.setState({alertVisible: false});
    },
    handleAlertShow() {
        this.setState({alertVisible: true});
    },
	handleChange: function(e) {
	    var changedState = {};
	    changedState[e.target.name] = e.target.value;
	    this.setState( changedState );
	},
	handleSubmitData: function(e) {
        e.preventDefault();

        var dataForm = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
        				fileType: this.state.fileType, pictureType: this.state.pictureType,
        				description: this.state.description, instructions: this.state.instructions, model: this.state.model,
        				model_year: this.state.model_year, keywords: this.state.keywords, title: this.state.title};
		console.log(dataForm);

        var isValidForm = this.validateForm();
		if (isValidForm.length === 0) {
			var endpoint = "/equipment";
			var dataFormORIG = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
				fileType: this.state.fileType, pictureType: this.state.pictureType,
				description: this.state.description, instructions: this.state.instructions, model: this.state.model,
				model_year: this.state.model_year, keywords: this.state.keywords, title: this.state.title};

			$.ajax({
				url: path + endpoint,
				dataType: 'json',
				contentType: "application/json; charset=utf-8",
				type: 'POST',
				data: JSON.stringify(dataForm),
				processData: false,
				success: function(data) {
				    console.log(data);
				    this.close();
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(path + endpoint, status, err.toString());
				}.bind(this)
			});
		}
		else {
			var message = 'Project could not be added!';
			if (isValidForm.indexOf('TITLE') > -1) {
				message += ' Title is required.';
			}
			if (isValidForm.indexOf('FILE') > -1) {
				message += ' Please upload a file.';
			}
            if (isValidForm.indexOf('INSTRUCTIONS') > -1) {
				message += ' Please give usage instructions.';
			}
			if (isValidForm.indexOf('MODEL') > -1) {
				message += ' Please indicate the model and model year/version.';
			}
			if (isValidForm.indexOf('MODEL_YEAR') > -1) {
                message += ' Please indicate the model and model year/version.';
            }
			if (isValidForm.indexOf('KEYWORDS') > -1) {
				message += ' Please specify at least one keyword.';
			}
			this.setState({formFeedback: message, alertVisible: true});
		}
        return;
    },

	showPictureUpload(fromModel) {
	    if (fromModel) {
            return '';
	    }
	    return 'none';
	},

	openFileUpload() {
	    var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.file.on('fileselect', function(event, numFiles, label) {
            console.log(numFiles);
            console.log(label);
            return input;
        });
	},

	handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
          self.setState({
            file: upload.target.result,
            fileType: extension,
            fileFeedback: {background: '#dff0d8'}
          });
        }
        reader.readAsDataURL(file);
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
           pictureFeedback: '#dff0d8'
         });
        }
        reader.readAsDataURL(file);
    },

	validateForm: function() {
		var issues = []
		if (!this.state.title.trim()) {
			issues.push("TITLE");
		}
		if (!this.state.file) {
			issues.push("FILE");
		}
		if (!this.state.instructions) {
			issues.push("INSTRUCTIONS");
		}
		if (!this.state.model) {
            issues.push("MODEL");
        }
        if (!this.state.model_year) {
            issues.push("MODEL_YEAR");
        }
		if (!this.state.keywords.trim()) {
			issues.push("KEYWORDS");
		}
		return issues;
	},
});

var Projects = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var projectsURL= "/organization/"+objectId+"/projects_list";

        $.ajax({
            type: 'GET',
            url: projectsURL,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Projects!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(item) {
            console.log(item);
            return (
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/project/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <table className="item-box-right-tags">
                                <tr><td><b>Authors: </b></td><td>{item.authors.map(function(author) { return <span><a href="#" className="body-link">{author}</a> </span>;})}</td></tr>
                                <tr><td><b>Locations: </b></td><td>{item.locations.map(function(location) { return <span><a href="#" className="body-link">{location}</a> </span>;})}</td></tr>
                                <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>
                                <tr><td><b>Period: </b></td><td>{item.start_date} -  {item.end_date}</td></tr>
                            </table>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <div className="item-search-div">
                <table className="item-search-field" width="100%">
                    <tr><td><input type="text" id="search" placeholder="Search..." className="form-control"/></td></tr>
                </table>
                </div>
                {itemsList}
            </div>
        )
    }
});

var Publications = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount : function(){
    var peopleUrl= "/organization/"+objectId+"/publications";

    $.ajax({
        url: peopleUrl,
        success: function(publications) {
            this.setState({data: publications});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't Retrieve Publications!");
        }.bind(this)
    });
  },
  render: function() {
    return (
      <div>
        <div className="item-search-div">
        <table className="item-search-field" width="100%">
            <tbody>
            <tr>
                <td className="padding-right">
                <input type="text" id="search" placeholder="Search..." className="form-control"/>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
        {this.state.data.map(function(publication){
            return (<Publication objectId={publication.objectId}
                                 author={publication.author}
                                 description={publication.description}
                                 title={publication.title}
                                 publication_code={publication.publication_code} />);
        })}
      </div>
    );
  }
});

var Publication = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
                <div className="item-box">
                <div className="publication-box-left publication-box-left-full">
                    <a href={"/publication/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                    Authors: <a href="#" className="body-link">{this.props.author}</a><br/>
                    Abstract: {this.props.description.substr(0,120)}... <a href={"/publication/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                    {this.props.publication_code}
                </div>
                {/*
                <div className="publication-box-right">
                    <h5>Information</h5><br/>
                    ## Syncholar Factor<br/>
                    ## Times Cited<br/>
                    ## Views<br/>
                    ## Impact Factor
                </div>
                */}
                </div>
        )
    }
});



var Data = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount : function(){
    var peopleUrl= "/organization/"+objectId+"/datas";

    $.ajax({
        url: peopleUrl,
        success: function(datas) {
            this.setState({data: datas});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't Retrieve Data!");
        }.bind(this)
    });
  },
  render: function() {
    var rows = [];
    return (
      <div>
        <div className="item-search-div">
          <table className="item-search-field" width="100%">
            <tbody>
              <tr>
                  <td className="padding-right">
                  <input type="text" id="search" placeholder="Search..." className="form-control"/>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
        {this.state.data.map(function(item) {
            return (<Datum objectId={item.objectId}
                                    collaborators={item.collaborators}
                                    title={item.title}
                                    image_URL={item.image_URL}
                                    keywords={item.keywords}
                                    number_cited={item.number_cited}
                                    number_syncholar_factor={item.number_syncholar_factor}
                                    license={item.license}
                                    access={item.access}
                                    abstract={item.description} />);
        })}
      </div>
    );
  }
});

var Datum = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
                <div className="item-box">
                <div className="item-box-left">
                    <div className="item-box-image-outside">
                        <a href={"/data/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="item-box-image" /></a>
                    </div>
                </div>
                <div className="item-box-right">
                    <a href={"/data/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                    <b>Authors: </b>
                        {this.props.collaborators.map(function(item, i){
                            if (i == 0) {return <a href="#" className="body-link">{item}</a>;}
                            else {return <span>, <a href="#" className="body-link">{item}</a></span>;}
                        })}
                    <br/>
                    <b>Abstract:</b> {this.props.abstract.substr(0,170)}... <a href={"/data/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                </div>
                {/*
                <div className="model-box-right">
                    <h5>Information</h5><br/>
                    {this.props.number_syncholar_factor} Syncholar Factor<br/>
                    {this.props.number_cited} Times Cited<br/>
                    {this.props.license}<br/>
                    {this.props.access.map(function(item, i){
                        if (i == 0) {return item;}
                        else {return ", " + item;}
                    })} <br/> Uses This
                </div>
                */}
                </div>
        )
    }
});

var Models = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount : function(){
    var peopleUrl= "/organization/"+objectId+"/models";

    $.ajax({
        url: peopleUrl,
        success: function(models) {
            this.setState({data: models});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't Retrieve Publications!");
        }.bind(this)
    });
  },
  render: function() {
    var rows = [];
    return (
      <div>
        <div className="item-search-div">
          <table className="item-search-field" width="100%">
            <tbody>
              <tr>
                  <td className="padding-right">
                  <input type="text" id="search" placeholder="Search..." className="form-control"/>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
        {this.state.data.map(function(model) {
          return (<Model objectId={model.objectId}
                                   collaborators={model.collaborators}
                                   title={model.title}
                                   image_URL={model.image_URL}
                                   keywords={model.keywords}
                                   number_cited={model.number_cited}
                                   number_syncholar_factor={model.number_syncholar_factor}
                                   license={model.license}
                                   access={model.access}
                                   abstract={model.abstract} />);
        })}
        {rows}
      </div>
    );
  }
});

var Model = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
            <div className="item-box">
                <div className="item-box-left">
                    <div className="item-box-image-outside">
                        <a href={"/model/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="item-box-image" /></a>
                    </div>
                </div>
            <div className="item-box-right">
                <a href={"/model/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                <b>Authors: </b>
                    {
                        this.props.collaborators.map(function(item, i){
                            if (i == 0) {
                                return <a href="#" className="body-link">{item}</a>;
                            }
                            else {
                                return <span>, <a href="#" className="body-link">{item}</a></span>;
                            }
                        })
                    }
                <br/>
                    <b>Abstract:</b> {this.props.abstract.substr(0,170)}... <a href={"/model/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                </div>
            </div>
        )
    }
});



React.render(<Organization />, document.getElementById('content'));

