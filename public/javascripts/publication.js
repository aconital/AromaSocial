Parse.initialize("development", "Fomsummer2014", "Fomsummer2014");
Parse.serverURL = 'https://52.33.206.191:1337/parse/';
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var ListGroup = ReactBootstrap.ListGroup, ListGroupItem = ReactBootstrap.ListGroupItem;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

// printf-like function
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
String.prototype.capitalize = function() {
    return (this.charAt(0).toUpperCase() + this.slice(1)).replace("_"," ");
}

var Publication = React.createClass ({
    getInitialState: function() {
     return {
        title: title,
        creatorImg: creatorImg,
        description: description,
        filename: filename,
        publicationDate: publication_date,
        publicationCode: publication_code,
        license: license,
        keywords: keywords,
        pub_class: pub_class,
        fields: '',
        abstract: '',
        other_urls: []
        };
    },
    componentWillMount: function() {
        var self = this;
        var fetchPath = "/publication/"+objectId;
        // fields that we don't want to display to the user in the information box
        var staticFields = ['createdAt','updatedAt','user','abstract','file','objectId','updatePath','title','type','other_urls','search'];

        $.ajax({
            url: fetchPath,
            data: {"pub_class": this.state.pub_class},
            success: function(res) {
                var result = res.query,
                    stateAdditions = {},
                    fields = [];

                // set all fields individually
                for (var property in res.query) {
                    if (res.query.hasOwnProperty(property)) {
                        stateAdditions[property] = result[property];

                        if (staticFields.indexOf(property) < 0) {
                            fields.push(property);
                        } else if (property === 'abstract') {
                            this.setState({description: result[property]});
                        } else if (property === 'other_urls') {
                            this.setState({other_urls: result[property]});
                        }
                    }
                }
                stateAdditions['fields'] = fields;
                this.setState(stateAdditions);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't retrieve publication details.");
            }.bind(this)
        });
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    handleChildChange: function(state) {
        this.setState(state);
    },
    submitChange: function() {
        var self = this;
        var dataForm = {pub_class: this.state.pub_class, title: this.state.title, abstract: this.state.abstract.replace(/(\r\n|\n|\r|\\)/gm,'\\n')};

        $.ajax({
            url: this.state.updatePath + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.state.updatePath + "/update", status, err.toString());
            }.bind(this)
        });
    },
    submitChildChange: function(state) {
        var dataForm = state; // only posts the updated field.
        dataForm['pub_class'] = this.state.pub_class;

                console.log(this.state.updatePath);
        $.ajax({
            url: this.state.updatePath + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.state.updatePath + "/update", status, err.toString());
            }.bind(this)
        });

    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteEntry.bind(this),
    render: function() {
        var self = this,
            keys = (this.state.fields) ? this.state.fields.filter( (key) => key !== 'other_users' ) : [], // filter out the other_users relation object
            creator = (this.state.user) ? '/profile/' + this.state.user.username : '',
            avatar = this.state.creatorImg,
            details, // holds dynamically-filled information table
            downloadIcon;

        if (filename || false) {
            downloadIcon = <a href={filename} className="image-link" ><span className="glyphicon glyphicon-download space"></span></a>;
        }

        if (currentUserId == creatorId) {
            details = keys.map(function(name) {
                    return <InfoEditField key={name} name={name} initVal={self.state[name]} handleChange={self.handleChildChange} submitChange={self.submitChildChange} urls={self.state.other_urls} />;
            });
        } else {
            var details = keys.map(function(name) {
                return <InfoField key={name} name={name} initVal={self.state[name]} urls={self.state.other_urls} />;
            });
        }

        return (
        <div className="content-wrap-item-page">
            <div className="content-wrap-item-page-100">
                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" style={{width:'88%'}} onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{title}</h2>}
                    <h2 className="corner">
                        {downloadIcon}
                        {(currentUserId == creatorId) ?  <SettingsModal delete={this.deleteEntry} update={this.submitChange} /> : <span></span>}
                    </h2>
                    <p className="p-noneditable"><strong>Abstract:</strong></p>
                    {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" className="p-editable p-editable-bottom-spacing" type="text" name="abstract" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.abstract}>{this.state.abstract}</textarea></p> : <pre className="p-non-editable-bottom-wrap">{this.state.description}</pre>}
                </div>

                
                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Information</h3>

                    <div className="item-info-div"><table className="item-info-table">
                        <tbody className="inner">
                            {details}
                        </tbody>
                    </table></div>
                </div>
                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Uploaded By</h3>
                    <div className="item-authors-div">
                        <a href={creator} className="nostyle"><img src={avatar} className="contain-panel-small-image"/></a>
                    </div>
                </div>

            </div>
        </div>
        );
    }
});

