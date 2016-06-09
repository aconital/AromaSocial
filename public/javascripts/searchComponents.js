
//var isNode = typeof module !== 'undefined' && module.exports
//var React = isNode ? require('react'): React //: window.React
//  , ReactDOM = isNode ? require('react') : window.ReactDOM
//var React = require('react');
//var Router = require('react-router').Router
//var Route = require('react-router').Route
//var Link = require('react-router').Link
// var isNode = typeof require !== 'undefined'
// var React = typeof require === 'undefined'
//              ? window.React
//              : require('react')

var SearchFeed = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },
  loadSearchFeed: function() {
    //$.ajax({
    //  url: '/searchfeeddata',
    //  dataType: 'json',
    //  cache: false,
    //  success: function(data) {
    //    console.log(data);
    //    this.setState({data: data});
    //  }.bind(this),
    //  error: function(xhr, status, err) {
    //    console.error(this.props.url, status, err.toString());
    //  }.bind(this)
    //});
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
            console.log("USER SUCCESS DATA: ", data);
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
            console.log("MODEL SUCCESS DATA: ", data);
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
            console.log("DATA SUCCESS DATA: ", data);
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
            console.log("DATA RECEIVED FOR PUBS: ")
            console.log(data);
            $.map(data, function(item){
              console.log("PUB ITEM: ");
              console.log(item);
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
            console.log("DATA RECEIVED FOR ORGS: ")
            console.log(data);
            $.map(data, function(item){
              var dlink = "/organization/" + item.name;
              r.push({type: "organization", title: item.displayName, img: item.picture, link: dlink, about: item.about});
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
    console.log("Browser rendering working!");
    this.loadSearchFeed();
  },
  render: function() {
    console.log("IN RENDERING")
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
      console.log("ITEM: ", item);
      switch(item.type) {
        case "user":
          usersFound = true;
          users.push(item);
          break;
        case "model":
          modelsFound = true;
          link = "/model/" + item.objectId;
          models.push(item);
          break;
        case "data":
          dataFound = true;
          link = "/data/" + item.objectId;
          data.push(item);
          break;
        case "publication":
          pubsFound = true;
          link = "/publication/" + item.objectId;
          publications.push(item);
          break;
        case "organization":
          orgsFound = true;
          link = "/organization/" + item.orgName;
          organizations.push(item);
          break;
        case "default":
          break;
      }
    });
    return (
        <div>
          SEARCH STUFF
          <div>
              <b> Users </b>
                <ul id="rig">
                {users.map(function (user) {
                  return (
                      <span >
                        <a href={user.link}>{user.fullname}</a>
                        <li>
                          <a className="rig-cell" href={user.link}>
                            <img className="rig-img" style={{width:"200px", height:"200px"}} src={user.img}/>
                            <span className="rig-overlay"></span>
                            <span className="rig-text">{user.about}</span>
                          </a>
                        </li>
                      </span>
                  )
                })}
                </ul>
          </div>

          <div>
            <b> Models </b>
            <ul id="rig">
              {models.map(function (model) {
                return (
                    <span >
                        <a href={model.link}>{model.title}</a>
                        <li>
                          <a className="rig-cell" href={model.link}>
                            <img className="rig-img" style={{width:"200px", height:"200px"}} src={model.img}/>
                            <span className="rig-overlay"></span>
                            <span className="rig-text">{model.about}</span>
                          </a>
                        </li>
                    </span>
                )
              })}
            </ul>
          </div>

          <div>
            <b> Data </b>
            <ul id="rig">
              {data.map(function (datum) {
                return (
                    <span >
                        <a href={datum.link}>{datum.title}</a>
                        <li>
                          <a className="rig-cell" href={datum.link}>
                            <img className="rig-img" style={{width:"200px", height:"200px"}} src={datum.img}/>
                            <span className="rig-overlay"></span>
                            <span className="rig-text">{datum.about}</span>
                          </a>
                        </li>
                      </span>
                )
              })}
            </ul>
          </div>

          <div>
            <b> Publications </b>
            <ul id="rig">
              {publications.map(function (pub) {
                return (
                    <span >
                        <a href={pub.link}>{pub.title}</a>
                        <li>
                          <a className="rig-cell" href={pub.link}>
                            <img className="rig-img" style={{width:"200px", height:"200px"}} src={pub.img}/>
                            <span className="rig-overlay"></span>
                            <span className="rig-text">{pub.about}</span>
                          </a>
                        </li>
                      </span>
                )
              })}
            </ul>
          </div>

          <div>
            <b> Organizations </b>
            <ul id="rig">
              {organizations.map(function (org) {
                return (
                    <span >
                        <a href={org.link}>{org.title}</a>
                        <li>
                          <a className="rig-cell" href={org.link}>
                            <img className="rig-img" style={{width:"200px", height:"200px"}} src={org.img}/>
                            <span className="rig-overlay"></span>
                            <span className="rig-text">{org.about}</span>
                          </a>
                        </li>
                      </span>
                )
              })}
            </ul>
          </div>

        </div>
    )
  }
});

  $( document ).ready(function() {
    ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('content'));
  });



