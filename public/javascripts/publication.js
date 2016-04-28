Parse.initialize("development", "Fomsummer2014", "Fomsummer2014");
Parse.serverURL = 'http://52.33.206.191:1337/parse/';
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
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
        description: description,
        filename: filename,
        publicationDate: publication_date,
        publicationCode: publication_code,
        license: license,
        keywords: keywords,
        pub_class: pub_class,
        fields: '',
        abstract: ''
        };
    },
    componentWillMount: function() {
        var self = this;
        var fetchPath = "/publication/"+objectId;
        var staticFields = ['createdAt','updatedAt','user','abstract','filename','objectId','updatePath','title', 'type'];

        // var fetchFields = 
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
        // console.log(e.target.name);
        this.setState({[e.target.name]:e.target.value});
    },
    handleChildChange: function(state) {
        // console.log(state);
        this.setState(state);
    },
    submitChange: function() {
        var self = this;
        var dataForm = {pub_class: this.state.pub_class, title: this.state.title, abstract: this.state.abstract};
        
        this.state.fields.forEach(function(element, index, array) {
            if ((element == 'keywords' || element == 'contributors' || element == 'supervisors') && (typeof self.state[element] === 'string')) {
                dataForm[element] = self.state[element].split(/\s*,\s*/g);
            } else {
                dataForm[element] = self.state[element];
            }
        });

        $.ajax({
            url: this.state.updatePath + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            // processData: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.state.updatePath + "/update", status, err.toString());
            }.bind(this)
        });
    },
    submitChildChange: function(state) { // TODO delete
        var dataForm = state;

        $.ajax({
            url: this.state.updatePath + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            // processData: false,
            success: function(data) {
                console.log(data);
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.state.updatePath + "/update", status, err.toString());
            }.bind(this)
        });

    },
    handleTagsInputChange: function(e) { // TODO delete
        var keywordsSubmit = (JSON.stringify(e));
        this.setState({keywords:keywordsSubmit}, function(){ console.log(this.state.keywords); this.submitArrayChange(); }.bind(this));
    },
    submitArrayChange: function() { // TODOdelete
        var dataForm = { keywords: this.state.keywords };

        $.ajax({
            url: this.state.updatePath + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.state.updatePath + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    render: function() {
        var self = this,
            keys = (this.state.fields) ? this.state.fields : [],
            fileExists = this.state.filename || false,
            creator = (this.state.user) ? '/profile/' + this.state.user.username : '',
            avatar = (this.state.user) ? this.state.user.imgUrl : '',
            details;

        if (this.state.filename || false) {
            fileExists = <h2 className="corner"><a href={filename} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a></h2>;
        } else {
            fileExists = <h2 className="corner"></h2>;
        }

        if (currentUserId == creatorId) {
            details = keys.map(function(name) {
                    return <InfoEditField key={name} name={name} initVal={self.state[name]} handleChange={self.handleChildChange} submitChange={self.submitChange} />;
            });
        } else {
            var details = keys.map(function(name) {
                return <InfoField key={name} name={name} initVal={self.state[name]} />;
            });
        }

        return (
        <div className="content-wrap-item-page">
            <div className="content-wrap-item-page-100">
                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{title}</h2>}
                    {fileExists}
                    <p className="p-noneditable"><strong>Abstract:</strong></p>
                    {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" className="p-editable p-editable-bottom-spacing" type="text" name="abstract" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.abstract}>{this.state.abstract}</textarea></p> : <p className="p-non-editable-bottom-wrap">{this.state.abstract}</p>}
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
            currVal: this.props.initVal
        };
    },
    handleChange: function(e){
        var option = {[this.state.name]: e.target.value};
        this.setState({currVal: e.target.value});
        this.props.handleChange(option);
    },
    submitChange: function(){
        if (this.state.lastVal != this.state.currVal) {
            this.props.submitChange({[this.state.name]: this.state.currVal});
            this.setState({lastVal: this.state.currVal});
        } else {
            console.log('no changes');
        }
    },
    render: function() {
        var inliner = {whiteSpace:'nowrap'};
        var capitalized = this.props.name.capitalize();

        return (
            <tr className="no-margin">
                <td className="publication-table-info-left"><label htmlFor="{this.props.name}">{capitalized}:</label></td>
                <td className="publication-table-info-right">
                    <input className="p-editable" type="text" id="{this.props.name}" name="{this.props.name}" onChange={this.handleChange} onBlur={this.submitChange} value={this.props.initVal} /></td>
            </tr>
        );
    },
});

var InfoField = React.createClass({
    render: function() {
        var inliner = {whiteSpace:'nowrap'};
        var capitalized = this.props.name.capitalize();

        return (
            <tr className="p-noneditable">
                <td className="publication-table-info-left">
                    <label htmlFor="{this.props.name}">{capitalized}:</label></td>
                <td className="publication-table-info-right">{this.props.initVal}</td>
            </tr>
        );
    },
});

React.render(<Publication
    groups={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    keywords={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}/>,
    document.getElementById('content'));