var InfoEditField = React.createClass({
    getInitialState: function(){
        return {
            name: this.props.name,
            lastVal: this.props.initVal,
            currVal: this.props.initVal,
            isTags: (typeof this.props.initVal !== 'string') ? true : false
        };
    },
    handleChange: function(e){
        if (this.state.isTags) {
            var option = e;
        } else {
            var option = e.target.value;
        }

        this.setState({currVal: option});
        this.props.handleChange({[this.state.name]: option});
    },
    submitChange: function(){ 
        // only submit if there is a change to the value to reduce superfluous call to back-end.
        if (this.state.lastVal != this.state.currVal) {
            this.props.submitChange({[this.state.name]: this.state.currVal});
            this.setState({lastVal: this.state.currVal});
        } else {
            console.log('no changes');
        }
    },
    openUrlsModal: function() {

    },
    render: function() {
        var capitalized = this.props.name.capitalize(),
            editUrlBtn = (this.props.name == 'url' && this.props.urls) ? ( <EditUrlsModal urls={this.props.urls} submitChange={this.props.submitChange} /> ) : '',
            element;

        // set the left-hand side of Information table. Parse obj properties stored as Array need to use ReactTagsInput.
        if (this.state.isTags) {
            var tagsElement = this.props.initVal;
            if (this.props.name = 'contributors') { // TODO: replace workaround. Major issues here with overwriting usernames when saving
                tagsElement = this.props.initVal.map(function(name) {
                    var label = name.replace(/_/g, " ").replace(/(\.\d*)/g, ""),
                        link = '/profile/' + name;
                    return label;
                });
            }

            element = ( <ReactTagsInput className="l-editable-input" type="text" key={this.props.name} name={this.props.name} ref="tags" placeholder="" onChange={this.handleChange} onBlur={this.submitChange} value={tagsElement} /> );
        } else {
            element = ( <input className="p-editable" type="text" key={this.props.name} name={this.props.name} onChange={this.handleChange} onBlur={this.submitChange} value={this.props.initVal} /> );
        }

        return (
            <tr className="no-margin">
                <td className="publication-table-info-left"><label htmlFor="{this.props.name}">{capitalized}: {editUrlBtn}</label></td>
                <td className="publication-table-info-right">
                    {element}
                </td>
            </tr>
        );
    },
});

var InfoField = React.createClass({
    render: function() {
        var capitalized = this.props.name.capitalize(),
            element;

        if (typeof this.props.initVal !== 'string') {
            var self = this,
                tagArray = this.props.initVal;
                link = '#';

            if (this.props.name != 'other_urls') {
                var tagsElement = tagArray.map(function(item, i) { 
                    var label = item;
                    // set links to profiles for contributors
                    if (self.props.name == 'contributors') {
                        var label = item.replace(/_/g, " ").replace(/(\.\d*)/g, "");
                        var link = "/profile/" + item.replace(/ /g, "_"); // fallback for publications w/o username-formatted contributors
                    }
                    return <a href={link} className="tagsinput-tag-link react-tagsinput-tag" key={i}>{label}</a>;
                });
                element = ( tagsElement );
            }
        } else {
            if (this.props.name == 'url') {
                var otherUrls = this.props.urls.length > 0 ? (<ViewUrlsModal urls={this.props.urls}/>) : ''; // show other links if available
                element = ( <span><a href={this.props.initVal} style={{wordBreak: 'break-word'}} target="_blank">{this.props.initVal}</a> {otherUrls}</span> );
            } else {
                element = ( this.props.initVal );
            }
        }

        return (
            <tr>
                <td className="publication-table-info-left">
                    <label htmlFor="{this.props.name}">{capitalized}:</label>
                </td>
                <td className="publication-table-info-right">{element}
                </td>
            </tr>
        );
    },
});

var ViewUrlsModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false };
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },

    render() {
        var urlList = this.props.urls.map( (url, i) => (<ListGroupItem key={i}><a href={url} target="_blank">{url}</a></ListGroupItem>) );

        return (
            <span>
                <a className="space" onClick={this.open}>See more...</a>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Other Links</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>You can also access this publication through any of the links below:</p>
                        <ListGroup style={{wordWrap: 'break-word'}}>
                            {urlList}
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </span>
        );
    }
});

var EditUrlsModal = React.createClass({
    getInitialState() {
        return { 
            showModal: false,
            isDisabled: false,
            updatedUrlList: this.props.urls.slice(0) };
    },
    close() {
        // TODO: clear data?
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    addUrl(urls) {
        urls.push('');
        this.setState({updatedUrlList: urls});
    },
    handleChange(i, urls, e) {
        urls[i] = e.target.value;
        this.setState({updatedUrlList: urls});
    },
    submitChange() {
        var listToSend = [], 
            i = 0, lenOrig = this.props.urls.length,
            j = 0, lenUpdate = this.state.updatedUrlList.length;
        // compare updated list with original. discard empty entries
        while (i < lenOrig && j < lenUpdate) {
            if (this.props.urls[i] === this.state.updatedUrlList[j]) {
                listToSend.push(this.props.urls[i]);
            } else if (this.state.updatedUrlList[j].length > 4) { // arbitrary number to catch impossible entries. TODO: actual validation?
                listToSend.push(this.state.updatedUrlList[j]);
            }
            i++;
            j++;
        }
        while (j < lenUpdate) { // process new entries
            if (this.state.updatedUrlList[j].length > 4) {
                listToSend.push(this.state.updatedUrlList[j]);
            }
            j++;
        }
        this.props.submitChange({other_urls: listToSend}); // POST update
        this.close();
    },

    render() {
        var urls = this.state.updatedUrlList;
        var urlList = (this.state.updatedUrlList).map( (url, i) => (<input className="p-editable" type="text" key={i} name={this.props.name} onChange={this.handleChange.bind(this, i, urls)} value={url} placeholder="Enter an alternative URL..." />) );

        return (
            <span>
                <span className="glyphicon glyphicon-plus-sign" onClick={this.open}></span>

                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Other Links</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>You can edit and add other links for accessing the publication here.</p>
                        <ListGroup>
                            {urlList}
                            <ListGroupItem bsStyle="info" onClick={this.addUrl.bind(this, urls)} style={{textAlign: 'center'}}>Add New Link</ListGroupItem>
                        </ListGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close}>Close</Button><Button className="btn-success" onClick={this.submitChange}>Save</Button>
                    </Modal.Footer>
                </Modal>
            </span>
        );
    }
});

$( document ).ready(function() {
    ReactDOM.render(<Publication
        groups={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
        keywords={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}/>,
        document.getElementById('content'));
});
