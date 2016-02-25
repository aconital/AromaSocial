Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

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

        groupies: groupies
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {title: this.state.title, description: this.state.description, filename: this.state.filename, publication_date: this.state.publicationDate, publication_code: this.state.publicationCode, license: this.state.license};

        $.ajax({
            url: path + "/update",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    handleTagsInputChange: function(e) {
        var keywordsSubmit = (JSON.stringify(e));
        this.setState({keywords:keywordsSubmit}, function(){ console.log(this.state.keywords); this.submitArrayChange(); }.bind(this));
    },
    submitArrayChange: function() {
        var dataForm = { keywords: this.state.keywords };

        $.ajax({
            url: path + "/update",
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
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

        return;
    },
    isUserInGroupies: function() {
        var group = this.state.groupies.split(",");
        for (var i = 0; i < group.length; i++) {
            console.log(group[i]);
            console.log(currentUsername);
            if (currentUsername == group[i]) {
                return true;
            }
        }
        return false;
    },
    render: function() {
        return (
        <div className="content-wrap-pdm">
            <div className="item-bottom-big">
                    <div className="item-panel contain-panel-big">
                    <div>
                        {(currentUserId == creatorId) ? <h2 className="no-margin"><textarea rows="1" className="contain-panel-big-h2 p-editable" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="contain-panel-big-h2 p-noneditable">{title}</h2>}
                        <h2 className="corner">
                            {this.isUserInGroupies() ? <a href={filename} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a>:<h4> Not allowed to download. Sorry </h4>}
                        </h2>
                    </div>
                    <div>
                       {(currentUserId == creatorId) ? <p className="no-margin"><textarea rows="5" className="p-editable" type="text" name="description" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.description}</textarea></p> : <p className="p-noneditable">{description}</p>}
                    </div>
                    <hr/>
                    <table className="publication-table">
                    <tbody>
                       {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="filename" name="filename" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.filename}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><a href={publication_link} className="body-link">{this.state.filename}</a></td></tr>}
                       {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="license">License:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="license" name="license" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.license}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">License:</label></td><td className="publication-table-info-right">{this.state.license}</td></tr>}
                       {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><p className="no-margin"><input type="date" name="publicationDate" id="publicationDate" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.publicationDate} className="p-editable date-editable-input"/></p></td></tr> : <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><span className="no-margin">{this.state.publicationDate}</span></td></tr>}
                       {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", className: "l-editable-input", name: "keywords", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.keywords)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.keywords).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
                    </tbody>
                    </table>
                    </div>
                    <div className="item-panel contain-panel-big">
                    <div>
                        <h4 className="contain-panel-big-h4">Collaborator(s)</h4>
                    </div>
                    <div>
                        <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons"/></a>
                        <a href="/profile/erinbush" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/8/005/0b3/113/19491d0.jpg" className="contain-panel-big-icons"/></a>
                    </div>
                    </div>
            {/*}
                    <div className="item-panel contain-panel-big">
                    <div>
                        <h4 className="contain-panel-big-h4">Discussions</h4>
                    </div>
                    <div>
=======
        <div className="content-wrap-item-page">
            <div className="content-wrap-item-page-100">
                <div className="item-panel">
                    {(currentUserId == creatorId) ? <h2 className="no-margin h2-editable-wrap"><textarea rows="1" className="h2-editable h2-editable-spacing" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.title}</textarea></h2> : <h2 className="no-margin h2-non-editable-wrap">{title}</h2>}
                    <h2 className="corner"><a href={filename} className="image-link" download><span className="glyphicon glyphicon-download space"></span></a></h2>
                    {(currentUserId == creatorId) ? <p className="no-margin p-editable-bottom-wrap"><textarea rows="5" className="p-editable p-editable-bottom-spacing" type="text" name="description" onChange={this.handleChange} onBlur={this.submitChange}>{this.state.description}</textarea></p> : <p className="p-non-editable-bottom-wrap">{description}</p>}
                </div>
                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Information</h3>
                    <div className="item-info-div">
                    <table className="item-info-table">
                        <tbody>
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="filename" name="filename" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.filename}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">File Name:</label></td><td className="publication-table-info-right"><a href={publication_link} className="body-link">{this.state.filename}</a></td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="license">License:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" id="license" name="license" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.license}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="filename">License:</label></td><td className="publication-table-info-right">{this.state.license}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><p className="no-margin"><input type="date" name="publicationDate" id="publicationDate" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.publicationDate} className="p-editable date-editable-input"/></p></td></tr> : <tr><td className="publication-table-info-left"><label for="publicationDate">Publication Date:</label></td><td className="publication-table-info-right"><span className="no-margin">{this.state.publicationDate}</span></td></tr>}
                           {(currentUserId == creatorId) ? <tr className="no-margin"><td className="publication-table-info-left"><label for="publicationCode">Publication Code:</label></td><td className="publication-table-info-right"><input className="p-editable" type="text" name="publicationCode" id="publicationCode" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.publicationCode}/></td></tr> : <tr className="p-noneditable"><td className="publication-table-info-left"><label for="publicationCode">Publication Code:</label></td><td className="publication-table-info-right">{this.state.publicationCode}</td></tr>}
                           {(currentUserId == creatorId) ? <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right"><div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", className: "l-editable-input", name: "keywords", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.keywords)}))}</div></td></tr> : <tr><td className="publication-table-info-left"><label for="keywords">Keywords:</label></td><td className="publication-table-info-right">{JSON.parse(this.state.keywords).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;})}</td></tr>}
>>>>>>> b81605b1266ba3951119942537cf0fff6c60546b

                           <tr className="p-noneditable padding-top-25"><td className="publication-table-info-left"><label for="createdAt">Created At:</label></td><td className="publication-table-info-right">{createdAt}</td></tr>
                           <tr className="p-noneditable"><td className="publication-table-info-left"><label for="updatedAt">Updated At:</label></td><td className="publication-table-info-right">{updatedAt}</td></tr>
                        </tbody>
                    </table>
                    </div>
                </div>
                <div className="item-panel">
                    <h3 className="no-margin h3-item-wrap h3-item-spacing">Author(s)</h3>
                    <div className="item-authors-div">
                        <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-small-image"/></a>
                        <a href="/profile/erinbush" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/8/005/0b3/113/19491d0.jpg" className="contain-panel-small-image"/></a>
                    </div>
                </div>
            </div>

            {/*}
            <div className="item-bottom-3">
                <div className="item-panel contain-panel-above"><h5>Publication Link</h5><br/>
                    <a href={publication_link} className="body-link">Published Here!</a>
                </div>
                <div className="item-panel contain-panel"><h5>Ratings</h5><br/>
                    48 Syncholarity Factor<br/>
                    2000 Times Cited<br/>
                    12000 Profile Views
                </div>
                <div className="item-panel contain-panel"><h5>Who Has Used This</h5><br/>
                    {this.props.groups.map(function(listValue){
                        return <a href="#" className="body-link">{listValue}<br/></a>;
                    })}
                </div>
                <div className="item-panel contain-panel"><h5>License Information</h5><br/>
                    {license}
                </div>
                <div className="item-panel contain-panel"><h5>Keywords</h5><br/>
                    {this.props.keywords.map(function(listValue){
                        return <a href="#" className="body-link">{listValue} </a>;
                    })}
                </div>
                <div className="item-panel contain-panel"><h5>Date Created</h5><br/>
                    {year}
                </div>
                <div className="extend-bottom">&nbsp;</div>
            </div>
            {*/}

        </div>
        );
    }
});


ReactDOM.render(<Publication
    groups={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    keywords={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}/>,
    document.getElementById('content'));