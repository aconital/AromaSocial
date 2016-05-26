var Button = ReactBootstrap.Button, ListGroup = ReactBootstrap.ListGroup, Table=ReactBootstrap.Table;

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

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
			// console.log(JSON.stringify(entities,null,4));
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
    // controls highlighting of items to import and fires related events
	toggleCheck(e) { // TODO toggle on tr click, not span click
		if ($(e.target).hasClass("glyphicon-remove")) {
			this.setState({isImported: true});
			$(e.target).removeClass("glyphicon-remove").addClass("glyphicon-ok imported");
			this.toggleImport(true);
		} else if ($(e.target).hasClass("glyphicon-ok")) {
			this.setState({isImported: false});
			$(e.target).removeClass("glyphicon-ok imported").addClass("glyphicon-remove");
			this.toggleImport(false);
		}
	},
	// tells WorksList to add or remove item at current index
	toggleImport(toAdd) {
		console.log('passingUp', this.props.index, toAdd);
		this.props.toggleImport(this.props.index, toAdd);
	},

	render() {
		var entity = this.props.entity;
		var extended = JSON.parse(entity.E);
		var allAuthors = entity.AA.reduce( (prev, curr) => prev + ', ' + toTitleCase(curr.AuN), '' );
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
	getInitialState: function() {
		return {
			resultsToSend: this.transformResults(this.props.results), // list of works to send to database
			allResults: this.transformResults(this.props.results), // original list. do not modify after transform
			style: {},
		};
    },
	// TODO
	importWorks() {
		alert('TODO send POST to database' + this.state.resultsToSend.length);
	},
	transformResults(works) {
		var self = this;
		var transformed = [];
		works.map(function(item) { 
			transformed.push(self.transformProperties(item));
        });
        console.log(transformed);
        return transformed;
	},
	transformProperties(work) {
		var journalArticle = {
			title: work.hasOwnProperty('Ti') ? work.Ti : '',
			publication_date: work.hasOwnProperty('D') ? work.D : Date.parse(work.Y),
			contributors: work.hasOwnProperty('AA') ? work.AA.reduce( (prev, curr) => prev + ', ' + toTitleCase(curr.AuN), '' ) : [name],
			journal: work.hasOwnProperty('J') ? work.J.JN : '',
			keywords: work.hasOwnProperty('F') ? [work.F.Fn] : [],
			// abstract: extended.D,
			// volume: extended.V,
			// issue: extended.I,
			// page: extended.FP+'-'extended.LP,
			// url: extended.S[0].U,
			// doi: extended.DOI
		};

		if (work.hasOwnProperty('E')) {
			var extended = JSON.parse(work.E);
			journalArticle['abstract'] = extended.hasOwnProperty('D') ? extended.D : '';
			journalArticle['volume'] = extended.hasOwnProperty('V') ? extended.V : '';
			journalArticle['issue'] = extended.hasOwnProperty('I') ? extended.I : '';
			journalArticle['page'] = (extended.hasOwnProperty('FP') && extended.hasOwnProperty('LP')) ? extended.FP+'-'+extended.LP : '';
			journalArticle['url'] = extended.hasOwnProperty('S') ? extended.S[0].U : '';
			journalArticle['doi'] = extended.hasOwnProperty('DOI') ? extended.DOI : '';
		}
		
		return journalArticle;
	},
	// add or remove works from the list of things to send. allResults keeps permanent list of works, and indexes of WorkItem components match to those in allResults
	addRemoveImport(index, toAdd) {
		console.log(this.state.resultsToSend);
		if (toAdd) {
			console.log('adding', index);
			// this.setState({resultsToSend: this.state.resultsToSend.push(this.state.allResults[index])});
			this.setState({resultsToSend: this.state.resultsToSend.concat(this.state.allResults[index])});
			console.log(this.state.resultsToSend);
		} else {
			console.log('removing', index);
			// this.state.resultsToSend.splice(index, 1);
			this.setState({
				resultsToSend: this.state.resultsToSend.filter((_, i) => i !== index)
			});
			console.log(this.state.resultsToSend);
		}
	},

	render: function() {
		var self = this;
		var results = this.props.results;
		var transFormedResults = [];
		var items = results.map(function(item, index) { // TODO remove?
			transFormedResults.push(self.transformProperties(item));
            return <WorkItem entity={item} key={index} index={index} toggleImport={self.addRemoveImport} />;
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
						{this.props.results.map(function(item, index) { 
						    return <WorkItem entity={item} toggleImport={self.addRemoveImport} index={index} key={index} />
						})}
					</tbody>
				</Table>
				<Button className="btn-success btn-lg" onClick={this.importWorks}>Import highlighted works and continue</Button>
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