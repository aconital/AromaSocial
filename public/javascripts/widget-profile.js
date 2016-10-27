var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var Tooltip = ReactBootstrap.Tooltip;
var Carousel = ReactBootstrap.Carousel;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var TabPane = ReactBootstrap.TabPane;

// require('autocomplete.js').UserAutocomplete();
String.prototype.capitalize = function() {
    return (this.charAt(0).toUpperCase() + this.slice(1)).replace("_"," ");
}

/* TEST REACT TAGS */
const tooltip = (
    <Tooltip className="tooltip">Add an Entry</Tooltip>
);
var ReactTags = ReactTags.WithContext;

var CustomTags = React.createClass({
    getInitialState: function() {
        var resultArr = [];
        var nameToIds = {};
        var users = [];
        $.ajax({
            url: '/allusers',
            dataType: 'JSON',
            cache: false,
            success: function(data) {
                $.map(data, function(item){
                    resultArr.push(item.fullname)
                    nameToIds[item.username] = {
                        fullname: item.fullname,
                        used: false
                    };
                    var val = item.fullname + " (" + item.username + ")";
                    users.push(val);
                })
            },
            error: function(xhr) {
                console.error(xhr.status);
            }
        });

        return {
            tags: [],
            ids: [],
            suggestions: users,
            placeholder: "Add new collaborator...",
            idMap: nameToIds
        }
    },
    addTag: function(tag) {
        // var tags = this.state.tags;
        // for(var i = 0; i < tags.length; i++) {
        //     if (tags[i].text == tag) {
        //         return true;
        //     }
        // }
        // return false;
        var m = this.state.idMap;
        var tags = this.state.tags;
        var ids = this.state.ids;
        var result;
        for (var i in m) {
            if (m[i].fullname === tag && m[i].used === false) {
                m[i].used = true;
                tags.push({
                    id: tags.length + 1,
                    text: tag
                });
                this.setState({tags: tags});
                ids.push(i);
                this.setState({ids: ids});
                return;
            }
        }
        for (var i in m) {
            if (m[i].fullname === tag && m[i].used === true) {
                console.log("Duplicate. Don't add");
                return;
            }
        }
        tags.push({
            id: tags.length + 1,
            text: tag
        });
        this.setState({tags: tags});

        ids.push(tag);
        this.setState({ids: ids});
        console.log("user not in system. Just adding tag");
    },
    handleDelete: function(i) {
        var tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    },
    handleAddition: function(tag) {
        var tags = this.state.tags;
        this.addTag(tag);
        this.props.changeFunc(this.props.name, this.state.ids);
    },
    handleDrag: function(tag, currPos, newPos) {
        var tags = this.state.tags;

        // mutate array
        tags.splice(currPos, 1);
        tags.splice(newPos, 0, tag);

        // re-render
        this.setState({ tags: tags });
    },
    render: function() {
        var tags = this.state.tags;
        var suggestions = this.state.suggestions;
        return (
            <div>
                <ReactTags tags={tags}
                           suggestions={suggestions}
                           handleDelete={this.handleDelete}
                           handleAddition={this.handleAddition}
                           placeholder={this.props.placeholder}
                           handleDrag={this.handleDrag} />
            </div>
        )
    }
});

/* TEST REACT TAGS END */


var Profile = React.createClass ({
    getInitialState: function() {
        return { showModal: false,
            username: [username],
            profile_imgURL: [profile_imgURL],
            imgSubmitText:'Upload',
            imgSubmitDisabled:false,
            about: [about],
            fromModelTab: false,
            pictureChosen: null,
            picture: null, pictureType: '', status: ''
        };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ imgSubmitText: "Upload" });
        this.setState({ imgSubmitDisabled: false });
        this.setState({ showModal: false});
    },
    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },

    render: function() {
        return (
            <div>

                <div className="content-wrap">
                    <div className="item-bottom">
                        <div className="item-row1">
                        </div>
                        <div className="item-row1">
                            <div className="item-bottom-1">
                                <img src={this.state.profile_imgURL} className="contain-image" />
                            </div>
                            <div id="item-bottom-2-profile" className="item-bottom-2">
                                <h3 className="no-margin-padding align-left h1-title">{fullname}</h3>
                               <h4 className="no-margin-padding align-left h3-title">{about}</h4>
                            </div>
                        </div>
                    </div>
                    <div className="item-bottom-3">
                        <ProfileMenu tabs={['About','Colleagues','Affiliations', 'Projects', 'Publications', 'Figures & Data', 'Software & Code']} />
                    </div>

                </div>
            </div>
        );
    }
});

var ProfileMenu = React.createClass ({
    getInitialState: function() {
        return { focused: 0 };
    },
    clicked: function(index) {
        this.setState({ focused: index });
    },
    render: function() {
        var self = this;
        var tabMap = {0: <About tab={this.clicked}/>,
            1: <Connections />,
            2: <Organizations />,
            3: <Projects objectId={objectId}/>,
            4: <Publications objectId={objectId}/>,
            5: <Data objectId={objectId}/>,
            6: <Models objectId={objectId}/>
            // 6: <More />
        };
        return (
            <div>
                <div id="tabs">
                    <ul id="content-nav">
                        {this.props.tabs.map(function(tab,index){
                            var style = "";
                            if (self.state.focused == index) {
                                style = "selected-tab";
                            }
                            return <li key={index} id={style}>
                                <a href="#" onClick={self.clicked.bind(self, index)} id={style}>{tab}</a>
                            </li>;
                        })}
                    </ul>
                </div>
                <div id="content" className="content">
                    {tabMap.hasOwnProperty(self.state.focused) ? tabMap[self.state.focused] : ""}
                </div>
            </div>
        );
    }
});

