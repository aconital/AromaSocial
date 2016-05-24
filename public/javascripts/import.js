var Button = ReactBootstrap.Button;

var ImportContent = React.createClass({
    getInitialState: function() {
     return {
     	status: 'askForAction',
     	name: name,
     	ajaxStatus:'',
     	results: {}
        };
    },
	querySciDir: function(e) {
		e.preventDefault();

		var nameQuery = this.state.name || 'saeed ghafghazi'; // TODO split etc
		this.setState({createStatus: 'Please wait...'});


		$.ajax({
			url: 'http://api.elsevier.com/content/search/scidir?apiKey=TODO&query=specific-author(' + nameQuery + ')&query=srctype(serial)&view=COMPLETE',
			dataType: 'jsonp',
			headers: {
				'X-ELS-APIKey': 'TODO',
				'Accept':'application/json'
			},
			success: function(data) {
				console.log(data);
				var totalResults = data['search-results']['opensearch:totalResults'];
				var entry = data['search-results']['entry'];
				console.log(JSON.stringify(entry,null,4));
				// TODO: displsy
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('http://api.elsevier.com', status, err, xhr);
				this.setState({ autoFillStatus: "DOI not found. Try again." });
			}.bind(this)
		});
	},
	render: function() {
		var content;
		if (this.state.status == 'askForAction') {
			content = <ImportButtons querySciDir={this.querySciDir} />
		} else if (this.state.status == 'searching') {
			content = <div>Searching ScienceDirect...</div>
		} else {
			content = <ResultsTable querySciDir={this.querySciDir} />
		}

		return (
			<div>
				{content}
			</div>
		);
	}
});

var ImportButtons = React.createClass({
    querySciDir(e) {
        console.log('here');
        // this.setMsg('In progress...');
        this.props.querySciDir(e);
        console.log("end");
    },

	render: function() {
		return (
			<div id="">
				<Button className="btn-success btn-lg" onClick={this.querySciDir}>Yes, import my works</Button>
				<Button className="btn-secondary btn-lg space" onClick={this.redirect}>No, proceed to Syncholar</Button>
			</div>
		);
	}
});

var ResultsTable = React.createClass({
	// TODO
	render: function() {
		return (
			<div id="">
				Hi
			</div>
		);
	}
});

var Required = React.createClass({
	render: function() {
		var requiredField = {color: 'red', fontWeight: '800'}
		return (
			<span style={requiredField}>{this.props.content}</span>
		);
	},
});
$( document ).ready(function() {
	ReactDOM.render(<ImportContent />, document.getElementById('content'));
});