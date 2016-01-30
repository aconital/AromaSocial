
//var isNode = typeof module !== 'undefined' && module.exports
//  , React = isNode ? require('react') : window.React
//  , ReactDOM = isNode ? require('react') : window.ReactDOM
var React = require('react');
var Router = require('react-router').Router
var Route = require('react-router').Route
var Link = require('react-router').Link

var SearchFeed = React.createClass({
  getInitialState: function() {
    return {
      data: [1, 2, 3, 4, 5]
    };
  },
  componentDidMount: function() {
    console.log("Browser rendering working!");
  },
  render: function() {
    // return (
    //     React.createElement(
    //       "div",
    //       null,
    //       React.createElement(
    //         "h1",
    //         null,
    //         "App"
    //       ),
    //       React.createElement(
    //         "ul",
    //         null,
    //         React.createElement(
    //           "li",
    //           null,
    //           React.createElement(
    //             "a",
    //             { href: "/" },
    //             key
    //           )
    //         ),
    //         React.createElement(
    //           "li",
    //           null,
    //           React.createElement(
    //             "a",
    //             { href: "/" },
    //             items[key]
    //           )
    //         )
    //       )
    //     )        
    // )
    return (
      React.createElement("div", {}, this.props.data.map(function(items){
            for (var key in items) {
              var link = "/";
              var obj = items[key];
              console.log(obj);
              switch (obj["type"]) {
                case "user":
                  link = "/profile/" + key;
                  break;
                case "model":
                  link = "/model/"  + obj["id"];
                  break;
                case "data":
                  link = "/data/" + obj["id"];
                  break;
                case "publication":
                  link = "/publication/" + obj["id"];
                  break;
                case "organization":
                  link = "/organization/" + obj["id"];
                  break;
                case "default":
                  link = "/";
                  break;
              };
              return (
                React.createElement("div", {},
                    React.createElement(
                      "ul",
                      null,
                      React.createElement(
                        "li",
                        null,
                        React.createElement(
                          "a",
                          { href: link },
                          key
                        )
                      ))
                )
              )
            }
          }))
        )
    // return (
    // 	React.createElement("div", {}, this.props.data.map(function(items){
    //   		  for (var key in items) {
    //           return (
    //             React.createElement("div", {}, 
    //               React.createElement("h1", null, key),
    //               React.createElement("h5", null, items[key])
    //             )
    //           )
    //         }
    //       }))
    // 		)
    	}
});

// if (isNode) {
//   exports.SearchFeed = SearchFeed;
// } else {
//   ReactDOM.render(React.createElement(SearchFeed, {data: [1,2,3,4,5]}), document.getElementById('content'));
// }
exports.SearchFeed = SearchFeed;



