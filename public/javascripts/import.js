var Button = ReactBootstrap.Button, ListGroup = ReactBootstrap.ListGroup, Table=ReactBootstrap.Table;

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
		var self = this;

		var nameQuery = this.state.name || 'saeed ghafghazi'; // TODO split etc
		this.setState({ createStatus: 'Please wait...',
						status: 'searching'});

		var params = {
			"expr": "Composite(AA.AuN=='saeed ghafghazi')",
			"model": "latest",
			"count": "10",
			"offset": "0",
			// "orderby": "{string}",
			"attributes": "Ti,Y,AA.AuN,E",
		};

		$.ajax({
			// url: "https://api.projectoxford.ai/academic/v1.0/evaluate?" + $.param(params),
			// beforeSend: function(xhrObj){
			// 	xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","69bc82dd085d458bbcf261cf06a68558");
			// },
			url: '/fetchworks',
			type: "GET",
			// data: "{body}",
		})
		.done(function(data) {
			console.log(data);
			var entities = data.data['entities'];
			console.log(JSON.stringify(entities,null,4));
			self.setState({ results: entities,
							status: 'showTable' });
		})
		.fail(function(xhr, status, err) {
			console.error('http://.projectoxford.ai/academic/', status, err, xhr);
		});

		// $.ajax({
		// 	url: "https://api.projectoxford.ai/academic/v1.0/evaluate?expr= Composite(AA.AuN=='saeed ghafghazi')&attributes=Ti,Y,AA.AuN,AA.AuId,E",
		// 	dataType: 'jsonp',
		// 	headers: {
		// 		'Ocp-Apim-Subscription-Key' : '69bc82dd085d458bbcf261cf06a68558',
		// 		// 'Accept':'application/json'
		// 	},
		// 	success: function(data) {
		// 		console.log(data);
		// 		var totalResults = data['search-results']['opensearch:totalResults'];
		// 		var entry = data['search-results']['entry'];
		// 		console.log(JSON.stringify(entry,null,4));
		// 		// TODO: displsy
		// 	}.bind(this),
		// 	error: function(xhr, status, err) {
		// 		console.error('http://api.elsevier.com', status, err, xhr);
		// 		this.setState({ autoFillStatus: "DOI not found. Try again." });
		// 	}.bind(this)
		// });
	},
	render: function() {
		var content;
		if (this.state.status == 'askForAction') {
			content = <div><ImportButtons querySciDir={this.querySciDir} /></div>
		} else if (this.state.status == 'searching') {
			console.log('henshin!');
			content = <div>Searching...</div>
		} else if (this.state.status == 'showTable') {
			console.log('change again');
			content = <WorksList results={this.state.results} />
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

var WorkItem = React.createClass({
	// TODO
	getInitialState: function() {
		return {
			isImported: true,
			entity: this.props.entity,
		};
    },
    toTitleCase(str) {
		return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	},
	toggleCheck(e) { // TODO toggle on tr click, not span click
		if ($(e.target).hasClass("glyphicon-remove")) {
			this.setState({isImported: true});
			$(e.target).removeClass("glyphicon-remove").addClass("glyphicon-ok imported");
		} else {
			this.setState({isImported: false});
			$(e.target).removeClass("glyphicon-ok imported").addClass("glyphicon-remove");
		}
	},

	render() {
		var entity = this.props.entity;
		var extended = JSON.parse(entity.E);
		var allAuthors = entity.AA.reduce( (prev, curr) => prev + ', ' + this.toTitleCase(curr.AuN), '' );
		var importFeedback = this.state.isImported ? { backgroundColor: '#bbefbb' } : { backgroundColor: 'white'};

		return (
			<tr style={importFeedback}>
				<td className="import-works-checkbox"><span className="glyphicon glyphicon-ok imported" onClick={this.toggleCheck}></span></td>
				<td className="import-works-details">
					<div><strong>Title:</strong> {extended.DN}</div>
					<div><strong>Authors:</strong> {allAuthors}</div>
					<div><strong>Publication Year:</strong> {this.state.entity.Y}</div>
				</td>
			</tr>
		)
	}
});

var WorksList = React.createClass({
	// TODO
	render: function() {
		var results = this.props.results;
		var items = results.map(function(item) { 
            return <WorkItem entity={item} />;
        });

		return (
			<div style={{width: '90%'}} className="center-block">
				<div>Please highlight the works that you would like to import. Details of each individual work can be edited after submission.</div>
				<Table id="import-works-list" bordered striped>
					<thead>
						<tr>
							<th style={{width: '10%'}}>Import?</th>
							<th style={{width: '90%'}}>Details</th>
						</tr>
					</thead>
					<tbody>
						{this.props.results.map(function(item) { 
						    return <WorkItem entity={item} />
						})}
					</tbody>
				</Table>
				<Button className="btn-success btn-lg" onClick={this.TODO}>Import highlighted works and continue</Button>
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

var CheckItem = React.createClass({
	getInitialState: function () {
	return {
	    checked: this.props.checked || false
	 };
	},
	render: function () {
		var item={};
	return (
	    <li><div className="item-box">
			<div key={item.objectId}>
			    <div className="item-box-left">
			        <div className="item-box-image-outside">
			            <a href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
			        </div>
			    </div>
			    <div className="item-box-right">
			        <a href={'/project/'+item.objectId} className="body-link"><h4 className="margin-top-bottom-5">TITLE</h4></a>
			        <table className="item-box-right-tags">
			            <tr><td>Date: </td><td>DATE</td></tr>
			        </table>
			    </div>
			</div>
		</div></li>
	);
	},
	handleClick: function(e) {
	  this.setState({checked: e.target.checked});
	}
});

$( document ).ready(function() {
	ReactDOM.render(<ImportContent />, document.getElementById('content'));
});