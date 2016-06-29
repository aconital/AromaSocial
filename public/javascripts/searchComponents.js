var SearchFeed = React.createClass({
  getInitialState: function() {
    return {
      firstTime: true,
      data: [],
      userData: [],
      modData: [],
      pubData: [],
      orgData: [],
      dataData: [],
      showUsers: true,
      showModels: false,
      showData: false,
      showPublications: false,
      showOrganizations: false
    };
  },
  loadUserFeed: function() {
    var that = this;
    var str = searchString;
    var r = [];
    $.when(
      $.ajax({
          url: '/allusers',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("USER SUCCESS");
            $.map(data, function(item){
              var dlink = "/profile/" + item.username;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/user.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "user", fullname: item.fullname, img: pic, link: dlink, about: item.about});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        })
      ).then(
      this.setState({userData:r})
    );
  },
  loadModelFeed: function() {
    var that = this;
    var str = searchString;
    var r = [];
    $.when(
      $.ajax({
        url: '/allmodels',
        dataType: 'json',
        type: 'POST',
        data: {substr: str},
        cache: false,
        success: function(data) {
          console.log("MODEL SUCCESS");
          $.map(data, function(item){
            var dlink = "/model/" + item.objectId;
            var pic;
            if (item.picture == undefined) {
              pic = "/images/model.png";
            } else {
              pic = item.picture.url;
            }
            r.push({type: "model", fullname: item.fullname, img: pic, link: dlink, about: item.abstract});
          });
        },
        error: function(xhr) {
          console.log(xhr.status);
        }
      })
      ).then(   
      this.setState({modData:r})
    );
  },
  loadDataFeed: function() {
    var that = this;
    var str = searchString;
    var r = [];
    $.when(
      $.ajax({
          url: '/alldata',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("DATA SUCCESS DATA");
            $.map(data, function(item){
              var dlink = "/data/" + item.objectId;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/data.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "data", fullname: item.fullname, img: pic, link: dlink, about: item.description});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        })
      ).then( 
      this.setState({dataData:r})
    );
  },
  loadPubFeed: function() {
    var that = this;
    var str = searchString;
    var r = [];
    $.when(
      $.ajax({
        url: '/allpublications',
        dataType: 'json',
        type: 'POST',
        data: {substr: str},
        cache: false,
        success: function(data) {
          console.log("PUBS SUCCESS");
          $.map(data, function(item){
            var type = item.type;
            var dlink = "/publication/" + type + "/" + item.objectId;
            r.push({type: "publication", title: item.title, img: "/images/paper.png", link: dlink, about: item.abstract});
          });
        },
        error: function(xhr) {
          console.log(xhr.status);
        }
      })
      ).then(
      this.setState({pubData: r})
    );
  },
  loadOrgFeed: function() {
    var that = this;
    var str = searchString;
    var r = [];
    $.when(
      $.ajax({
        url: '/allorganizations',
        dataType: 'json',
        type: 'POST',
        data: {substr: str},
        cache: false,
        success: function(data) {
          console.log("ORGS SUCCESS");
          $.map(data, function(item){
            var dlink = "/organization/" + item.name;
            var pic;
            if (item.picture == undefined) {
              pic = "/images/user.png";
            } else {
              pic = item.picture.url;
            }
            r.push({type: "organization", title: item.displayName, img: pic, link: dlink, about: item.about});
          });
        },
        error: function(xhr) {
          console.log(xhr.status);
        }
      })
    ).then(this.setState({orgData: r}));
  },
  loadSearchFeed: function() {
    var that = this;
    var str = searchString;
    console.log("Search string: ", str);
    var r = [];
    $.when(
        $.ajax({
          url: '/allusers',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("USER SUCCESS");
            $.map(data, function(item){
              var dlink = "/profile/" + item.username;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/user.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "user", fullname: item.fullname, img: pic, link: dlink, about: item.about});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        }),
        $.ajax({
          url: '/allmodels',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("MODEL SUCCESS");
            $.map(data, function(item){
              var dlink = "/model/" + item.objectId;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/model.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "model", fullname: item.fullname, img: pic, link: dlink, about: item.abstract});
            });
          },
          error: function(xhr) {
            console.log(xhr.status);
          }
        }),
        $.ajax({
          url: '/alldata',
          dataType: 'json',
          type: 'POST',
          data: {substr: str},
          cache: false,
          success: function(data) {
            console.log("DATA SUCCESS");
            $.map(data, function(item){
              var dlink = "/data/" + item.objectId;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/data.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "data", fullname: item.fullname, img: pic, link: dlink, about: item.description});
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
            console.log("PUB SUCCESS");
            $.map(data, function(item){
              var type = item.type;
              var dlink = "/publication/" + type + "/" + item.objectId;
              r.push({type: "publication", title: item.title, img: "/images/paper.png", link: dlink, about: item.abstract});
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
            console.log("ORG SUCCESS")
            $.map(data, function(item){
              var dlink = "/organization/" + item.name;
              var pic;
              if (item.picture == undefined) {
                pic = "/images/user.png";
              } else {
                pic = item.picture.url;
              }
              r.push({type: "organization", title: item.displayName, img: pic, link: dlink, about: item.about});
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
  componentDidMount: function() {
    console.log("TIME STATUS =========> ", this.state.firstTime);
    if (this.state.firstTime === true) {
      this.loadSearchFeed();
    }
    this.setState({firstTime:false});
  },
  setUserState: function() {
    this.setState({
      showUsers: true,
      showModels: false,
      showData: false,
      showPublications: false,
      showOrganizations: false
    });
  },
  setModelState: function() {
    this.setState({
      showUsers: false,
      showModels: true,
      showData: false,
      showPublications: false,
      showOrganizations: false
    });
  },
  setDataState: function() {
    this.setState({
      showUsers: false,
      showModels: false,
      showData: true,
      showPublications: false,
      showOrganizations: false
    });
  },
  setPubState: function() {
    this.setState({
      showUsers: false,
      showModels: false,
      showData: false,
      showPublications: true,
      showOrganizations: false
    });
  },
  setOrgState: function() {
    this.setState({
      showUsers: false,
      showModels: false,
      showData: false,
      showPublications: false,
      showOrganizations: true
    });
  },
  render: function() {
    var users = [];
    var models = [];
    var data = [];
    var publications = [];
    var organizations = [];

    var usersFound = false;
    var modelsFound = false;
    var dataFound = false;
    var pubsFound = false;
    var orgsFound = false;

    this.state.data.map(function(item){
      switch(item.type) {
        case "user":
          usersFound = true;
          users.push(item);
          break;
        case "model":
          modelsFound = true;
          models.push(item);
          break;
        case "data":
          dataFound = true;
          data.push(item);
          break;
        case "publication":
          pubsFound = true;
          publications.push(item);
          break;
        case "organization":
          orgsFound = true;
          organizations.push(item);
          break;
        case "default":
          break;
      }
    });

    var noResults = <div>
                    <a href="http://www.clker.com/cliparts/2/P/z/V/R/S/monkey-face-th.png"><img src='http://www.clker.com/cliparts/2/P/z/V/R/S/monkey-face-th.png'/></a>
                     <b> Your search <i>'{searchString}'</i> did not return any results </b>
                     <p> Here are a few tips to help you get going: </p>
                     <ul> 
                      <li> Double check your spelling. </li>
                      <li> Try making your search broader. You can always narrow it down later.</li>
                      <li> Search single words. Search what you are relatively sure of. For example: if you are sure of a person's last name, just give that a go. We'll get the first name for you. </li>
                     </ul>
                  </div>;

    var userDiv;
    var modelDiv;
    var dataDiv;
    var pubDiv;
    var orgDiv;

    if (users.length <= 0) {
      userDiv = <div className='noResults'><h3>Users</h3><br></br> {noResults}</div>;
    } else {
      userDiv = <div>
                  <div className="headerDiv"><h3> Users </h3></div>
                    <ul id="rig">
                      {users.map(function (user) {
                        return (
                            <span>
                              <a href={user.link}></a>
                              <li>
                                <a className="rig-cell" href={user.link}>
                                  <figure>
                                    <img className="rig-img" style={{width:"100%", height:"100%"}} src={user.img}/>
                                    <figcaption style={{color:"black"}}>{user.fullname}</figcaption>
                                  </figure>
                                  <span className="rig-overlay"></span>
                                  <span className="rig-text">{user.about}</span>
                                </a>
                              </li>
                            </span>
                        )
                      })}
                    </ul>
                </div>;
    }
    if (models.length <= 0) {
      modelDiv = <div className='noResults'><h3>Models</h3><br></br> {noResults}</div>;
    } else {
      modelDiv = <div>
                      <div className="headerDiv"><h3> Models </h3></div>
                        <ul id="rig">
                          {models.map(function (model) {
                            return (
                                <span >
                                    <a href={model.link}></a>
                                    <li>
                                      <a className="rig-cell" href={model.link}>
                                        <figure>
                                          <img className="rig-img" style={{width:"100%", height:"100%"}} src={model.img}/>
                                          <figcaption style={{color:"black"}}>{model.title}</figcaption>
                                        </figure>
                                        <span className="rig-overlay"></span>
                                        <span className="rig-text">{model.about}</span>
                                      </a>
                                    </li>
                                </span>
                            )
                          })}
                        </ul>
                      </div>;
    }
    if (data.length <= 0) {
      dataDiv = <div className='noResults'><h3>Data</h3><br></br> {noResults}</div>;
    } else {
      dataDiv =  <div>
                      <div className="headerDiv"><h3> Data </h3></div>
                        <ul id="rig">
                          {data.map(function (datum) {
                            return (
                                <span >
                                    <a href={datum.link}>{datum.title}</a>
                                    <li>
                                      <a className="rig-cell" href={datum.link}>
                                        <figure>
                                          <img className="rig-img" style={{width:"100%", height:"100%"}} src={datum.img}/>
                                          <figcaption style={{color:"black"}}>{datum.title}</figcaption>
                                        </figure>
                                        <span className="rig-overlay"></span>
                                        <span className="rig-text">{datum.about}</span>
                                      </a>
                                    </li>
                                  </span>
                            )
                          })}
                        </ul>
                      </div>;
    }
    if (publications.length <= 0) {
      pubDiv = <div className='noResults'><h3>Publications</h3><br></br> {noResults}</div>;
    } else {
      pubDiv = <div>
                    <div className="headerDiv"><h3> Publications </h3></div>
                      <ul id="rig">
                        {publications.map(function (pub) {
                          return (
                              <span>
                                  <a href={pub.link}></a>
                                  <li>
                                    <a className="rig-cell" href={pub.link}>
                                      <figure>
                                        <img className="rig-img" style={{width:"100%", height:"100%"}} src={pub.img}/>
                                        <figcaption style={{color:"black"}}>{pub.title}</figcaption>
                                      </figure>
                                      <span className="rig-overlay"></span>
                                      <span className="rig-text">Go to Publication</span>
                                    </a>
                                  </li>
                              </span>
                          )
                        })}
                      </ul>
                    </div>;
    }
    if (organizations.length <= 0) {
      orgDiv = <div className='noResults'><h3>Organizations</h3><br></br> {noResults}</div>;
    } else {
      orgDiv =  <div>
                  <div className="headerDiv"><h3> Organizations </h3></div>
                    <ul id="rig">
                      {organizations.map(function (org) {
                        return (
                            <span >
                                <a href={org.link}></a>
                                <li>
                                  <a className="rig-cell" href={org.link}>
                                    <figure>
                                      <img className="rig-img" style={{width:"100%", height:"100%"}} src={org.img}/>
                                      <figcaption style={{color:"black"}}>{org.title}</figcaption>
                                    </figure>
                                    <span className="rig-overlay"></span>
                                    <span className="rig-text">Go to Organization</span>
                                  </a>
                                </li>
                              </span>
                        )
                      })}
                    </ul>
                </div>;
    }

    return (
        <div className="mainSearchDiv">
            <div className="filter">
              <ul className="cf">
              <li><a className="dropdown" href="#">Filter Results</a>
              <div><b>You searched <i>'{searchString}'</i></b></div>
                <ul>
                    <li><a href="#" onClick={this.setUserState}>Show Users</a></li>
                    <li><a href="#" onClick={this.setModelState}>Show Models</a></li>
                    <li><a href="#" onClick={this.setDataState}>Show Data</a></li>
                    <li><a href="#" onClick={this.setPubState}>Show Publications</a></li>
                    <li><a href="#" onClick={this.setOrgState}>Show Organizations</a></li>
                </ul>
              </li>
              </ul>
            </div>
            {(this.state.showUsers) ? userDiv:null}
            {(this.state.showModels) ? modelDiv:null}
            {(this.state.showData) ? dataDiv:null}
            {(this.state.showPublications) ? pubDiv:null}
            {(this.state.showOrganizations) ? orgDiv:null}
        </div>
    )
  }
});

$( document ).ready(function() {
  ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('content'));
});



