var React = require('react')

var WrapperComponent = React.createClass({
	getContent: function() {
		return {
			__html: this.props.content
		};
	},

	render: function() {
		return (
			React.createElement("html", null, 
				React.createElement("head", null,
					React.createElement("title", null, "Search Wrapper")
				),
				React.createElement("body", null,
					React.createElement("div", { id: "reactSearchContainer",
						dangerouslySetInnerHTML: {__html: this.props.content} })
				),
				React.createElement("script", {src: "/javascripts/jquery/dist/jquery.min.js" }),
				React.createElement("script", {src: "https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/react.js" }),
				React.createElement("script", {src: "https://cdnjs.cloudflare.com/ajax/libs/react/0.14.0/react-dom.min.js" }),
				React.createElement("script", {src: "https://cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.27.2/react-bootstrap.min.js" }),
			    React.createElement("link", {rel: "stylesheet", href: "//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css"}),
				React.createElement("link", {rel: "stylesheet", href: "https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css"}),
				React.createElement("link", {rel: "stylesheet", href: "/stylesheets/style.css"}),
				React.createElement("script", {src: "/javascripts/searchComponents.js" })
			)
		)
	}
})

exports.WrapperComponent = WrapperComponent;