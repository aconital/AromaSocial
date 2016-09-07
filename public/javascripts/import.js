var Button = ReactBootstrap.Button, ListGroup = ReactBootstrap.ListGroup, 
	Table=ReactBootstrap.Table, Panel = ReactBootstrap.Panel;

function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var ImportContent = React.createClass({
    getInitialState() {
     return {
     	status: 'askForAction',
     	name: fullname,
     	results: {},
     	duplicates: {}
        };
    },
	querySciDir(e) {
		e.preventDefault();
		var self = this;
<<<<<<< HEAD

		var nameQuery = this.props.fullname.toLowerCase(); // TODO split etc//'sung kyu lim';
=======
		var nameQuery = this.state.name.toLowerCase(); // TODO split etc//'sung kyu lim';
>>>>>>> signup-steps
		// var nameQuery = 'sung kyu lim';
		this.setState({ createStatus: 'Please wait...',
						status: 'searching'});

		$.ajax({
			url: '/fetchworks?name=' + nameQuery,
			type: "GET",
			timeout: 60000, // 1 minute timeout
		})
		.done(function(data) {
			// var entities = data.data['entities'];
			console.log(data.data);
			self.setState({ results: data.data.new,
							duplicates: data.data.duplicates,
							status: 'showTable' });
		})
		.fail(function(xhr, status, err) {
			// console.error('http://.projectoxford.ai/academic/', status, err, xhr);
			self.setState({ status: 'An error has occured. Please try again later. If you keep running into this error, please file a bug report with the following information: Status Code ' + xhr.status + ', ' + xhr.statusText});
		});
	},
	redirect(e) {
		window.location = '../';
	},
	setStatus(newStatus) {
		this.setState({ status: newStatus });
	},

	render() {
		var content;
		if (this.props.signup) {
			switch (this.state.status) {
				case 'askForAction':
					content = <div><Button className="active-button" onClick={this.querySciDir}>Yes, import my publications</Button> <Button className="passive-button" onClick={this.props.next}>No, skip to next step</Button></div>;
					break;
				case 'searching':
					content = <div><img className="loading-bar" src="../images/loadingbar.gif"/>Searching...</div>;
					break;
				case 'showTable':
					if (this.state.results.length > 0 || this.state.duplicates.length > 0 ) {
						content = <WorksList results={this.state.results} dupes={this.state.duplicates} setStatus={this.setStatus} redirect={this.props.next} signup={this.props.signup} />;
					} else {
						content = (<div>
							<p>No results found!</p>
							<Button onClick={this.props.next}>Next</Button>
							</div>);
					}
					break;
				default:
					content = (<div>
						<p>{this.state.status}</p>
						<Button onClick={this.props.next}>Next</Button>
						</div>)
			}
		}
		else { // TODO make switch statement
			if (this.state.status == 'askForAction') {
				content = <div><ImportButtons querySciDir={this.querySciDir} redirect={this.redirect} /></div>
			} else if (this.state.status == 'searching') {
				content = <div><img className="loading-bar" src="../images/loadingbar.gif"/>Searching...</div>
			} else if (this.state.status == 'showTable') {
				if (this.state.results.length > 0 || this.state.duplicates.length > 0 ) {
					content = <WorksList results={this.state.results} dupes={this.state.duplicates} setStatus={this.setStatus} redirect={this.redirect} />
				} else {
					content = (<div>
						<p>No results found!</p>
						<Button className="btn-secondary btn-lg space" onClick={this.redirect}>Proceed to Syncholar</Button>
						</div>)
				}
			} else {
				content = (<div>
					<p>{this.state.status}</p>
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
}); // end ImportContent

var ImportButtons = React.createClass({
    querySciDir(e) {
        this.props.querySciDir(e);
    },

	render() {
		return (
			<div id="">
				<Button className="btn-success btn-lg" onClick={this.querySciDir}>Yes, import my publications</Button>
				<Button className="btn-secondary btn-lg space" onClick={this.props.redirect}>No, proceed to Syncholar</Button>
			</div>
		);
	}
});

var WorkItem = React.createClass({
	getInitialState() {
		return {
			isImported: true,
			glyphCellClasses: 'glyphicon glyphicon-ok imported',
		};
    },

    // controls highlighting of items to import and fires related events
	toggleCheck(e) {
		if (this.state.isImported) {
			this.setState({
				isImported: false,
				glyphCellClasses: 'glyphicon glyphicon-remove'
			});
			this.toggleImport(false);
		} else if (!this.state.isImported) {
			this.setState({
				isImported: true,
				glyphCellClasses: 'glyphicon glyphicon-ok imported'
			});
			this.toggleImport(true);
		}
	},

	// tells WorksList to add or remove item at current index
	toggleImport(toAdd) {
		// console.log('passingUp', this.props.index, toAdd);
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
			resultsToSend: Array.apply(null, Array(this.props.results.length)).map( (item, i) => item = i ), // indexes of works to send to database
			allResults: this.transformResults(this.props.results), // original list. do not modify after transform
			duplicates: this.transformResults(this.props.dupes),
			style: {},
		};
    },
	setStatus(status) {
		this.props.setStatus(status);
	},

	// send request for highlighted works to be imported
	importWorks() {
		if (this.state.resultsToSend.length > 0) {
			var self = this;
			var works = [];
			for (index of this.state.resultsToSend) {
				works.push(this.state.allResults[index]);
			}
			$.ajax({
				url: '/import',
				type: 'POST',
				dataType: 'json',
	            contentType: "application/json; charset=utf-8",
	            data: JSON.stringify(works),
			})
			.done(function(data) {
				self.setStatus('Import done!');
			})
			.fail(function(xhr, status, err) {
				self.setStatus('Import failed.');
			});
		} else {
			this.props.redirect();
		}
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
		if (work.hasOwnProperty('C')) {
			var publication = { 
				type: 'conference', 
				conference: work.hasOwnProperty('C') ? toTitleCase(work.C.CN) : ''
			};
		} else if (work.hasOwnProperty('J')) {
			var publication = { 
				type: 'journal',
				journal: work.hasOwnProperty('J') ? toTitleCase(work.J.JN) : ''
			};
		} else {
			var publication = { type: 'unknown'};
		}
		publication['title'] = work.hasOwnProperty('Ti') ? toTitleCase(work.Ti) : '';
		publication['publication_date'] = work.hasOwnProperty('D') ? work.D : Date.parse(work.Y);
		publication['contributors'] = work.hasOwnProperty('AA') ? work.AA.map( (a) => toTitleCase(a.AuN) ): [fullname];
		publication['keywords'] = work.hasOwnProperty('F') ? work.F.map( (k) => toTitleCase(k.FN) ) : [];

		if (work.hasOwnProperty('E')) {
			var extended = JSON.parse(work.E);
			publication['abstract'] = extended.hasOwnProperty('D') ? extended.D : '';
			publication['url'] = extended.hasOwnProperty('S') ? extended.S[0].U : '';
			publication['doi'] = extended.hasOwnProperty('DOI') ? extended.DOI : '';
			publication['volume'] = extended.hasOwnProperty('V') ? extended.V.toString() : '';
			publication['issue'] = extended.hasOwnProperty('I') ? extended.I.toString() : '';
			publication['page'] = (extended.hasOwnProperty('FP') && extended.hasOwnProperty('LP')) ? extended.FP+'-'+extended.LP : '';
			publication['other_urls'] = extended.hasOwnProperty('S') ? extended.S.slice(1).map( (src) => src.U ) : [];
			if (extended.hasOwnProperty('VFN')) { // if VFN exists, update current name of publisher
				publication[publication.type] = extended.VFN;
			}
		}
		console.log(publication);
		return publication;
	},

	// adds or removes indexes from the list of works to send. allResults keeps permanent list of works,
	// and indexes of WorkItem components passed up match to those in allResults
	addRemoveImport(index, toAdd) {
		if (toAdd === true) {
			// console.log('adding', index);
			this.setState({
				resultsToSend: this.state.resultsToSend.concat([index])
			});
		} else {
			// console.log('removing', index);
			this.setState({
				resultsToSend: this.state.resultsToSend.filter((i) => i !== index)
			});
		}
	},

	render() {
		var self = this;
		var showNew, continueLabel, buttons;
		var transFormedResults = [];
		if (this.props.results.length > 0) {
			showNew = {};
			continueLabel = 'Import highlighted publications and continue';
		} else {
			showNew = {display: 'none'};
			continueLabel = 'Continue';
		}
		if (this.props.signup) {
			buttons = (<div><Button className="btn-secondary space" onClick={this.props.redirect}>Cancel</Button>
				<Button className="btn-success" onClick={this.importWorks}>{continueLabel}</Button></div>);
		} else {
			buttons = (<div><Button className="btn-success btn-lg" onClick={this.importWorks}>{continueLabel}</Button>
				<Button className="btn-secondary btn-lg space" onClick={this.props.redirect}>Cancel</Button></div>);
		}

		return (
			<div style={{width: '90%'}} className="center-block">
				<div style={showNew} ><h4>Please deselect the ones that don't belong to you or you don't want to import. Details of entries can be edited later on.</h4>
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
				</Table></div>
				{this.props.dupes.length > 0 ? <DuplicatesList dupes={this.state.duplicates} /> : <span></span>}
				{buttons}
			</div>
		);
	}
}); // end WorksList

var DuplicateItem = React.createClass({
	getInitialState() {
		return {
			isImported: true,
		};
    },

	render() {
		var entity = this.props.entity; // TODO change props.entity to transformed version
		var allAuthors = entity.contributors.join(", ");
		var importFeedback = this.state.isImported ? { backgroundColor: '#bbefbb' } : { backgroundColor: 'white'};
		var glyphCellClasses = this.state.glyphCellClasses;

		return (
			<tr>
				<td className="import-works-details">
					<div><strong>Title:</strong> {entity.title}</div>
					<div><strong>Authors:</strong> {allAuthors}</div>
				</td>
			</tr>
		)
	}
});

var DuplicatesList = React.createClass({
	render() {
		return (
			<div>
				<Panel header="We found some publications that have already been uploaded to Syncholar." bsStyle="info">
					<p>These duplicate publications won't be imported, but other scholars will be able to find you through the existing publication page.</p>
				
					<Table id="dupes-works-list" fill striped>
						<tbody>
							{this.props.dupes.map(function(item, index) { 
							    return <DuplicateItem entity={item} index={index} key={index} />
							})}
						</tbody>
					</Table>
				</Panel>
			</div>
		);
	}
});


<<<<<<< HEAD
// $( document ).ready(function() {
// 	ReactDOM.render(<ImportContent />, document.getElementById('content'));
// });
=======
// if (standalone) {
// 	$( document ).ready(function() {
// 			ReactDOM.render(<ImportContent />, document.getElementById('import-content'));

// 	});
// }
>>>>>>> signup-steps
