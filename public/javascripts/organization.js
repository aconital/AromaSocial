Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");

var Organization = React.createClass ({
    getInitialState: function() {
        return {isAdmin: []};
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
    render: function() {
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
                                <div className="item-panel contain-panel" id="item-name"><h4>{name}</h4></div>
                                <div className="item-panel contain-panel" id="item-location"><h4>{orgLocation}</h4></div>
                            </div>
                            <div id="item-bottom-2-organization" className="item-bottom-organization">
                                <OrganizationMenu tabs={['Connections', 'People', 'About', 'News And Events', 'Knowledge', 'Publications', 'Data', 'Models','Manage']} />
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
                        <div className="item-panel contain-panel" id="item-name"><h4>{name}</h4></div>
                        <div className="item-panel contain-panel" id="item-location"><h4>{orgLocation}</h4></div>
                    </div>
                    <div id="item-bottom-2-organization" className="item-bottom-organization">
                        <OrganizationMenu tabs={['Connections', 'People', 'About', 'Publications', 'Data', 'Models']} />
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

        var tabMap = {0: <Connections />,
                1: <People  />,
                2: <About />,
                // 3: <NewsAndEvents/>,
                // 4: <Knowledge/>,
                3: <Publications objectId={objectId}/>,
                4: <Data objectId={objectId}/>,
                5: <Models objectId={objectId}/>
                // 8: <Manage objectId={objectId}/>
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
                <div>

                            <div key={org.orgId} className="row" id="people-row">
                                <div className="col-lg-2">
                                <a href={'/organization/'+org.orgId}> <img  src={org.orgImgUrl} className="img-circle newsfeed-profile-pic" /></a>
                                </div>
                                <div className="col-lg-10">
                                    <div>{org.name}</div>
                                    <div>{org.location}</div>

                                </div>
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
              console.error("couldnt retrieve people");
          }.bind(this)
      });
  },
  render: function() {

      var peopleList = $.map(this.state.data,function(objects) {
          var role= objects[0].title;
          var plist=[];
          for(var i in objects)
          {
              var person = objects[i];

              plist.push(person);
          }

          return (
                <div>
                    <div><span className="people-title">{role}</span></div>
                    {plist.map(person =>

                    <div key={person.username} className="row" id="people-row">
                        <div className="col-lg-2">
                           <a href={'/profile/'+person.username}> <img  src={person.userImgUrl} className="img-circle newsfeed-profile-pic" /></a>
                        </div>
                        <div className="col-lg-10">
                            <div>{person.fullname}</div>
                            <div>{person.workTitle}</div>
                            <div>{person.company}</div>

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
        return {data: []};
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

var Publications = React.createClass({
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        users: (new Parse.Query('Relationship').equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: this.props.objectId}))
      };
    },
  render: function() {
    var rows = [];
    console.log(this.data.users);
    return (
      <div>

        {rows}
      </div>
    );
  }
});

var Publication = React.createClass({
    render: function() {
        return (
                <div className="publication-box">
                <div className="publication-box-left publication-box-left-full">
                    <h3 className="no-margin-top"><a href={"/publication/" + this.props.objectId} className="body-link"> {this.props.title}</a></h3>
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
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        items: (new Parse.Query('Data'))
      };
    },
  render: function() {
    var rows = [];
    return (
      <div>
        {this.data.items.map(function(item) {
            rows.push(<Datum objectId={item.objectId}
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
        {rows}
      </div>
    );
  }
});

var Datum = React.createClass({
    render: function() {
        return (
                <div className="model-box">
                <div className="model-box-image">
                    <img src={this.props.image_URL} className="contain-image-preview" />
                </div>
                <div className="model-box-left model-box-left-full">
                    <a href={"/data/" + this.props.objectId} className="body-link"><h3 className="no-margin-top">{this.props.title}</h3></a>
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
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        models: (new Parse.Query('Model'))
      };
    },
  render: function() {
    var rows = [];
    return (
      <div>
        {this.data.models.map(function(model) {
            rows.push(<Model objectId={model.objectId}
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
        return (
                <div className="model-box">
                <div className="model-box-image">
                    <img src={this.props.image_URL} className="contain-image-preview" />
                </div>
                <div className="model-box-left model-box-left-full">
                    <a href={"/model/" + this.props.objectId} className="body-link"><h3 className="no-margin-top">{this.props.title}</h3></a>
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
