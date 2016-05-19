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
	queryCrossRef: function(e) {
		e.preventDefault();

		var nameQuery = this.state.name; // TODO split etc
		this.setState({createStatus: 'Please wait...'});


		$.ajax({
			url: 'http://api.crossref.org/works?query=' + 'allen+renear' + '',
			type: 'GET',
			success: function(data) {
				console.log(data);
				var totalResults = data.message['total-results'];
				var entry = data.message.items;
				console.log(JSON.stringify(entry,null,4));
				// TODO: displsy
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('http://api.crossref.org/works/', status, err.toString());
				this.setState({ autoFillStatus: "DOI not found. Try again." });
			}.bind(this)
		});
	},
	render: function() {
		var content;
		if (this.state.status == 'askForAction') {
			content = <ImportButtons />
		} else if (this.state.status == 'searching') {
			content = <div>Searching CrossRef...</div>
		} else {
			content = <ResultsTable queryCrossRef=/>
		}

		return (
			<div>
				{content}
			</div>
		);
	}
});

var ImportButtons = React.createClass({
	render: function() {
		return (
			<div id="">
				<Button className="btn-success btn-lg" onClick={this.queryCrossRef}>Yes, import my works</Button>
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