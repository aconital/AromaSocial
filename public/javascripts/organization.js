Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
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
            console.log(status);
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
            this.setState({status: "join"});
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
        else { console.log("Nothing"); }
        if(this.state.isAdmin)
            return (
                <div>
                    <div className="item-top item-top-container">
                    </div>
                    <div className="content-wrap">
                        <div>
                            <div className="item-top-1 col">
                                <img src={organization_imgURL} className="contain-image" />
                            </div>
                        </div>
                        <div className="item-bottom">
                            <div className="item-bottom-1">
                                <div className="side-panel" id="item-name"><h4>{name}</h4></div>
                                <div className="side-panel" id="item-location"><h4>{orgLocation}</h4></div>
                            </div>
                            <div id="item-bottom-2-organization" className="item-bottom-organization">
                                <OrganizationMenu tabs={['About', 'Connections', 'People', 'Equipments', 'Publications', 'Data', 'Models', 'Manage']} />
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
                    <div>
                        <div className="item-top-1 col">
                            <img src={organization_imgURL} className="contain-image" />
                        </div>
                    </div>
                    <div className="item-bottom">
                        <div className="item-bottom-1">
                            <div className="side-panel" id="item-name"><h4>{name}</h4></div>
                            <div className="item-panel-empty contain-panel-empty">
                                {joinButton}
                                <input className="btn btn-panel" value="Follow" />
                                {/*<input className="btn btn-panel" value="Message" />
                                 <input className="btn btn-panel" value="Ask" />*/}
                            </div>
                            <div className="side-panel" id="item-location"><h4>{orgLocation}</h4></div>
                        </div>
                        <div id="item-bottom-2-organization" className="item-bottom-2">
                            <OrganizationMenu tabs={['About', 'Connections', 'People', 'Equipments', 'Publications', 'Data', 'Models']} />
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
                // 4: <Knowledge/>,
                4: <Publications objectId={objectId}/>,
                5: <Data objectId={objectId}/>,
                6: <Models objectId={objectId}/>,
                7: <Manage objectId={objectId}/>
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
        return {data: []};
    },
    componentDidMount : function(){
        var connectionUrl= "/organization/"+objectId+"/connections";

        $.ajax({
            url: connectionUrl,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve orgs");
            }.bind(this)
        });
    },
    render: function() {
        var orgList = $.map(this.state.data,function(org) {
            return (
                <div className="item-box">
                <div key={org.orgId} id="item-list" className="row">
                        <a href={'/organization/'+org.orgId}><img src={org.orgImgUrl} className="contain-icons" /></a>
                        <a href={'/organization/'+org.orgId} className="body-link"><h3 className="margin-top-bottom-5">{org.name}</h3></a>
                        <span className="font-15">{org.location}</span>
                </div>
                </div>
            );
        });
        return (
            <div>
                {orgList}
            </div>
        )
    }
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
                        <div className="item-box">
                        <div key={person.username} id="item-list" className="row">
                            <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="contain-icons" /></a>
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
             cover_imgURL: cover_imgURL
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
                this.setState({data: data});
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
            url: "/organization/"+objectId+"/pending",
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    pending_action:function(person,action)
    {
            $.ajax({
                url:"/organization/"+objectId+"/pending/" ,
                method: "POST",
                data:{mode:action,person:person},
                success: function(data) {

                   console.log(data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("couldnt retrieve people");
                }.bind(this)
            });

    },
    render: function() {

        return (
            <div>
                <div className="organization-table-div">
                    <div>
                        <h3 className="summary-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-info-sign"></span> Information</h3>
                    </div>
                    <table className="organization-table-info">
                        <tr>
                            <td><b>Name: </b></td>
                            <td><input type="text" className="p-editable" name="name" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.name} /></td>
                        </tr>
                        <tr>
                            <td><b>About: </b></td>
                            <td><textarea rows="5" type="text" className="r-editable r-editable-full" id="about" name="about" contentEditable="true" onChange={this.handleChange} onBlur={this.submitChange}>{about}</textarea></td>
                        </tr>
                        <tr>
                            <td><b>Location: </b></td>
                            <td><input type="text" className="p-editable" name="location" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgLocation} /></td>
                        </tr>
                    </table>
                </div><hr/>
                {/*}
                <div><span className="people-title">Pending Approval</span></div>
                {this.state.data.map(person =>

                        <div key={person.username} className="row" id="people-row">
                            <div className="col-lg-2">
                                <a href={'/profile/'+person.username}> <img  src={person.userImgUrl} className="img-circle newsfeed-profile-pic" /></a>
                            </div>
                            <div className="col-lg-10">
                                <div>{person.fullname}</div>
                                <div>{person.workTitle}</div>
                                <div>{person.company}</div>
                                <div><a onClick={this.pending_action.bind(this,person,"approve")} id="pending-action"><span id="pending-accept" className="glyphicon glyphicon-ok" aria-hidden="true"></span></a> <a onClick={this.pending_action.bind(this,person,"deny")}  id="pending-action"><span id="pending-deny" className="glyphicon glyphicon-remove" aria-hidden="true"></span></a></div>
                            </div>
                        </div>
                )}
                {*/}
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
                            <a href={'/equipment/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                        </div>
                        <div className="item-box-right">
                            <a href={'/equipment/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">{item.description}</span>
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
                    <Modal.Body>
                        <Modal.Title>To Be Determined!</Modal.Title>
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
            console.log(this.state.data);
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't Retrieve Publications!");
        }.bind(this)
    });
  },
  render: function() {
    return (
      <div>
        <table id="upload-field" width="100%">
            <tbody>
            <tr>
                <td className="padding-right">
                <input type="text" id="search" placeholder="Search..." className="form-control"/>
                </td>
            </tr>
            </tbody>
        </table>
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
                <div className="publication-box">
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
            console.log(this.state.data);
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
          <table id="upload-field" width="100%">
            <tbody>
              <tr>
                  <td className="padding-right">
                  <input type="text" id="search" placeholder="Search..." className="form-control"/>
                  </td>
              </tr>
            </tbody>
          </table>
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
                <div className="model-box">
                <div className="model-box-image">
                    <a href={"/data/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="contain-image-preview" /></a>
                </div>
                <div className="model-box-left model-box-left-full">
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
            console.log(this.state.data);
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
          <table id="upload-field" width="100%">
            <tbody>
              <tr>
                  <td className="padding-right">
                  <input type="text" id="search" placeholder="Search..." className="form-control"/>
                  </td>
              </tr>
            </tbody>
          </table>
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
                <div className="model-box">
                <div className="model-box-image">
                    <a href={"/model/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="contain-image-preview" /></a>
                </div>
                <div className="model-box-left model-box-left-full">
                    <a href={"/model/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                    <b>Authors: </b>
                        {this.props.collaborators.map(function(item, i){
                            if (i == 0) {return <a href="#" className="body-link">{item}</a>;}
                            else {return <span>, <a href="#" className="body-link">{item}</a></span>;}
                        })}
                    <br/>
                    <b>Abstract:</b> {this.props.abstract.substr(0,170)}... <a href={"/model/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                </div>
                {/*}
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


React.render(<Organization />, document.getElementById('content'));

function pending_action(action,orgId,userId)
{

}
