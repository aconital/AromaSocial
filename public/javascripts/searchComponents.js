
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
              r.push({type: "user", fullname: item.fullname, img: item.picture, link: dlink});
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
              r.push({type: "publication", title: item.title, imgs: "/images/paper.png", link: dlink});
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
              r.push({type: "organization", title: item.displayName, img: item.picture, link: dlink});
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
    //  for (var key in item) {
    //      console.log("KEY", key);
    //      var link = "/";
    //      var obj = item[key];
    //      console.log("OBJ IS ====>>>");
    //      console.log(obj["about"]);
    //      switch (obj["type"]) {
    //        case "user":
    //          usersFound = true;
    //          link = "/profile/" + key;
    //          users.push({
    //            "obj": obj,
    //            "link": link,
    //            "key" : key
    //          });
    //          break;
    //        case "model":
    //          modelsFound = true;
    //          link = "/model/"  + obj["id"];
    //          models.push({
    //            "obj": obj,
    //            "link": link,
    //            "key" : key
    //          });
    //          break;
    //        case "data":
    //          dataFound = true;
    //          link = "/data/" + obj["id"];
    //          data.push({
    //            "obj": obj,
    //            "link": link,
    //            "key": key
    //          });
    //          break;
    //        case "publication":
    //          pubsFound = true;
    //          link = "/publication/" + obj["id"];
    //          publications.push({
    //            "obj": obj,
    //            "link": link,
    //            "key": key
    //          });
    //          break;
    //        case "organization":
    //          orgsFound = true;
    //          link = "/organization/" + obj["id"];
    //          organizations.push({
    //            "obj": obj,
    //            "link": link,
    //            "key": key
    //          });
    //          break;
    //        case "default":
    //          link = "/";
    //        break;
    //    };
    //}
    });

    return (
        <div>
          SEARCH STUFF
          <div>
              {users.map(function (user) {
                return (
                    <div>
                      <a href={user.link}>{user.fullname}</a>
                    </div>
                )
              })}
          </div>

          <div>
            {models.map(function (model) {
              return (
                  <div>
                    <a href={model.link}>{model.title}</a>
                  </div>
              )
            })}
          </div>

          <div>
            {data.map(function (datum) {
              return (
                  <div>
                    <a href={datum.link}>{datum.title}</a>
                  </div>
              )
            })}
          </div>

          <div>
            {publications.map(function (pub) {
              return (
                  <div>
                    <a href={pub.link}>{pub.title}</a>
                  </div>
              )
            })}
          </div>

          <div>
            {organizations.map(function (org) {
              return (
                  <div>
                    <a href={org.link}>{org.title}</a>
                  </div>
              )
            })}
          </div>

        </div>
    )
  }
});

  $( document ).ready(function() {
    ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('content'));
  });



