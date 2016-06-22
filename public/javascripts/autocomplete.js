// For transforming publication type category
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var ConnectButton = React.createClass({
  getInitialState: function() {
    return {
      status: ''
    };
  },
  componentWillMount: function() {
    var connectURL= "/profile/"+this.props.username+"/connection-status";

      $.ajax({
          url: connectURL,
          type: 'POST',
          data: {userId: this.props.objectId},
          success: function(status) {
              this.setState({status: status})
          }.bind(this),
          error: function(xhr, status, err) {
              console.error("Couldn't retrieve people.");
          }.bind(this)
      });
  },
  clickConnect: function() {
      var connectURL= "/profile/"+this.props.objectId+"/connect";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: status});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    clickDisconnect: function() {
      var connectURL= "/profile/"+this.props.objectId+"/disconnect";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: "not-connected"});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    render: function() {
      var connectButton = <button className="btn btn-panel btn-right-side" value=""></button>;
      if (this.state.status == "connected") {
           connectButton = <button onClick={this.clickDisconnect} className="btn btn-panel btn-right-side" value="Disconnect">Disconnect</button>;
      }
      else if (this.state.status == "pending") {
           connectButton = <button className="btn btn-panel btn-right-side pending_btn" value="Pending">Pending</button>;
      }
      else if (this.state.status == "not-connected") {
            connectButton = <button onClick={this.clickConnect} className="btn btn-panel btn-right-side" value="Connect">Connect</button>;
      }
      else { console.log("Nothing"); }
      return(
        <div>{connectButton}</div>
      )
    }
});

