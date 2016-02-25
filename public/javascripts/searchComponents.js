
//var isNode = typeof module !== 'undefined' && module.exports
//var React = isNode ? require('react'): React //: window.React
//  , ReactDOM = isNode ? require('react') : window.ReactDOM
//var React = require('react');
//var Router = require('react-router').Router
//var Route = require('react-router').Route
//var Link = require('react-router').Link
var isNode = typeof require !== 'undefined'
var React = typeof require === 'undefined'
             ? window.React
             : require('react')

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

    this.state.data.map(function(item){
      console.log(item)
      for (var key in item) {
          var link = "/";
          var obj = item[key];
          switch (obj["type"]) {
          case "user":
            link = "/profile/" + key;
            users.push({
              "obj": item,
              "link": link,
              "key" : key
            });
            break;
          case "model":
            link = "/model/"  + obj["id"];
            models.push({
              "obj": item,
              "link": link,
              "key" : key
            });
            break;
          case "data":
            link = "/data/" + obj["id"];
            data.push({
              "obj": item,
              "link": link,
              "key": key
            });
            break;
          case "publication":
            link = "/publication/" + obj["id"];
            publications.push({
              "obj": item,
              "link": link,
              "key": key
            });
            break;
          case "organization":
            link = "/organization/" + obj["id"];
            organizations.push({
              "obj": item,
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
        React.createElement("div", {}, 
          React.createElement("h2", {}, "Search Results"),
          React.createElement("h3", {className: "leftClass"}, "Users: "),
          React.createElement("div", {className: "item-panel-newsFeed contain-panel-newsFeed grow"},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "col-md-4"}, users.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    React.createElement("li", {},
                      React.createElement("a", {href: link}, key)
                    )
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass"}, "Data: "),
          React.createElement("div", {className: "item-panel-newsFeed contain-panel-newsFeed grow"},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "col-md-4"}, data.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    React.createElement("li", {},
                      React.createElement("a", {href: link}, key)
                    )
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass"}, "Publications: "),
          React.createElement("div", {className: "item-panel-newsFeed contain-panel-newsFeed grow"},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "col-xs-8"}, publications.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    React.createElement("li", {},
                      React.createElement("a", {href: link}, key)
                    )
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass"}, "Organizations: "),
          React.createElement("div", {className: "item-panel-newsFeed contain-panel-newsFeed grow"},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "col-xs-8"}, organizations.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    React.createElement("li", {},
                      React.createElement("a", {href: link}, key)
                    )
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass"}, "Model: "),
          React.createElement("div", {className: "item-panel-newsFeed contain-panel-newsFeed grow"},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "col-xs-8"}, models.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    React.createElement("li", {},
                      React.createElement("a", {href: link}, key)
                    )
                  )
                  })
                )
              )
            )
          )
        )
      )
    }
});

 if (isNode) {
   exports.SearchFeed = SearchFeed;
 } else {
   ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('reactSearchContainer'));
 }



