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

		var nameQuery = this.state.name.toLowerCase() || 'saeed ghafghazi'; // TODO split etc
		this.setState({ createStatus: 'Please wait...',
						status: 'searching'});

		$.ajax({
			url: '/fetchworks?name=' + nameQuery,
			type: "GET",
		})
		.done(function(data) {
			console.log(data);
			var entities = data.data['entities'];
			// console.log(JSON.stringify(entities,null,4));
			self.setState({ results: data.data,
							status: 'showTable' });
		})
		.fail(function(xhr, status, err) {
			console.error('http://.projectoxford.ai/academic/', status, err, xhr);
		});
	},
	redirect: function(e) {
		alert("you shall not pass! not yet anyway lemme finish some stuff first");
	},

	render: function() {
		var content;
		if (this.state.status == 'askForAction') {
			content = <div><ImportButtons querySciDir={this.querySciDir} redirect={this.redirect} /></div>
		} else if (this.state.status == 'searching') {
			console.log('henshin!');
			content = <div>Searching...</div>
		} else if (this.state.status == 'showTable') {
			if (this.state.results.length > 0) {
				console.log('change again');
				content = <WorksList results={this.state.results} />
			} else {
				content = (<div>
					<p>No results found!</p>
					<Button className="btn-secondary btn-lg space" onClick={this.redirect}>Proceed to Syncholar</Button>
					</div>)
			}
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
	getInitialState: function() {
		return {
			isImported: true,
			glyphCellClasses: 'glyphicon glyphicon-ok imported',
		};
    },
    // controls highlighting of items to import and fires related events
	toggleCheck(e) { // TODO toggle on tr click, not span click
		if (this.state.isImported) {
			this.setState({
				isImported: false,
				glyphCellClasses: 'glyphicon glyphicon-remove'
			});
			this.toggleImport(true);
		} else if (!this.state.isImported) {
			this.setState({
				isImported: true,
				glyphCellClasses: 'glyphicon glyphicon-ok imported'
			});
			this.toggleImport(false);
		}

		// if ($(e.target).hasClass("glyphicon-remove")) {
		// 	this.setState({isImported: true});
		// 	$(e.target).removeClass("glyphicon-remove").addClass("glyphicon-ok imported");
		// 	this.toggleImport(true);
		// } else if ($(e.target).hasClass("glyphicon-ok")) {
		// 	this.setState({isImported: false});
		// 	$(e.target).removeClass("glyphicon-ok imported").addClass("glyphicon-remove");
		// 	this.toggleImport(false);
		// }
	},
	// tells WorksList to add or remove item at current index
	toggleImport(toAdd) {
		console.log('passingUp', this.props.index, toAdd);
		this.props.toggleImport(this.props.index, toAdd);
	},

	render() {
		var entity = this.props.entity; // TODO change props.entity to transformed version
		var extended = JSON.parse(entity.E);
		var allAuthors = entity.AA.map( (a) => toTitleCase(a.AuN) ).join(", ");
		var importFeedback = this.state.isImported ? { backgroundColor: '#bbefbb' } : { backgroundColor: 'white'};
		var glyphCellClasses = this.state.glyphCellClasses;

		return (
			<tr style={importFeedback} onClick={this.toggleCheck}>
				<td className="import-works-checkbox"><span className={this.state.glyphCellClasses}></span></td>
				<td className="import-works-details">
					<div><strong>Title:</strong> {extended.DN}</div>
					<div><strong>Authors:</strong> {allAuthors}</div>
					<div><strong>Publication Year:</strong> {entity.Y}</div>
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

		$.ajax({
			url: '/import',
			type: 'POST',
			dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(this.state.resultsToSend),
		})
		.done(function(data) {
			console.log(data);
			self.setState({ results: data.data,
							status: 'showTable' });
		})
		.fail(function(xhr, status, err) {
			console.error('Failed to get result', status, err, xhr);
		});
	},
	transformResults(works) {
		var self = this;
		var transformed = [];
		works.map(function(item) { 
			transformed.push(self.transformProperties(item));
        });
        return transformed; // TODO convert to set?
	},
	transformProperties(work) { // TODO support for conferences, books, others if possible
		var journalArticle = {
			type: 'journal',
			title: work.hasOwnProperty('Ti') ? toTitleCase(work.Ti) : '',
			publication_date: work.hasOwnProperty('D') ? work.D : Date.parse(work.Y),
			contributors: work.hasOwnProperty('AA') ? work.AA.map( (a) => toTitleCase(a.AuN) ): [name],
			journal: work.hasOwnProperty('J') ? toTitleCase(work.J.JN) : '',
			keywords: work.hasOwnProperty('F') ? work.F.map( (k) => toTitleCase(k.FN) ) : [],
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
	// adds or removes works from the list of things to send. allResults keeps permanent list of works,
	// and indexes of WorkItem components passed up match to those in allResults
	addRemoveImport(index, toAdd) {
		if (toAdd) {
			console.log('adding', index);
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
		// var items = results.map(function(item, index) { // TODO remove?
		// 	transFormedResults.push(self.transformProperties(item));
  //           return <WorkItem entity={item} key={index} index={index} toggleImport={self.addRemoveImport} />;
  //       });

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
		var requiredField = {color: 'red', fontWeight: '800'};
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