var Connections = React.createClass({
    getInitialState: function() {
        return { data: [], noRecordsMessage: <LoadingGif /> };
    },
    componentDidMount : function(){
        var peopleUrl= "/profile/"+objectId+"/connections";

        $.ajax({
            url: peopleUrl,
            success: function(data) {
                this.setState({data: data, noRecordsMessage: ''});
                if (data.length < 1 || Object.keys(data).length === 0) {
                    this.setState({noRecordsMessage: (<div style={{textAlign: 'center'}}>No connections exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
    },
    inviteTrigger: function(e) {
        e.stopPropagation();
        invite(e.nativeEvent);
    },
    render: function() {
        var peopleList = $.map(this.state.data,function(objects) {
            var role= objects[0].title;
            var plist=[];
            for(var i in objects)
            {
                var person = objects[i];
                plist.push(person);
            }

            return (
                <div id="item-list">
                    {plist.map(person =>
                            <div className="item-box" key={person.username} id="item-list">
                                <div className="item-box-left">
                                    <div className="item-box-image-outside">
                                        <a target="_blank" href={'/profile/'+person.username}><img src={person.userImgUrl} className="item-box-image" /></a>
                                    </div>
                                </div>
                                <div className="item-box-right">
                                    <a target="_blank" href={'/profile/'+person.username} className="body-link"><h4 className="margin-top-bottom-5">{person.fullname}</h4></a>
                                    <p>{person.about}</p>
                                </div>
                            </div>
                    )}
                </div>
            );
        });
        return (
            <div>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tr>
                        </tr>
                    </table>
                </div>
                {peopleList}
                {this.state.noRecordsMessage}
            </div>
        )
    }
});

var Organizations = React.createClass({
    getInitialState: function() {
        return {orgs: [],myOrgs:[],isMe:false, noRecordsMessage: <LoadingGif /> };
    },
    componentDidMount : function(){

        var orgUrl= "/share/profile/"+objectId+"/organizations";

        $.ajax({
            url: orgUrl,
            success: function(data) {
                this.setState({orgs: data.orgs,
                    myOrgs:data.myOrgs,
                    isMe:data.isMe,
                    noRecordsMessage: ''});
                if (data.orgs.length < 1) {
                    this.setState({noRecordsMessage: (<div style={{textAlign: 'center'}}>No connections exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve orgs");
            }.bind(this)
        });
    },
    clickJoin:function(org){
        var connectURL= "/organization/"+org.orgId+"/join";
        $.ajax({
            url: connectURL,
            success: function(status) {
                var myOrg = {id:org.orgId,verified:false};
                var myOrgs =this.state.myOrgs;
                myOrgs.push(myOrg);
                this.setState({myOrgs: myOrgs});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't request join org.");
            }.bind(this)
        });
    },
    isInOrg:function(orgId)
    {  var orgs =this.state.myOrgs;
        for (var o in orgs )
        {
            if(orgs[o].id === orgId) {

                return orgs[o];
            }
        }
        return null;
    },
    render: function() {

        var orgList = $.map(this.state.orgs,function(org) {

            var join;
            var matchingOrg= this.isInOrg(org.orgId);

            return (
                <div className="item-box" key={org.orgId} id="item-list">
                    <div className="item-box-left">
                        <div className="item-box-image-outside">
                            <a target="_blank" href={'/organization/'+org.name}><img src={org.orgImgUrl} className="item-box-image" /></a>
                        </div>
                    </div>
                    <div className="item-box-right">
                        <a target="_blank" href={'/organization/'+org.name} className="body-link"><h4 className="margin-top-bottom-5">{org.displayName}</h4></a>
                        <span className="font-15">{org.location}</span>
                        {join}
                    </div>
                </div>
            );
        }.bind(this));
        return (
            <div>
                {orgList}
                {this.state.noRecordsMessage}
            </div>
        )
    }
});

var About = React.createClass({
    getInitialState: function() {
        var hideInterests;
        if(JSON.parse(interests).length > 0) { hideInterests = "show"; } else { hideInterests = "hide"; }
        if(JSON.parse(workExperience).length > 0) { hideWorkExperiences = "show"; } else { hideWorkExperiences = "hide"; }
        if(JSON.parse(educations).length > 0) { hideEducations = "show"; } else { hideEducations = "hide"; }
        return {
            summary: summary,
            workExperience: workExperience,
            educations: educations,
            interests: interests,
            interestsTag: interestsTag,
            projects: "",
            publications: "",
            datas: "",
            models: "",

            hideInterests: hideInterests,
            hideEducations: hideEducations,
            hideWorkExperiences: hideWorkExperiences
        };
    },
    submitSummary: function() {
        var dataForm = {summary: this.state.summary.replace(/(\r\n|\n|\r|\\)/gm,'\\n')};
        $.ajax({
            url: path + "/updateSummary",
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
    tabChange: function(index) {
        this.props.tab(index);
    },
    render: function() {
        self = this;
        var workExperience_data = [];
        var educations_data = [];
        var projects_data = [];
        var interests_data = [];
        var publications_data = [];
        var datas_data = [];
        var models_data = [];
        if (this.state.workExperience != "") {
            var WEItems = JSON.parse(this.state.workExperience);
            WEItems.forEach(function(item, i) {
                workExperience_data.push(<AboutTabObject identifier={i} updateChanges={self.updateChildChanges} field={item.field} title={item.title} major={item.major} company={item.company} description={item.description} start={item.start} end={item.end} type="workExperience" />);
            });
        }
        if (this.state.educations != "") {
            var EItems = JSON.parse(this.state.educations);
            EItems.forEach(function(item, i) {
                educations_data.push(<AboutTabObject identifier={i} updateChanges={self.updateChildChanges} field={item.field} title={item.title} major={item.major} company={item.company} description={item.description} start={item.start} end={item.end} type="education" />);
            });
        }
        if (this.state.interests != "") {
            JSON.parse(this.state.interests).map(function(item, i) {
                interests_data.push (<div className="about-item-hr">
                     <p className="r-noneditable no-margin">{item}</p>

                </div>);
            }, this);
        }
        return (
            <div id="resume">
                <div id="resume-summary">

                    <div id="resume-summary-item">
                        <div className="resume-item">
                         <pre className="p-noneditable">{this.state.summary}</pre>
                        </div>
                    </div>
                </div>
                <div id="resume-expertise-and-interests" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" >Interests</h3>
                    </div>

                    <div className={"div-relative resume-item " + this.state.hideInterests}>{interests_data}</div>
                    <div className="margin-top-20">{JSON.parse(this.state.interestsTag).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>; })}</div>
                </div>
                <div className="clear"></div>
                <div id="resume-education" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" >Education</h3>
                    </div>
                    <div className={"resume-item div-relative " + this.state.hideEducations}>{educations_data}</div>
                </div>
                <div id="resume-experience" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" >Work Experience</h3>
                    </div>
                    <div className={"resume-item div-relative " + this.state.hideWorkExperiences}>{workExperience_data}</div>
                </div>

            </div>
        )
    }
});
var AboutTabObject = React.createClass({
    getInitialState: function() {
        return {
            key: this.props.identifier,
            field: this.props.field,
            title: this.props.title,
            major: this.props.major,
            company: this.props.company,
            description: this.props.description,
            start: this.props.start,
            end: this.props.end,
            data: this.props.data,
            type: this.props.type,
            action: "",
            display: "show"
        };
    },
    render: function() {
        var startDate = this.props.start.replace(/-/g,'/');
        if(startDate!="")
            startDate= moment(startDate).format("MMM YYYY");
        var endDate = this.props.end.replace(/-/g,'/');
        if(endDate!= "")
            endDate= moment(endDate).format("MMM YYYY");
        if (this.state.display=="");
        if (this.state.field=="work") { //if work field, use work placeholders
            return (
                <div className={"about-item-hr relative " + this.state.display} >

                    <h5 className="h4-resume-item display-inline-block">
                        <b><span  className="no-margin">{this.state.company}</span></b>
                        <span className="no-margin workeducationDate">
                             <b>{startDate} - </b>
                             <b>{endDate}</b>
                         </span>
                    </h5>

                    <p className="no-margin">
                        <span>{this.state.title}</span>
                    </p>
                    <p className="no-margin">{this.state.description}</p>

                </div>
            )
        } else{ //if field is education, use education placeholders
            return (
                <div className={"about-item-hr relative " + this.state.display} >

                    <h5 className="h4-resume-item display-inline-block ">
                        <b><span  className="no-margin">{this.state.company}</span></b>
                     <span className="no-margin workeducationDate">
                             <b>{startDate} - </b>
                             <b>{endDate}</b>
                         </span>
                    </h5>

                    <p className="no-margin">
                        <span>{this.state.title}</span>
                        <span>, &nbsp;{this.state.major}</span>
                    </p>
                   <p className="no-margin">{this.state.description}</p>

                </div>
            )
        }
    }
});

var More = React.createClass({
    render: function() {
        return (
            <div id="friends-list">
                <div className="list-item"><a href="#" className="nostyle"><img src="/images/user.png" className="contain-icons"/><h4 className="no-margin">Persons Name</h4></a><span>Persons Title</span> @ <span>Persons Location</span></div>
                <div className="list-item"><a href="#" className="nostyle"><img src="/images/user.png" className="contain-icons"/><h4 className="no-margin">Persons Name</h4></a><span>Persons Title</span> @ <span>Persons Location</span></div>
                <div className="list-item"><a href="#" className="nostyle"><img src="/images/user.png" className="contain-icons"/><h4 className="no-margin">Persons Name</h4></a><span>Persons Title</span> @ <span>Persons Location</span></div>
                <div className="list-item"><a href="#" className="nostyle"><img src="/images/user.png" className="contain-icons"/><h4 className="no-margin">Persons Name</h4></a><span>Persons Title</span> @ <span>Persons Location</span></div>
            </div>
        )
    }
});

var Projects = React.createClass({
    getInitialState: function() {
        return { data: [], noRecordsMessage: <LoadingGif />, showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ imgSubmitText: "Upload" });
        this.setState({ imgSubmitDisabled: false });
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var projectsURL= "/profile/"+objectId+"/projects_list";

        $.ajax({
            type: 'GET',
            url: projectsURL,
            success: function(data) {
                if (data.length > 0 || Object.keys(data).length > 0) {
                    this.setState({data: data, noRecordsMessage: ''});
                }
                else {
                    this.setState({data: data, noRecordsMessage: (<div style={{textAlign: 'center'}}>No records exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Projects!");
            }.bind(this)
        });
    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteListEntry.bind(this),
    render: function() {
        var itemsList = $.map(this.state.data,function(item) {
            item.start_date = (new Date(item.start_date)).toUTCString().slice(8,-12);

            return (
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a target="_blank" href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a target="_blank" href={'/project/'+item.objectId} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
                            <table className="item-box-right-tags">
                                <tr><td>Collaborators: </td><td>{item.collaborators.map(function(collaborators) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{collaborators}</a>;})}</td></tr>
                                <tr><td>Date: </td><td>{item.start_date} to {item.end_date}</td></tr>
                                {/*}  <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>New Project</Modal.Title>
                    </Modal.Header>
                    <ProjectAddForm submitSuccess={this.clickClose} />
                </Modal>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tr>
                            {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                        </tr>
                    </table>
                </div>
                {itemsList}
                {this.state.noRecordsMessage}
            </div>
        )
    }
});


var Publications = React.createClass({
    getInitialState: function() {
        return { data: [], noRecordsMessage: <LoadingGif />, showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var publicationsURL= "/profile/"+username+"/publications";

        $.ajax({
            type: 'GET',
            url: publicationsURL,
            success: function(data) {
                if (data.length > 0 || Object.keys(data).length > 0) {
                    this.setState({data: data, noRecordsMessage: ''});
                }
                else {
                    this.setState({data: data, noRecordsMessage: (<div style={{textAlign: 'center'}}>No records exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Publications!");
            }.bind(this)
        });
    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteListEntry.bind(this),
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type.capitalize();
            var typeList = [];
            // var label = items.replace(/_/g, " ").replace(/(\.\d*)/g, "");
            // var link = "/profile/" + items;
            for (var i in items) {
                var item = items[i];
                item.date = (new Date(item.date)).toUTCString().slice(8,-12);
                typeList.push(item);
            }
            return (
                <div>
                    <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                    {typeList.map(item =>
                            <div className="about-item-hr ">
                                <div key={item.id}>
                                    <a target="_blank" href={'/publication/'+item.type+'/'+item.id} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
                        <span className="font-15">
                        <table className="item-box-table-info">
                            <table className="item-box-table-info">
                                <tr><td>Authors: </td><td>{item.contributors.map(function(contributor) {
                                    console.log(contributor);
                                    if (contributor !== null && typeof contributor === 'object') {
                                        return <a target="_blank" href={contributor.link} className="tagsinput-tag-link react-tagsinput-tag">{contributor.label}</a>;
                                    } else {
                                        return <a target="_blank" href={getLinkFromCollaborator(contributor)} className="tagsinput-tag-link react-tagsinput-tag">{getNameFromCollaborator(contributor)}</a>;
                                    }
                                })}</td></tr>
                                {(item.type == "journal")? <tr><td>Publication Date: </td><td> {item.date} </td></tr> : <tr><td>Published in: </td><td>{item.date}</td></tr> }
                                {/*<tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                        </table>
                        </span>
                                </div>
                            </div>
                    )} <div className="clear"></div>
                </div>
            );
        });

        return (
            <div>
                <ResourceForm publication={true} />
                {itemsList}
                {this.state.noRecordsMessage}
            </div>
        )
    }
});

var Publication = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
            <div className="publication-box">
                <div className="publication-box-left publication-box-left-full">
                    <h3 className="margin-top-bottom-5"><a target="_blank" href={"/publication/" + this.props.objectId} className="body-link"> {title}</a></h3>
                    <span className="font-15">
                    <b>Authors:</b> <a href="#" className="body-link">{this.props.author}</a><br/>
                    <b>Abstract:</b> {this.props.description.substr(0,120)}... <a target="_blank" href={"/publication/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                        {this.props.publication_code}
                    </span>
                </div>
                {/*
                 <div className="publication-box-right">
                 <h5>Information</h5><br/>
                 ## Syncholar Factor<br/>
                 ## Times Cited<br/>
                 ## Views<br/>
                 ## Impact Factor
                 </div>
                 */}
            </div>
        )
    }
});

var Models = React.createClass({
    getInitialState: function() {
        return { data: [], noRecordsMessage: <LoadingGif />, showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var modelsURL= "/profile/"+objectId+"/models_list";

        $.ajax({
            type: 'GET',
            url: modelsURL,
            success: function(data) {
                if (data.length > 0 || Object.keys(data).length > 0) {
                    this.setState({data: data, noRecordsMessage: ''});
                }
                else {
                    this.setState({data: data, noRecordsMessage: (<div style={{textAlign: 'center'}}>No records exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Models!");
            }.bind(this)
        });
    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteListEntry.bind(this),
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type;
            var typeList = [];
            for (var i in items) {
                var item = items[i];
                item.start_date = (new Date(item.start_date)).toUTCString().slice(8,-12);
                typeList.push(item);
            }
            return (
                <div>
                    <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                    {typeList.map(item =>
                            <div className="about-item-hr">
                                <div key={item.objectId}>
                                    <div className="item-box-left">
                                        <div className="item-box-image-outside">
                                            <a target="_blank" href={'/model/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                                        </div>
                                    </div>
                                    <div className="item-box-right">
                                        <a target="_blank" href={'/model/'+item.objectId} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
                            <span className="font-15">
                            <table className="item-box-table-info">
                                <tr><td><b>Collaborators: </b></td><td>{item.collaborators.map(function(collaborators) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{collaborators}</a>;})}</td></tr>
                                <tr><td><b>Creation Date: </b></td><td>{item.start_date}</td></tr>
                                {/*  <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                            </span>
                                    </div>
                                </div>
                            </div>
                    )} <div className="clear"></div>
                </div>
            );
        });

        return (
            <div>
                <ResourceForm fromModelTab={true} />
                {itemsList}
                {this.state.noRecordsMessage}
            </div>
        )
    }
});

var Data = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false, noRecordsMessage: <LoadingGif /> };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var dataURL= "/profile/"+objectId+"/data_list";

        $.ajax({
            type: 'GET',
            url: dataURL,
            success: function(data) {
                if (data.length > 0 || Object.keys(data).length > 0) {
                    this.setState({data: data, noRecordsMessage: ''});
                }
                else {
                    this.setState({data: data, noRecordsMessage: (<div style={{textAlign: 'center'}}>No records exist yet!</div>)});
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Data!");
            }.bind(this)
        });
    },
    // function declared in ./sharedComponents/settings.js
    deleteEntry: settingsModalDeleteListEntry.bind(this),

    render: function() {
        var self = this;
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type;
            var typeList = [];
            var dataPath;
            for (var i in items) {
                var item = items[i];
                dataPath = '/data/' + item.objectId;
                item.start_date = (new Date(item.start_date)).toUTCString().slice(8,-12);
                typeList.push(item);
            }
            return (
                <div>
                    <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                    {typeList.map(item =>
                            <div className="item-box">
                                <div key={item.objectId}>
                                    <div className="item-box-left">
                                        <div className="item-box-image-outside">
                                            <a target="_blank" href={'/data/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                                        </div>
                                    </div>
                                    <div className="item-box-right">
                                        <h4 className="margin-top-bottom-5">
                                            <a target="_blank" href={'/data/'+item.objectId} className="body-link">{item.title}</a>
                                            {/*TODO uncomment<SettingsModal delete={self.deleteEntry} path={dataPath} refresh={self.render} />*/}
                                        </h4>
                            <span className="font-15">
                            <table className="item-box-table-info">
                                <tr><td><b>Collaborators: </b></td><td>{item.collaborators.map(function(collaborator) {
                                    return <a target="_blank" href={collaborator.link} className="tagsinput-tag-link react-tagsinput-tag">{collaborator.label}</a>;
                                })}
                                </td></tr>
                                <tr><td><b>Creation Date: </b></td><td>{item.start_date}</td></tr>
                                {/*  <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                            </span>
                                    </div>
                                </div>
                            </div>
                    )} <div className="clear"></div>
                </div>
            );
        });

        if (this.state.noRecordsMessage == null) {
            var noRecordsMessage = itemsList.length > 0 ? '' : (<div style={{textAlign: 'center'}}>No records exist yet!</div>);
        } else {
            var noRecordsMessage = this.state.noRecordsMessage;
        }

        return (
            <div>
                <ResourceForm fromModelTab={false} />
                {itemsList}
                {noRecordsMessage}
            </div>
        )
    }
});

var ResourceForm = React.createClass({
    getInitialState: function() {
        return {
            showModal: false,
            fromModelTab: false
        };
    },
    close() {
        this.setState({ showModal: false });
    },
    open() {
        this.setState({ showModal: true });
    },
    redirect: function(e) {
        window.location = '../../import';
    },
    render: function() {
        return (
            <div>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tr>
                            {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                            {/*bad implementation.... different styling for publication and models/data*/}
                        </tr>
                    </table>
                </div>
                {/* <Button className="pull-right add-resource-btn" onClick={this.open}>Add Data</Button>*/}


                <Modal show={this.state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add {this.props.fromModelTab ? 'Model' : 'Data'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.props.publication ?
                            (<PublicationAddForm submitSuccess={this.close} list={this.list} />)
                            :
                            (<ResourceAddForm fromModelTab={this.props.fromModelTab} submitSuccess={this.close} list={this.list} />)
                        }
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
});

var PublicationAddForm = React.createClass({
    close: function(e) {
        if (typeof this.props.submitSuccess === 'function') {
            this.props.submitSuccess();
        }
    },
    getInitialState: function() {
        return {
            fromModelTab: false,
            buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
            formFeedback: '',
            alertVisible: false,
            fileFeedback: {},
            autoFillStatus: '',
            submitButtonText: 'Continue',
            submitButtonDisabled: false,
            // field labels
            labels: {title: 'Title', collaborators: 'Collaborators', creationDate: 'Publication Date', description: 'Abstract',
                keywords: 'Keywords', url: 'URL', doi: 'DOI (Digital Object Identifier', // common
                journal: 'Journal', volume: 'Journal Volume', issue: 'Issue', pages: 'Pages', // journal articles
                publisher: 'Publisher' },

            // common form fields
            type: 'journal',
            file: null,
            fileType: '',
            title: '',
            description: '',
            collaborators: [fullname],
            creationDate: '',
            description: '',
            keywords: [],
            url: '',
            doi: '',
            // end common form fields
            journal: '', journal_volume: '', journal_issue: '', journal_pages: '', // journal articles,
            book_publisher: '', book_isbn: '', book_edition: '', book_pages: '', book_chapter: '', // book-specific fields
            conf: '', conf_volume:'', conf_location: '', // conference-specific fields
            patent_refNum: '', patent_location: '', // patent-specific fields
            report_publisher: '', report_number: '', report_location: '', // report-specific fields
            thesis_university: '', thesis_supervisors: '', thesis_degree: '', thesis_depart: '', thesis_pages: '', // thesis-specific fields
            unpub_location: '' //unpublished article-specific fields
        };
    },
    handleAcTagChange: function(type, ids) {
        var changedState = {};
        changedState[type] = ids;
        this.setState(changedState);
        // var newState = [];
        // for (var i = 0; i < tags.length; i++) {
        //     var t = tags[i];
        //     console.log(t.id);
        //     console.log(t.text);
        //     newState.push(t.text);
        // }
        // var changedState = {};
        // changedState[type] = newState;
        // this.setState(changedState);
    },
    render: function() {
        var self = this;
        var titleLabel = "Title:";
        var autoFillBtn = (
            <Button bsSize="small" onClick={this.fillDoi}>Auto-fill</Button>
        );
        var journalDetailFields = (
            <div><Input type="text" placeholder="Journal:" name="journal" required onChange={this.handleChange} value={this.state.journal} />
                <table width="100%"><tr>
                    <td><Input type="text" placeholder="Journal Volume" name="journal_volume" required onChange={this.handleChange} value={this.state.journal_volume} /></td>
                    <td><Input type="text" placeholder="Journal Issue" name="journal_issue" required onChange={this.handleChange} value={this.state.journal_issue} /></td>
                    <td><Input type="text" placeholder="Journal Pages" name="journal_pages" required onChange={this.handleChange} value={this.state.journal_pages} /></td>
                </tr></table></div>
        );
        var bookChapterTitle = (
            <div>
                <Input type="text" placeholder="Chapter Title:" name="book_chapter" onChange={this.handleChange} value={this.state.book_chapter} />
            </div>
        );
        var bookDetailFields = (
            <div><Input type="text" placeholder="Publisher:" name="book_publisher" required onChange={this.handleChange} value={this.state.book_publisher} />
                <table width="100%"><tr>
                    <td><Input type="text" placeholder="ISBN" name="book_isbn" required onChange={this.handleChange} value={this.state.book_isbn} /></td>
                    <td><Input type="text" placeholder="Edition" name="book_edition" required onChange={this.handleChange} value={this.state.book_edition} /></td>
                    <td><Input type="text" placeholder="Pages" name="book_pages" required onChange={this.handleChange} value={this.state.book_pages} /></td>
                </tr></table></div>
        );
        var confDetailFields = (
            <div><Input type="text" placeholder="Conference" name="conf" required onChange={this.handleChange} value={this.state.conf} />
                <table width="100%"><tr>
                    <td><Input type="text" placeholder="Conference Volume" name="conf_volume" required onChange={this.handleChange} value={this.state.conf_volume} /></td>
                    <td><Input type="text" placeholder="Conference Location" name="conf_location" required onChange={this.handleChange} value={this.state.conf_location} /></td>
                </tr></table></div>
        );
        var patentDetailFields = (
            <div><table width="100%"><tr>
                <td><Input type="text" placeholder="Patent Reference Number" name="patent_refNum" required onChange={this.handleChange} value={this.state.patent_refNum} /></td>
                <td><Input type="text" placeholder="Patent Location" name="patent_location" required onChange={this.handleChange} value={this.state.patent_location} /></td>
            </tr></table></div>
        );
        var reportDetailFields = (
            <div><Input type="text" placeholder="Publisher" name="report_publisher" onChange={this.handleChange} value={this.state.report_publisher} />
                <table width="100%"><tr>
                    <td><Input type="text" placeholder="Report Volume" name="report_number" required onChange={this.handleChange} value={this.state.report_number} /></td>
                    <td><Input type="text" placeholder="Report Location" name="report_location" required onChange={this.handleChange} value={this.state.report_location} /></td>
                </tr></table></div>
        );
        var thesisDetailFields = (
            <div><Input type="text" placeholder="University" name="thesis_university" required onChange={this.handleChange} value={this.state.thesis_university} />
                <Input type="text" placeholder="Supervisors" name="thesis_supervisors" onChange={this.handleChange} value={this.state.thesis_supervisors} />
                <table width="100%"><tr>
                    <td><Input type="text" placeholder="Degree" name="thesis_degree" required onChange={this.handleChange} value={this.state.thesis_degree} /></td>
                    <td><Input type="text" placeholder="Department" name="thesis_depart" required onChange={this.handleChange} value={this.state.thesis_depart} /></td>
                    <td><Input type="text" placeholder="Pages" name="thesis_pages" required onChange={this.handleChange} value={this.state.thesis_pages} /></td>
                </tr></table></div>
        );
        var unpubDetailFields = (
            <Input type="text" placeholder="Place of Publication" name="unpub_location" onChange={this.handleChange} value={this.state.unpub_location} />
        );

        var showBookChapterTitle = function(type) {
            if (type === "Pub_Chapter") {
                titleLabel = "Book Title:";
                return bookChapterTitle;
            }
        };

        var showTypeFields = function(type) {
            switch (type) {
                case "Pub_Book":
                    return bookDetailFields;
                    break;
                case "Pub_Chapter":
                    //showBookChapterTitle(true);
                    //showBookChapterTitle("Pub_Chapter");
                    return bookDetailFields;
                    break;
                case "Pub_Conference":
                    return confDetailFields;
                    break;
                case "Pub_Journal_Article":
                    return journalDetailFields;
                    break;
                case "Pub_Patent":
                    return patentDetailFields;
                    break;
                case "Pub_Report":
                    return reportDetailFields;
                    break;
                case "Pub_Thesis":
                    return thesisDetailFields;
                    break;
                case "Pub_Unpublished":
                    return unpubDetailFields;
                    break;
            }
        };

        if (this.state.alertVisible) {
            var alert = <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}> {this.state.formFeedback} </Alert>;
        } else {var alert = "";}

        return (
            <div>
                {alert}
                <form className="form" onSubmit={this.handleSubmitData}>
                    <div className="well" style={this.buttonStyles}>
                        <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                            Select Files... <input type="file" onChange={this.handleFile} />
                        </Button>
                    </div>

                    <Input type="select" placeholder name="type" required onChange={this.handleChange} value={this.state.type} >
                        <option value="" disabled>Type:</option>
                        <option value="Pub_Book">Book</option>
                        <option value="Pub_Chapter">Book Chapter</option>
                        <option value="Pub_Conference">Conference Proceeding</option>
                        <option value="Pub_Journal_Article" selected>Journal Article</option>
                        <option value="Pub_Patent">Patent</option>
                        <option value="Pub_Report">Report</option>
                        <option value="Pub_Thesis">Thesis</option>
                        <option value="Pub_Unpublished">Unpublished Article</option>
                    </Input>
                    {showBookChapterTitle(this.state.type)}
                    <Input type="text" placeholder={titleLabel} name="title" required onChange={this.handleChange} value={this.state.title} />

                    <div className="rcorners6">
                        <CustomTags type="text" changeFunc={this.handleAcTagChange} placeholder="Contributors:" name="collaborators" value={this.state.collaborators} />
                    </div>
                    {/*<ReactTagsInput type="text" placeholder="Collaborators:" name="collaborators" onChange={this.handleCollabKeyChange} value={this.state.collaborators} />*/}
                    <Input type="date" placeholder="Creation Date:" name="creationDate" required onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
                    {showTypeFields(this.state.type)}
                    <Input type="textarea" placeholder="Abstract:" name="description" onChange={this.handleChange} value={this.state.description} rows="5"/>
                    <ReactTagsInput type="text" placeholder="Keywords (use tab key to separate):" name="keywords" onChange={this.handleKeyChange} value={this.state.keywords} />
                    <Input type="text" placeholder="URL" name="url" onChange={this.handleChange} value={this.state.url} />
                    <Input type="text" placeholder="DOI (Digital Object Identifier)" name="doi" onChange={this.handleChange} value={this.state.doi} buttonAfter={autoFillBtn} />
                    <div className="form-feedback auto-fill-status">{this.state.autoFillStatus}</div>

                    <Modal.Footer>
                        <Input className="btn btn-default pull-right submit" type="submit" disabled={this.state.submitButtonDisabled} value={this.state.submitButtonText} />
                        <div className="form-feedback"></div>
                    </Modal.Footer>
                </form>
            </div>
        );
    },

    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    handleKeyChange: function(e) {
        var changedState = {};
        changedState['keywords'] = e;
        this.setState(changedState);
    },
    handleCollabKeyChange: function(e) { // TODO delete or fix
        var changedState = {};
        changedState['collaborators'] = e;
        this.setState(changedState);
    },
    pullAuthors: function(authors) {
        return authors.map(function(author) {
            return author.given + ' ' + author.family;
        });
    },

    fillDoi: function(e) {
        var self = this;
        $.ajax({
            url: 'http://api.crossref.org/works/' + this.state.doi,
            type: 'GET',
            success: function(data) {
                var entry = data.message;
                this.setState({
                    title: entry.title[0],
                    collaborators: (entry.hasOwnProperty('author') ? self.pullAuthors(data.message.author): []),
                    creationDate: entry.created['date-time'].split('T')[0],//entry['published-print']['date-parts'][0],
                    url: entry.URL,
                    keywords: (entry.hasOwnProperty('subject') ? entry.subject:[]),
                    autoFillStatus: "",
                });
                this.fillDetails(entry, null);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error('http://api.crossref.org/works/', status, err.toString());
                this.setState({ autoFillStatus: "DOI not found. Try again." });
            }.bind(this)
        });
        this.setState({ autoFillStatus: "Fetching data..." });
    },
    // each publication type has special fields. This function selects based on the type value returned from
    // CrossRef and fills in the appropriate fields
    fillDetails: function(entry, pubForm) {
        switch (entry.type) {
            case "Pub_Journal_Article":
            case "journal-article":
                if (pubForm != null) {
                    pubForm["journal"] = this.state.journal;
                    pubForm["journal_volume"] = this.state.journal_volume;
                    pubForm["journal_issue"] = this.state.journal_issue;
                    pubForm["journal_pages"] = this.state.journal_pages;
                } else {
                    this.setState({
                        type: "Pub_Journal_Article",
                        journal: entry['container-title'][0],
                        journal_volume: entry.volume,
                        journal_issue: entry.issue,
                        journal_pages: entry.page,
                    });
                }
                break;
            case "Pub_Book":
            case "book": // 10.1007/1-4020-4466-6
                if (pubForm != null) {
                    pubForm["book_publisher"] = this.state.book_publisher;
                    pubForm["book_isbn"] = this.state.book_isbn;
                    pubForm["book_edition"] = this.state.book_edition;
                    pubForm["book_pages"] = this.state.book_pages;
                } else {
                    this.setState({
                        type: "Pub_Book",
                        book_publisher: entry.publisher,
                        book_isbn: entry.ISBN[0].substring(28),
                        book_edition: (entry.hasOwnProperty('edition') ? entry.edition : ''),
                        book_pages: (entry.hasOwnProperty('page') ? entry.page : ''),
                    });
                }
                break;
            case "Pub_Chapter":
            case "book-chapter": //10.1007/1-4020-4466-6_3
                if (pubForm != null) {
                    pubForm["book_publisher"] = this.state.book_publisher;
                    pubForm["book_isbn"] = this.state.book_isbn;
                    pubForm["book_edition"] = this.state.book_edition;
                    pubForm["book_chapter"] = this.state.book_chapter;
                    pubForm["book_pages"] = this.state.book_pages;
                } else {
                    this.setState({
                        type: "Pub_Chapter",
                        title: entry['container-title'][0],
                        book_chapter: entry.title[0],
                        book_isbn: entry.ISBN[0].substring(28),
                        book_publisher: entry.publisher,
                        book_pages: (entry.hasOwnProperty('page') ? entry.page : ''),
                    });
                }
                break;
            case "Pub_Conference":
            case "proceedings":
            case "proceedings-article": //10.1109/CSEET.2012.35
                if (pubForm != null) {
                    pubForm["conf"] = this.state.conf;
                    pubForm["conf_volume"] = this.state.conf_volume;
                    pubForm["conf_location"] = this.state.conf_location;
                } else {
                    this.setState({
                        type: "Pub_Conference",
                        conf: entry['container-title'][0],
                    });
                }
                break;
            case "Pub_Patent":
            case "patent":
                if (pubForm != null) {
                    pubForm["patent_refNum"] = this.state.patent_refNum;
                    pubForm["patent_location"] = this.state.patent_location;
                } else {
                    this.setState({
                        type: "Pub_Patent",
                    });
                }
                break;
            case "Pub_Report":
            case "report": //10.2172/897503, 10.1037/ce100001
                if (pubForm != null) {
                    pubForm["report_publisher"] = this.state.report_publisher;
                    pubForm["report_number"] = this.state.report_number;
                    pubForm["report_location"] = this.state.report_location;
                } else {
                    this.setState({
                        type: "Pub_Report",
                        report_publisher: entry.publisher,
                    });
                }
                break;
            case "Pub_Thesis":
            case "dissertation": // 10.2986/tren.009-0347
                if (pubForm != null) {
                    pubForm["thesis_university"] = this.state.thesis_university;
                    pubForm["thesis_supervisors"] = this.state.thesis_supervisors;
                    pubForm["thesis_degree"] = this.state.thesis_degree;
                    pubForm["thesis_depart"] = this.state.thesis_depart;
                    pubForm["thesis_pages"] = this.state.thesis_pages;
                } else {
                    this.setState({
                        type: "Pub_Thesis",
                    });
                }
                break;
            case "Pub_Unpublished":
            case "unpublished":
                if (pubForm != null) {
                    pubForm["unpub_location"] = this.state.unpub_location;
                } else {
                    this.setState({
                        type: "Pub_Unpublished",
                    });
                }
                break;
            default:
                console.log('Warning: type unsupported', entry.type);
        }
    },

    handleSubmitData: function(e) {
        e.preventDefault();
        this.setState({submitButtonText: "Please wait. We're uploading...",
            submitButtonDisabled: true,
            alertVisible: false});
        var pubForm = {file: this.state.file, fileType: this.state.fileType,
            collaborators: JSON.stringify(this.state.collaborators), creationDate: this.state.creationDate,
            description: this.state.description, doi: this.state.doi, url: this.state.url,
            keywords: JSON.stringify(this.state.keywords), title: this.state.title, type: this.state.type};
        this.fillDetails({type:this.state.type}, pubForm);

        $.ajax({
            url: path + "/publication",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(pubForm),
            processData: false,
            success: function(data) {
                console.log("Publication upload done");
                this.close();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/publication", status, err.toString());
                this.setState({formFeedback: err.toString(), alertVisible: true,
                    submitButtonText: "Continue",submitButtonDisabled: false});
            }.bind(this)
        });

        return;
    },

    openFileUpload() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.file.on('fileselect', function(event, numFiles, label) {
            return input;
        });
    },

    handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                file: upload.target.result,
                fileType: extension,
                fileFeedback: {background: '#dff0d8'}
            });
        }
        reader.readAsDataURL(file);
    },

    validateForm: function() {
        var issues = []
        if (!this.state.keywords.trim()) {
            issues.push("KEYWORDS");
        }
        return issues;
    },
});

var ResourceAddForm = React.createClass({
    close: function(e) {
        if (typeof this.props.submitSuccess === 'function') {
            this.props.submitSuccess();
        }
    },
    getInitialState: function() {
        //var resultArr = [];
        return {
            alertVisible: false,
            fromModelTab: false,
            submitButtonText: 'Continue',
            submitButtonDisabled: false,
            buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
            formFeedback: '',
            fileFeedback: {},
            pictureFeedback: '',
            // form
            picture: null,
            pictureType: '',
            file: null,
            fileType: '',
            title: '',
            collaborators: [fullname],
            creationDate: '',
            keywords: [],
            description: '',
            license: '',
            url: '',
        };
    },
    render: function() {
        if (this.state.alertVisible) {
            var alert = <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}> {this.state.formFeedback} </Alert>;
        } else {var alert = "";}
        return (
            <div id="modalDiv">
                {alert}
                <div id="scriptContainer"></div>
                <form className="form" onSubmit={this.handleSubmitData}>
                    <div className="well" style={this.buttonStyles}>
                        <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                                style={{background: this.state.pictureFeedback}}>
                            Add Picture (gif/jpg/png) <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                        </Button>
                        <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                            Select Files... <input type="file" onChange={this.handleFile} />
                        </Button>
                    </div>
                    <Input type="text" placeholder="Title:" name="title" required onChange={this.handleChange} value={this.state.title} />

                    {/*<div className="rcorners6">
                     <CustomTags type="text" changeFunc={this.handleAcTagChange} placeholder="Collaborators:" name="collaborators" value={this.state.collaborators} />
                     </div>*/}
                    <div className="rcorners6">
                        <ReactMultiSelect placeholder='Add Collaborators' changeHandler={this.handleAcTagChange.bind(null, 'collaborators')}/>
                    </div>

                    {/*<ReactTagsInput type="text" placeholder="Collaborators:" name="collaborators" onChange={this.handleCollabKeyChange} value={this.state.collaborators} />*/}
                    <Input type="date" placeholder="Creation Date:" name="creationDate" required onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
                    <ReactTagsInput type="text" placeholder="Keywords (use tab key to separate):" name="keywords" onChange={this.handleKeyChange} value={this.state.keywords} />
                    <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} rows="5"/>
                    <Input type="text" placeholder="License:" name="license" onChange={this.handleChange} value={this.state.license} />
                    <Input type="text" placeholder="URL (Link to model)" name="url" onChange={this.handleChange} value={this.state.url} />

                    {/*
                     <CategorizedTagInput addNew={true} categories={categories} />
                     <div className="rcorners6">
                     <CustomTags type="text" changeFunc={this.handleAcTagChange} placeholder="Users to share:" name="groupies" value={this.state.collaborators} />
                     </div>
                     */}
                    <Modal.Footer>
                        <Input ref="submitButton" className="btn btn-default pull-right submit" type="submit" disabled={this.state.submitButtonDisabled} value={this.state.submitButtonText} />
                    </Modal.Footer>
                </form>
            </div>
        );
    },
    handleAcTagChange: function(type, vals) {
        var changedState = {};
        changedState[type] = vals;
        this.setState(changedState);
        console.log(type, " changed to ", vals);
    },
    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    handleKeyChange: function(e) {
        var changedState = {};
        changedState['keywords'] = e;
        this.setState(changedState);
    },
    handleCollabKeyChange: function(e) {
        var changedState = {};
        changedState['collaborators'] = e;
        this.setState(changedState);
    },
    handleSubmitData: function(e) {
        e.preventDefault();
        this.setState({submitButtonText: "Please Wait. We're uploading",
            submitButtonDisabled: true,
            alertVisible: false});
        var endpoint = this.props.fromModelTab ? "/model" : "/data";
        var dataForm = {picture: this.state.picture,
            pictureType: this.state.pictureType,
            file: this.state.file,
            fileType: this.state.fileType,
            title: this.state.title,
            collaborators: JSON.stringify(this.state.collaborators),
            creationDate: this.state.creationDate,
            description: this.state.description,
            license: this.state.license,
            url: this.state.url,
            keywords: JSON.stringify(this.state.keywords)};
        var isValidForm = this.validateForm();
        if (isValidForm.length === 0) {

            $.ajax({
                url: path + endpoint,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify(dataForm),
                processData: false,
                success: function(data) {
                    this.setState({data: data});
                    console.log("Data upload done");
                    this.close();
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(path + endpoint, status, err.toString());
                    this.setState({formFeedback: err.toString(), alertVisible: true,
                        submitButtonText: "Continue",submitButtonDisabled: false});
                }.bind(this)
            });
        }
        else {
            var message = (this.props.fromModelTab ? 'Model' : 'Data') + ' could not be added:';
            if (isValidForm.indexOf('COLLABORATORS') > -1) {
                message += ' Please specify at least one collaborator.';
            }
            if (isValidForm.indexOf('KEYWORDS') > -1) {
                message += ' Please specify at least one keyword.';
            }
            this.setState({formFeedback: message, alertVisible: true,
                submitButtonText: "Continue",submitButtonDisabled: false});
        }
        return;
    },

    showPictureUpload(fromModel) {
        if (fromModel) {
            return '';
        }
        return 'none';
    },

    openFileUpload() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.file.on('fileselect', function(event, numFiles, label) {
            return input;
        });
    },

    handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                file: upload.target.result,
                fileType: extension,
                fileFeedback: {background: '#dff0d8'}
            });
        }
        reader.readAsDataURL(file);
    },

    handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                picture: upload.target.result,
                pictureType: extension,
                pictureFeedback: '#dff0d8'
            });
        }
        reader.readAsDataURL(file);
    },

    validateForm: function() {
        var issues = []
        if (this.state.collaborators.length<1) {
            issues.push("COLLABORATORS");
        }
        if (this.state.keywords.length<1) {
            issues.push("KEYWORDS");
        }
        return issues;
    },
});

function split(val) {
    return val.split( /,\s*/ );
}

function extractLast(term) {
    return split(term).pop();
}

var ProjectAddForm = React.createClass({
    close: function(e) {
        this.props.submitSuccess();
    },
    getInitialState: function() {
        return {
            alertVisible: false,
            buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
            divStyle: {outline: 'black'},
            formFeedback: '',
            fileFeedback: {},
            pictureFeedback: '',
            submitButtonText: "Continue",
            submitButtonDisabled: false,
            // form
            picture: null,
            file: null,
            pictureType: '',
            fileType: '',
            title: '',
            description: '',
            collaborators: [fullname],
            startDate: '',
            endDate: '',
            link_to_resources: '',
            client: '',
            keywords: [],
            url: '',
            organizationId: '',
            groupies: ''
        };
    },
    componentDidMount: function() {
        // var eCode = <script>
        //                 $(function() {
        //                     $('.auto').bind("keydown", function(event) {
        //                         if ( event.keyCode === $.ui.keyCode.TAB &&
        //                             $( this ).autocomplete( "instance" ).menu.active ) {
        //                           event.preventDefault();
        //                         }
        //                     })
        //                     .autocomplete({
        //                             source: function(req, res) {
        //                                 $.ajax({
        //                                   url: '/allusers',
        //                                   dataType: 'JSON',
        //                                   cache: false,
        //                                   success: function(data) {
        //                                     console.log("SUCCESS!!!!!!!");
        //                                     console.log(data);
        //                                     var arr = $.grep(data, function(item){
        //                                       return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
        //                                     });
        //                                     res($.ui.autocomplete.filter($.map(data, function(item){
        //                                       return {
        //                                         label: item.fullname,
        //                                         value: item.username
        //                                       };
        //                                     }), extractLast(req.term)));
        //                                   },
        //                                   error: function(xhr) {
        //                                     console.log(xhr.status);
        //                                   }
        //                                 });
        //                             },
        //                             focus: function() {
        //                                 return false;
        //                             },
        //                             messages: {
        //                               noResults: '',
        //                               results: function() {}
        //                             },
        //                             select: function(event, ui) {
        //                                 var terms = split(this.value);
        //                                 terms.pop();
        //                                 terms.push(ui.item.value);
        //                                 terms.push("");
        //                                 this.value = terms.join(", ");
        //                                 return false;
        //                             }
        //                     })
        //                 });
        //             </script>
        // // var eCode = <script type="text/jsx" src="/javascripts/multac.jsx"></script>
        // $("#scriptContainer").append(eCode);
    },
    render: function() {
        if (this.state.alertVisible) {
            var alert = <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}> {this.state.formFeedback} </Alert>;
        } else {var alert = "";}
        return (
            <div>
                <form className="form" onSubmit={this.handleSubmitData}>
                    <Modal.Body>
                        {alert}
                        <div className="well" style={this.buttonStyles}>
                            <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                                    style={{background: this.state.pictureFeedback}}>
                                Add Picture (gif/jpg/png) <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                            </Button>
                            <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                                Select Files... <input type="file" onChange={this.handleFile} />
                            </Button>
                        </div>

                        <Input type="text" placeholder="Title:" name="title" required onChange={this.handleChange} value={this.state.title} />
                        <ReactTagsInput type="textarea" placeholder="Collaborators:" name="collaborators" onChange={this.handleCollabKeyChange} value={this.state.collaborators} />

                        {/* <Input type="text" placeholder="Collaborators:" name="collaborators" className="auto" onChange={this.handleChange} value={this.state.collaborators} />*/}
                        <Input type="date" placeholder="Start Date:" name="startDate" required onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.startDate} />
                        <Input type="date" placeholder="End Date:" name="endDate" onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.endDate} />
                        <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} rows="5" />
                        <Input type="text" placeholder="Client:" name="client" onChange={this.handleChange} value={this.state.client} />
                        <ReactTagsInput type="textarea" placeholder="Keywords (use tab key to separate):" name="keywords" onChange={this.handleKeyChange} value={this.state.keywords} />
                        <Input type="text" placeholder="URL:" name="url" onChange={this.handleChange} value={this.state.url} />
                        {/*<Input type="text" className="auto" placeholder="Users you'd like to share this with (type in comma separated names): " name="groupies" onChange={this.handleChange} value={this.state.groupies} />*/}
                    </Modal.Body>
                    <Modal.Footer>
                        <input className="btn btn-default pull-right submit" type="submit" disabled={this.state.submitButtonDisabled} value={this.state.submitButtonText}/>
                    </Modal.Footer>
                </form>
            </div>
        );
    },
    handleAlertDismiss() {
        this.setState({alertVisible: false});
    },
    handleAlertShow() {
        this.setState({alertVisible: true});
    },
    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    handleKeyChange: function(e) {
        var changedState = {};
        changedState['keywords'] = e;
        this.setState(changedState);
    },
    handleCollabKeyChange: function(e) {
        var changedState = {};
        changedState['collaborators'] = e;
        this.setState(changedState);
    },
    handleSubmitData: function(e) {
        e.preventDefault();
        this.setState({submitButtonText: "Please wait. We're uploading..."});
        this.setState({submitButtonDisabled: true});
        var dataForm = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
            fileType: this.state.fileType, pictureType: this.state.pictureType,
            collaborators: JSON.stringify(this.state.collaborators), startDate: this.state.startDate, endDate: this.state.endDate,
            description: this.state.description, client: this.state.client, link_to_resources: this.state.link_to_resources,
            keywords: JSON.stringify(this.state.keywords), url: this.state.url, title: this.state.title};

        var isValidForm = this.validateForm();
        if (isValidForm.length === 0) {
            var endpoint = "/project";
            var dataFormORIG = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
                fileType: this.state.fileType, pictureType: this.state.pictureType,
                collaborators: this.state.collaborators, startDate: this.state.startDate, endDate: this.state.endDate,
                description: this.state.description, client: this.state.client, link_to_resources: this.state.link_to_resources,
                keywords: this.state.keywords, url: this.state.url, title: this.state.title};

            $.ajax({
                url: path + endpoint,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                type: 'POST',
                data: JSON.stringify(dataForm),
                processData: false,
                success: function(data) {
                    console.log("Submitted");
                    this.close();
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(path + endpoint, status, err.toString());
                }.bind(this)
            });
        }
        else {
            var message = 'Project could not be added!';
            if (isValidForm.indexOf('KEYWORDS') > -1) {
                message += ' Please specify at least one keyword.';
            }
            this.setState({formFeedback: message, alertVisible: true});
        }
        return;
    },

    showPictureUpload(fromModel) {
        if (fromModel) {
            return '';
        }
        return 'none';
    },

    openFileUpload() {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.file.on('fileselect', function(event, numFiles, label) {
            return input;
        });
    },

    handleFile: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                file: upload.target.result,
                fileType: extension,
                fileFeedback: {background: '#dff0d8'}
            });
        }
        reader.readAsDataURL(file);
    },

    handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                picture: upload.target.result,
                pictureType: extension,
                pictureFeedback: '#dff0d8'
            });
        }
        reader.readAsDataURL(file);
    },

    validateForm: function() {
        var issues = []
        if (this.state.keywords.length<1) {
            issues.push("KEYWORDS");
        }
        return issues;
    },
});

var LoadingGif = React.createClass({
    render: function() {
        return (
            <div>
                <p style={{textAlign: 'center'}}><img className="loading-bar" src="../../images/loadingbar.gif"/>
                    Fetching...
                </p>
            </div>
        )
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

// helpers
function getLinkFromCollaborator (collab) {
    var uName = collab.split("(")[1];
    if (uName === undefined) {
        return '#';
    }
    uName = uName.substring(0, uName.length-1);
    var dLink = "/profile/" + uName;
    return dLink;
}

function getNameFromCollaborator (collab) {
    var name = collab.split("(")[0];
    return name.replace(/_/g, " ").replace(/(\.\d*)/g, "")
}

$( document ).ready(function() {
    ReactDOM.render(<Profile />, document.getElementById('content'));
});