var JoinButton = React.createClass({
  getInitialState: function() {
    return {
      status: '',
      isAdmin: false
    }
  },
  componentWillMount: function() {
    var connectURL= "/organization/"+this.props.objectId+"/join-status";
    var orgURL= "/organization/"+this.props.objectId;

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
  componentDidMount: function() {
    var peopleUrl = "/organization/" + this.props.objectId + "/admins";

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
        var connectURL= "/organization/"+this.props.objectId+"/join";

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
        var self = this;
        var connectURL= "/organization/"+this.props.objectId+"/leave";
        var adminURL = "/organization/"+this.props.objectId+"/admins";

        $.ajax({
            url: adminURL,
            data: {getCount: true}
        }).done(function(count) {
            if (self.state.isAdmin && count < 2) {
                self.setState({errorText: "Can't leave network with no admins! Either delete network or add an administrator."});
                $("#error-dialog").show();
                setTimeout(function() { $("#error-dialog").hide(); }, 5000);
            } else {
                $.ajax({
                    url: connectURL
                }).done(function(status) {
                    console.log(status);
                    self.setState({status: "not-joined"});
                }).fail(function(xhr, status, error) {
                    console.log(status + ': ' + error);
                });
            }
        }).fail(function(xhr, status, err) {
            console.log(status + ': ' + error);
        });
    },
    render: function() {
      var joinButton = <button className="btn btn-panel btn-right-side" value=""></button>;
      if (this.state.status == "joined") {
          joinButton = <button onClick={this.clickLeave} className="btn btn-panel btn-right-side" value="Leave">Leave</button>;
      } else if (this.state.status == "pending") {
          joinButton = <button className="btn btn-panel btn-right-side pending_btn" value="Pending">Pending</button>;
      } else if (this.state.status == "not-joined") {
          joinButton = <button onClick={this.clickJoin} className="btn btn-panel btn-right-side" value="Join">Join</button>;
      }
      return(
        <div>{joinButton}</div>
      )
    }
});

var Container = React.createClass({
  getInitialState: function() {
    return { 
      value: '',
      data: []
    };
  },
  componentWillMount: function() {
    // do i need this?
  },  
  inputChange: function(inputValue) {
      var that = this;
      var str = inputValue;
      var r = [];
      $.when(
        $.ajax({
          url: '/allusers',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("USER SUCCESS DATA: ", data);
            $.map(data, function(item){
              var dlink = "/profile/" + item.username;
              r.push({label: item.fullname, value: item.fullname, category: "Users", imgsrc: item.picture.url, link: dlink, buttonText: 'Connect', username: item.username, objectId: item.objectId});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        }),
        $.ajax({
          url: '/allpublications',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("DATA RECEIVED FOR PUBS: ")
            console.log(data);
            $.map(data, function(item){
              //console.log("PUB ITEM: ");
              //console.log(item);
              var type = item.type;
              var dlink = "/publication/" + type + "/" + item.objectId;
              r.push({label: item.title, value: item.title, category: "Publications", imgsrc: "/images/paper.png", link: dlink, buttonText: 'See More'});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        }),
        $.ajax({
          url: '/allorganizations',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("DATA RECEIVED FOR ORGS: ")
            console.log(data);
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
  setValue: function (value) {
    this.setState({ value });
    console.log('Suggestion selected:', value.label);
  },
  updateValue: function (value) {
    console.log("Updating value: ", value);
    this.setState({ value: value });
  },
  renderLink: function() {
    return <a style={{ marginLeft: 5 }} href="/upgrade" target="_blank">Upgrade here!</a>;
  },
  renderOption: function(option) {
    var button;
    switch (option.category) {
      case 'Users':
        button = <ConnectButton username={option.username} objectId={option.objectId}/>
        break;
      case 'Organizations':
        button = <JoinButton objectId={option.objectId}/>
        break;
      default:
        button = null;
        break;
    }
    return (
      <div>
        <div className='item-box'>
          <div className='item-box-left'>
            <a style={{ cursor: 'pointer' }}>
              <img className='search-img' src={option.imgsrc}/>
            </a>
          </div>
        </div>

        <div className='item-box-right'>
          <a name='itemName' style={{cursor:'pointer'}}>
            {option.label}
          </a>
          {button}
        </div>
      </div>
    )
  },
  renderValue: function(option, e) {
    console.log(option);
    console.log("EVENT : ", e);
    //window.location.href = option.link;
    //return <strong style={{ color: option.color }}>{option.label}</strong>;
  },
  renderMenu: function(menu) {
    console.log("MENU RENDERER: ", menu);
    var options = menu.options;
    var users = options.filter(function(opt) {return opt.category === 'Users'});
    var orgs = options.filter(function(opt) {return opt.category === 'Organizations'});
    var pubs = options.filter(function(opt) {return opt.category === 'Publications'});
    return (
      <div>
      {(users.length > 0) ? <h5>Users</h5>:null}
      {users.map(function(usr) {
        return (
          <div>
            <div className='item-box'>
              <div className='item-box-left'>
                <a style={{ cursor: 'pointer' }}>
                  <img className='search-img' src={usr.imgsrc}/>
                </a>
              </div>
            </div>

            <div className='item-box-right'>
              <a name='itemName' style={{cursor:'pointer'}}>
                {usr.label}
              </a>
              <ConnectButton username={usr.username} objectId={usr.objectId}/>
            </div>
          </div>
        )
      })}
      {(orgs.length > 0) ? <h5>Organizations</h5>:null}
      {orgs.map(function(org) {
        return (
          <div>
            <div className='item-box'>
              <div className='item-box-left'>
                <a style={{ cursor: 'pointer' }}>
                  <img className='search-img' src={org.imgsrc}/>
                </a>
              </div>
            </div>

            <div className='item-box-right'>
              <a name='itemName' style={{cursor:'pointer'}}>
                {org.label}
              </a>
              <JoinButton objectId={org.objectId}/>
            </div>
          </div>
        )
      })}
      {(pubs.length > 0) ? <h5>Publications</h5>:null}
      {pubs.map(function(pub) {
        return (
          <div>
            <div className='item-box'>
              <div className='item-box-left'>
                <a style={{ cursor: 'pointer' }}>
                  <img className='search-img' src={pub.imgsrc}/>
                </a>
              </div>
            </div>

            <div className='item-box-right'>
              <a name='itemName' style={{cursor:'pointer'}}>
                {pub.label}
              </a>
            </div>
          </div>
        )
      })}
      </div>
    )
  },
  render: function () {
    return (
      <div className="section">
        <Select
          placeholder="Search..."
          options={this.state.data}
          optionRenderer={this.renderOption}
          onChange={this.setValue}
          value={this.state.value}
          valueRenderer={this.renderValue}
          onInputChange={this.inputChange}
          menuRenderer={this.renderMenu}
        />
      </div>
    )
  }
});

ReactDOM.render(
  <Container />,
  document.getElementById('autosuggest')
);