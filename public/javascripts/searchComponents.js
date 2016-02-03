
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
    return (
      React.createElement("div", {}, this.state.data.map(function(items){
            console.log(items)
            for (var key in items) {
              var link = "/";
              var obj = items[key];
              console.log(key);
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
                      )
                    )
                )
              )
            }
          }))

        )
    	}
});

 if (isNode) {
   exports.SearchFeed = SearchFeed;
 } else {
   ReactDOM.render(React.createElement(SearchFeed, {}), document.getElementById('reactSearchContainer'));
 }
//exports.SearchFeed = SearchFeed;



