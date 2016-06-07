
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
    $.ajax({
      url: '/searchfeeddata',
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
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
      console.log(item);
      for (var key in item) {
          var link = "/";
          var obj = item[key];
          console.log("OBJ IS ====>>>");
          console.log(obj["about"]);
          switch (obj["type"]) {
            case "user":
              usersFound = true;
              link = "/profile/" + key;
              users.push({
                "obj": obj,
                "link": link,
                "key" : key
              });
              break;
            case "model":
              modelsFound = true;
              link = "/model/"  + obj["id"];
              models.push({
                "obj": obj,
                "link": link,
                "key" : key
              });
              break;
            case "data":
              dataFound = true;
              link = "/data/" + obj["id"];
              data.push({
                "obj": obj,
                "link": link,
                "key": key
              });
              break;
            case "publication":
              pubsFound = true;
              link = "/publication/" + obj["id"];
              publications.push({
                "obj": obj,
                "link": link,
                "key": key
              });
              break;
            case "organization":
              orgsFound = true;
              link = "/organization/" + obj["id"];
              organizations.push({
                "obj": obj,
                "link": link,
                "key": key
              });
              break;
            case "default":
              link = "/";
            break;
        };
    }});

    return (
      <div> SEARCH PAGE STUFF </div>
    )
  }
});

  $( document ).ready(function() {
    ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('content'));
  });



