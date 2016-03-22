
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
        React.createElement("div", {},

          React.createElement(
    "nav",
    { className: "navbar navbar-default" },
    React.createElement(
        "div",
        { className: "container-fluid", style: {"max-width":"1180px"}, style: {"padding-left":"30px"}, style: {margin:"auto"} },
        React.createElement(
            "div",
            { className: "navbar-header" },
            React.createElement(
                "button",
                { type: "button", "data-toggle": "collapse", "data-target": "#bs-example-navbar-collapse-1", "aria-expanded": "false", className: "navbar-toggle collapsed" },
                React.createElement(
                    "span",
                    { className: "sr-only" },
                    "Toggle Navigation"
                ),
                React.createElement("span", { className: "icon-bar" }),
                React.createElement("span", { className: "icon-bar" }),
                React.createElement("span", { className: "icon-bar" })
            ),
            React.createElement(
                "a",
                { href: "/newsfeed", className: "navbar-brand" },
                React.createElement("img", { alt: "RT", src: "/images/beaker-invert.png", width: "30" })
            )
        ),
        React.createElement(
            "div",
            { id: "bs-example-navbar-collapse-1", className: "collapse navbar-collapse" },
            React.createElement(
                "ul",
                { className: "nav navbar-nav" },
                React.createElement(
                    "li",
                    { className: "dropdown" },
                    React.createElement(
                        "a",
                        { href: "#", className: "dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false" },
                        React.createElement("span", { className: "glyphicon glyphicon-menu-hamburger", "aria-hidden": "true" }),
                        " Menu ",
                        React.createElement("span", { className: "caret" })
                    ),
                    React.createElement(
                        "ul",
                        { className: "dropdown-menu" },
                        React.createElement(
                            "li",
                            null,
                            React.createElement(
                                "a",
                                { href: "/create/organization" },
                                "Create Organization"
                            )
                        ),
                        React.createElement(
                            "li",
                            null,
                            React.createElement(
                                "a",
                                { href: "/report" },
                                "Report Problem"
                            )
                        )
                    )
                )
            ),
            React.createElement(
                "ul",
                { className: "nav navbar-nav navbar-right" },
                React.createElement(
                    "li",
                    { className: "dropdown" },
                    React.createElement(
                        "a",
                        { href: "#", className: "dropdown-toggle", "data-toggle": "dropdown", role: "button", "aria-haspopup": "true", "aria-expanded": "false" },
                        React.createElement(
                            "span",
                            { className: "logout-button" },
                            React.createElement("i", { className: "fa fa-user-plus" })
                        ),
                        React.createElement("span", { id: "notification-request" })
                    ),
                    React.createElement("ul", { id: "friendrequest", className: "dropdown-menu", "aria-labelledby": "dropdownMenuDivider" })
                ),
                React.createElement(
                    "li",
                    { className: "dropdown" },
                    React.createElement(
                        "a",
                        { href: "/signout", role: "button", className: "logout-button" },
                        React.createElement("span", { className: "glyphicon glyphicon-log-out body-link" })
                    )
                )
            ),
            React.createElement(
                "form",
                { role: "search", method: "post", action: "/searchpage", className: "navbar-form navbar-right" },
                React.createElement(
                    "div",
                    { className: "form-group form-inline", style: {width:"100%"} },
                    React.createElement(
                        "div",
                        { className: "input-group purple", style: {width:"100%"} },
                        React.createElement("input", { id: "message", type: "text", name: "searchQuery", placeholder: "Search...", className: "form-control search-bar auto" }),
                        React.createElement(
                            "button",
                            { type: "submit", className: "btn btn-primary btn-search searchButton", disabled: "disabled" },
                            React.createElement("span", { "aria-hidden": "true", className: "glyphicon glyphicon-search" })
                        )
                    )
                )
            )
        )
    )
),

          React.createElement("h2", {className: "text-center"}, "Search Results"),
          React.createElement("h3", {className: "leftClass text-center", style: {display: usersFound?"":"none"}}, "Users"),
          React.createElement("div", {className: "", style: {display: usersFound?"inline":"none"}},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "list-group"}, users.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    //React.createElement("li", {},
                      React.createElement("a", {href: link, className: "list-group-item"},
                        React.createElement("div", {className: "clearfix"},
                          React.createElement("img", {src: obj["img"], height: "120px", width: "120px", style: {}, className: "pull-left gap-all img-circle"}),
                          React.createElement("h4", {className: "list-group-item-heading", style: {color: "black"}}, key)
                        ),
                        React.createElement("p", {className: "list-group-item-text", style: {color: "black"}}, obj["about"])
                      )
                      // key)
                    //)
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass text-center", style: {display: dataFound?"":"none"}}, "Data"),
          React.createElement("div", {className: "", style: {display: dataFound?"inline":"none"}},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "list-group"}, data.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    //React.createElement("li", {},
                      React.createElement("a", {href: link, className: "list-group-item"},
                        React.createElement("div", {className: "clearfix"},
                          React.createElement("img", {src: obj["img"], height: "120px", width: "120px", style: {}, className: "pull-left gap-all img-circle"}),
                          React.createElement("h4", {className: "list-group-item-heading", style: {color: "black"}}, key)
                        ),
                        React.createElement("p", {className: "list-group-item-text", style: {color: "black"}}, obj["about"])
                      )
                    //)
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass text-center", style: {display: pubsFound?"":"none"}}, "Publications"),
          React.createElement("div", {className: "", style: {display: pubsFound?"inline":"none"}},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "list-group"}, publications.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    //React.createElement("li", {},
                      React.createElement("a", {href: link, className: "list-group-item"},
                        React.createElement("div", {className: "clearfix"},
                          React.createElement("img", {src: obj["img"], height: "120px", width: "120px", style: {}, className: "pull-left gap-all img-circle"}),
                          React.createElement("h4", {className: "list-group-item-heading", style: {color: "black"}}, key)
                        ),
                        React.createElement("p", {className: "list-group-item-text", style: {color: "black"}}, obj["about"])
                      )
                    //)
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass text-center", style: {display: orgsFound?"":"none"}}, "Organizations"),
          React.createElement("div", {className: "", style: {display: orgsFound?"inline":"none"}},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "list-group"}, organizations.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    //React.createElement("li", {},
                      React.createElement("a", {href: link, className: "list-group-item"},
                        React.createElement("div", {className: "clearfix"},
                          React.createElement("img", {src: obj["img"], height: "120px", width: "120px", style: {}, className: "pull-left gap-all img-circle"}),
                          React.createElement("h4", {className: "list-group-item-heading", style: {color: "black"}}, key)
                        ),
                        React.createElement("p", {className: "list-group-item-text", style: {color: "black"}}, obj["about"])
                      )
                    //)
                  )
                  })
                )
              )
            )
          ),
          React.createElement("h3", {className: "leftClass text-center", style: {display: modelsFound?"":"none"}}, "Model"),
          React.createElement("div", {className: "", style: {display: modelsFound?"inline":"none"}},
            React.createElement("div", {className: "row"},
              React.createElement("ul", {}, 
                React.createElement("div", {className: "list-group"}, models.map(function(i){
                  obj = i["obj"]
                  link = i["link"]
                  key = i["key"]
                  return(
                    //React.createElement("li", {},
                      React.createElement("a", {href: link, className: "list-group-item"},
                        React.createElement("div", {className: "clearfix"},
                          React.createElement("img", {src: obj["img"], height: "120px", width: "120px", style: {}, className: "pull-left gap-all img-circle"}),
                          React.createElement("h4", {className: "list-group-item-heading", style: {color: "black"}}, key)
                        ),
                        React.createElement("p", {className: "list-group-item-text", style: {color: "black"}}, obj["about"])
                      )
                    //)
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



