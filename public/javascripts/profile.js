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
          showEmbedModal:false,
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
    openFileUpload() {
	    var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.fileChosen.on('fileselect', function(event, numFiles, label) {
            return input;
        });
	},
    handlePicture: function(e) {
        var self = this;
        var reader = new FileReader();
        var file = e.target.files[0];
        var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
         self.setState({
           pictureChosen: upload.target.result,
           picture: upload.target.result,
           pictureType: extension,
         });
        }
        reader.readAsDataURL(file);
    },
    handleSubmitData: function() {
        this.setState({imgSubmitText: "Uploading. Give us a sec..."});
        this.setState({imgSubmitDisabled: true});
        var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType};
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            success: function(status) {
                this.setState({profile_imgURL: this.state.picture});
                this.setState({ imgSubmitDisabled: false });
                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/picture", status, err.toString());
                this.setState({ imgSubmitText: "Error. Please select an image and click me again." });
                this.setState({ imgSubmitDisabled: false });
            }.bind(this)
        });
        return;
    },
    checkConnection:function()
    {
        var connectURL= "/profile/"+username+"/connection-status";

        $.ajax({
            url: connectURL,
            type: 'POST',
            data: {userId: objectId},
            success: function(status) {
                this.setState({status: status})
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't retrieve people.");
            }.bind(this)
        });
    },
    componentWillMount: function() {
        this.checkConnection();
    },
    clickConnect: function() {
      var connectURL= "/profile/"+objectId+"/connect";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: status});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    clickDisconnect: function() {
      var connectURL= "/profile/"+objectId+"/disconnect";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: "not-connected"});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    openEmbed: function() {
        this.setState({ showEmbedModal: true });
    },
    closeEmbed:function()
    {
        this.setState({ showEmbedModal: false });
    },
    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },

    submitChange: function() {
        var dataForm = { about: this.state.about };
        $.ajax({
            url: path + "/updateAbout",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });
        return;
    },
    render: function() {
        var shareButton= <button  onClick={this.openEmbed} className="btn btn-panel btn-right-side" value="">Embed <i className="fa fa-code" aria-hidden="true"></i></button>;
        var connectButton = <button className="btn btn-panel btn-right-side" value=""></button>;
        if (this.state.status == "connected") {
             connectButton = <button onClick={this.clickDisconnect} className="btn btn-panel btn-right-side" value="Disconnect">Disconnect</button>;
        }
        else if (this.state.status == "pending") {
             connectButton = <button className="btn btn-panel btn-right-side pending_btn" value="Pending">Pending</button>;
        }
        else if (this.state.status == "not-connected") {
                 connectButton = <button onClick={this.clickConnect} className="btn btn-panel btn-right-side" value="Connect">Connect</button>;
        }
        else { console.log("Nothing"); }
        return (
        <div>
            <Modal show={this.state.showEmbedModal} onHide={this.closeEmbed}>
                <Modal.Header closeButton>
                    <Modal.Title>Publish Your Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <h4>Place the following code where you'd like your Syncholar profile to load:</h4>
                    </div>
                    <div id="field1-container">
                        <input className="p-editable" type="text" value={"<iframe frameborder='0'  style='width:100%; height: 600px; padding:0; border:0; hegiht:100px;' src='http://syncholar.com/share/profile/"+ currentUsername+"'"+"></iframe>"} class="field left" readonly/>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={this.state.showModal} onHide={this.clickClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Profile Picture</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div id="field1-container">
                        <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.handlePicture} />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <input className="publication-button" type="submit" disabled={this.state.imgSubmitDisabled} value={this.state.imgSubmitText} onClick={this.handleSubmitData} />
                </Modal.Footer>
            </Modal>
            <div className="content-wrap">
                <div className="item-bottom">
                    <div className="item-row1">
                    </div>
                    <div className="item-row1">
                        <div className="item-bottom-1">
                            {(currentUsername == username) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.profile_imgURL} className="contain-image" /><div className="edit-overlay-background"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={this.state.profile_imgURL} className="contain-image" />}
                        {/*
                            <div className="side-panel"><h5>NEWS AND EVENTS</h5></div>
                            <div className="side-panel"><h5>RATINGS</h5></div>
                            <div className="side-panel"><h5>OTHERS</h5></div>
                            */}
                        </div>
                        <div id="item-bottom-2-profile" className="item-bottom-2">
                            {(currentUsername == username) ? <div className="interact-buttons-wrap">{shareButton}</div> : <div className="interact-buttons-wrap">{connectButton}</div> }
                            <h3 className="no-margin-padding align-left h1-title">{fullname}</h3>
                            {(currentUsername == username) ? <input id="userTitleInp" type="text" className="p-editable transparent" name="about" placeholder="Your Title"  onChange={this.handleChange} onBlur={this.submitChange} value={this.state.about} />
                                : <h4 className="no-margin-padding align-left h3-title">{about}</h4>}
                        </div>
                    </div>
                </div>
                <div className="item-bottom-3">
                        <ProfileMenu tabs={['About','People','Affiliations', 'Publications', 'Projects', 'Figures & Data', 'Software & Code']} />


                        {/*<input className="btn btn-panel" value="Message" />
                        <input className="btn btn-panel" value="Ask" />*/}
                        {/*
                        <div className="item-panel contain-panel"><h5>Ratings</h5><br/>
                            48 Syncholarity Rating<br/>
                            2000 Times Cited<br/>
                            12000 Profile Views
                        </div>
                        <div className="item-panel contain-panel"><h5>News & Events</h5><br/>
                            {this.props.news.map(function(listValue){
                                return <a href="#" className="body-link">{listValue}<br/></a>;
                            })}
                        </div>
                        <div className="item-panel contain-panel"><h5>Adds</h5><br/>
                        </div>
                        */}
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
                                <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="item-box-image" /></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/profile/'+person.username} className="body-link"><h4 className="margin-top-bottom-5">{person.fullname}</h4></a>
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
                            {(currentUsername == username) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltip}><input className="item-add-button" onClick={this.inviteTrigger} type="button" value="+"/></OverlayTrigger></td> : ""}
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

        var orgUrl= "/profile/"+objectId+"/organizations";

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
            if(!this.state.isMe)
            {
                if (matchingOrg == null)
                    join = (<div><button onClick={this.clickJoin.bind(this,org)} className="btn btn-right-side " value="Join">Join</button></div>);  /*(<div><a onClick={this.clickJoin.bind(this,org)}>Join Organization</a></div>);*/
                else if (!matchingOrg.verified)
                    join = (<div><button className="btn btn-right-side pending_btn" value="Pending">Pending</button></div>);/*(<div><a>Request Pending</a></div>);*/
            }
            return (
                <div className="item-box" key={org.orgId} id="item-list">
                    <div className="item-box-left">
                        <div className="item-box-image-outside">
                            <a href={'/organization/'+org.name}><img src={org.orgImgUrl} className="item-box-image" /></a>
                        </div>
                    </div>
                    <div className="item-box-right">
                        <a href={'/organization/'+org.name} className="body-link"><h4 className="margin-top-bottom-5">{org.displayName}</h4></a>
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

        if(JSON.parse(workExperience).length > 0) { hideWorkExperiences = "show"; } else { hideWorkExperiences = "hide"; }

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
            hideWorkExperiences: hideWorkExperiences
        };
    },
    submitExperience: function() {
        var dataForm = {workExperience: this.state.workExperience};
        $.ajax({
            url: path + "/submitExperience",
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

    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    addWork: function() {
        var randomNumber = Math.floor(Math.random() * 100000000);
        if (this.state.workExperience == "") {
            var arrayWE = [{company:"",description:"",end:"",key: randomNumber,start:"",title:"",major:"",field:"work"}];
        }
        else {
            var newWE = {company:"",description:"",end:"",key: randomNumber,start:"",title:"", major:"",field:"work"};
            var arrayWE = JSON.parse(this.state.workExperience);
            arrayWE.push(newWE);
        }
        this.setState({workExperience:JSON.stringify(arrayWE), hideWorkExperiences: "show"}, function(){ this.submitExperience() }.bind(this));
    },

    tabChange: function(index) {
        this.props.tab(index);
    },
    updateChildChanges: function() {
        $.ajax({
            url: path + "/updateChildChanges",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            processData: false,
            success: function(data) {
                var parseData = JSON.parse(data);
                educationData = parseData[0];
                workExperienceData = parseData[1];
                this.setState({educations: JSON.stringify(educationData)});
                this.setState({workExperience: JSON.stringify(workExperienceData)});
                if (educationData.length == 0) {this.setState({hideEducations: "hide"});}
                if (workExperienceData.length == 0) {this.setState({hideWorkExperiences: "hide"});}
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/updateChildChanges", status, err.toString());
            }.bind(this)
        });
    },
    render: function() {
        self = this;
        var workExperience_data = [];
        var projects_data = [];
        var publications_data = [];
        var datas_data = [];
        var models_data = [];
        if (this.state.workExperience != "") {
            var WEItems = JSON.parse(this.state.workExperience);
            WEItems.forEach(function(item, i) {
                workExperience_data.push(<AboutTabObject identifier={i} updateChanges={self.updateChildChanges} field={item.field} title={item.title} major={item.major} company={item.company} description={item.description} start={item.start} end={item.end} type="workExperience" />);
            });
        }

        return (
            <div id="resume">
               <AboutTab_Summary summary={this.state.summary} />
               <AboutTab_Interests tags = {this.state.interestsTag} interests= {this.state.interests}/>
                <div className="clear"/>
               <AboutTab_Education educations={this.state.educations} />



                <div id="resume-experience" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" >Work Experience</h3>
                    </div>
                    {(currentUsername == username) ? <div className="div-absolute"><h3><a onClick={this.addWork} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div> : ""}
                    <div className={"resume-item div-relative " + this.state.hideWorkExperiences}>{workExperience_data}</div>
                </div>

            </div>
        )
    }
});
var AboutTab_Education = React.createClass({
    getInitialState: function() {

        var hideEducations;
        if(JSON.parse(this.props.educations).length > 0) { hideEducations = "show"; } else { hideEducations = "hide"; }
        return {
            edit: false,
            hideEducations: hideEducations,
            educations: this.props.educations,
        };
    },
    submitEducation: function() {
        var dataForm = {educations: this.state.educations};
        $.ajax({
            url: path + "/submitEducation",
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
    addEducation: function() {
        var randomNumber = Math.floor(Math.random() * 100000000);
        if (this.state.educations == "")
        {
            var arrayWE = [{company:"",description:"",end:"",key:randomNumber,start:"",title:"",major:"",field:"education"}];
        }
        else
        {
            var newWE = {company:"",description:"",end:"",key:randomNumber,start:"",title:"",major:"",field:"education"};
            var arrayWE = JSON.parse(this.state.educations);
            arrayWE.push(newWE);
        }
        this.setState({educations:JSON.stringify(arrayWE), hideEducations: "show"});
    },
    render: function()
    {
console.log(this.state.educations);
        var education_list=""
             education_list = JSON.parse(this.state.educations).map(function (education) {
                return (
                    <Education_Object education={education}/>

                );
            });



       return (
           <div id="resume-education" className="div-relative"><hr/>
               <div>
                   <h3 className="no-margin-top" >Education</h3>
               </div>
               {(currentUsername == username) ?
                   <div className="div-absolute"><h3><a onClick={this.addEducation} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div>
                   : ""}
               <div className={"resume-item div-relative " + this.state.hideEducations}>{education_list}</div>
           </div>
       );
    }

});
var AboutTab_Summary = React.createClass({
    getInitialState: function() {
        return {
            edit: false,
            text: ''
        };
    },
    componentDidMount : function() {
    this.setState({text: this.props.summary});
    },
    handleTextChange: function(e) {
        this.setState({text: e.target.value});
    },
    editClicked:function(){
        this.setState({
            edit:true
        });
        this.toggleHover();
    },
    cancelEdit:function(){
        this.setState({
            edit:false
        });
    },
    saveSummary:function(){

        var dataForm = {summary: this.state.text.replace(/(\r\n|\n|\r|\\)/gm,'\\n')};
        $.ajax({
            url: path + "/updateSummary",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({
                    text: this.state.text,
                    edit:false
                });
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });

    },
    toggleHover: function(){
        this.setState({hover: !this.state.hover})
    },
    render: function() {
        var view="";

    if(currentUsername == username)
    {
        if(this.state.edit)
        {
            view= <div key="1">
                    <textarea rows="7" cols="10" className="p-editable profile-about-summary" placeholder="Bio or Summary" name="summary" onChange={this.handleTextChange}  value={this.state.text}></textarea>
                       <div className="row">
                           <div className="col-xs-12  col-lg-2 col-lg-offset-10 col-md-2 col-md-offset-10">
                                 <button  onClick={this.saveSummary} className="btn btn-general" value="">Save</button>
                                 <button  onClick={this.cancelEdit} className="btn btn-general" value="">Cancel</button>
                           </div>

                       </div>
                 </div>
        }
        else
        {
            view=
            <div  key="2" className="row" onClick = {this.editClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                <div className="col-xs-11">
                    <p className="p-noneditable">{this.state.text}</p>
                </div>
                {(this.state.hover)?
                    <div className="col-xs-1">
                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                    </div>: ""
                }

           </div>;
        }
    }
    else
        view= <pre className="p-noneditable">{this.props.summary}</pre>;

        return (
            <div id="resume-summary">

                <div id="resume-summary-item">
                    <div className="resume-item">
                        {view}
                    </div>
                </div>
            </div>
        )
    }

});
var AboutTab_Interests = React.createClass({
    getInitialState: function() {
        var hideInterests;
        if(JSON.parse(this.props.interests).length > 0) { hideInterests = "show"; } else { hideInterests = "hide"; }
        return {
            edit: false,
            beforeChange_interests:this.props.interests,
            interests: this.props.interests,
            hideInterests: hideInterests,
            beforeChangeTags:this.props.tags,
            tags:this.props.tags
        };
    },
    addInterest: function() {
        if (JSON.parse(this.state.interests).length > 0) {
            var result = this.state.interests.substring(0,this.state.interests.length-1) + ',""]';
        }
        else {
            var result = '[""]';
        }
        this.setState({interests:result, hideInterests: "show"});
    },
    handleArrayChange: function(index) {
        var interestsChange = document.getElementById("interests-" + index).value;
        var interestsTemp = JSON.parse(this.state.interests);
        interestsTemp[index] = interestsChange;
        var interestsTemp = JSON.stringify(interestsTemp).replace(/\\\"/g,"'")
        this.setState({interests: interestsTemp});
    },
    deleteArrayChange: function(index) {
        var interestsTemp = JSON.parse(this.state.interests);
        delete interestsTemp[index];
        var interestsTemp = JSON.stringify(interestsTemp).replace(',null','').replace('null,','').replace('null','');
        this.setState({interests: interestsTemp});
        if (JSON.parse(interestsTemp).length == 0) {this.setState({hideInterests: "hide"});}
    },
    handleTagsInputChange: function(e) {
        var changedState = {};

        this.setState({interestsTag:JSON.stringify(e).replace(/\\\"/g,"'"),tags:JSON.stringify(e).replace(/\\\"/g,"'")});
    },
    submitInterests: function() {
        var dataForm = {interests: this.state.interests};
        $.ajax({
            url: path + "/updateInterest",
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
    submitTags: function() {
        var dataForm = {interestsTag: this.state.interestsTag};
        $.ajax({
            url: path + "/updateTags",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log("Submitted!");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        });
        return;
    },
    editClicked:function(){
        this.setState({
            edit:true
        });
        this.toggleHover();
    },
    cancelEdit:function(){
        this.setState({
            interests:this.state.beforeChange_interests,
            tags: this.state.beforeChangeTags,
            edit:false
        });
    },
    save:function(){
        this.submitInterests();
        this.submitTags();
        this.setState({
            beforeChange_interests:this.state.interests,
            beforeChangeTags: this.state.tags,
            edit:false
        });

    },
    toggleHover: function(){
        this.setState({hover: !this.state.hover})
    },
    render: function() {
        var view="";


        if(currentUsername == username)
        {
            if(this.state.edit)
            {
                var interests_data=[];
                if (this.state.interests != "")
                {
                    JSON.parse(this.state.interests).map(function(item, i) {
                        interests_data.push (
                            <div className="about-item-hr">
                                <p className="no-margin display-inline-block">
                                    <input rows="1" type="text" className="r-editable r-editable-full" id={"interests-" + i} name={"interests-" + i} placeholder="Add interest" contentEditable="true" onChange={this.handleArrayChange.bind(this, i)} value={item}/>
                                </p>
                                <div className="div-minus-interests">
                                    <h4 className="no-margin">
                                    <a onClick={this.deleteArrayChange.bind(this, i)} key={i} className="image-link">
                                        <span aria-hidden="true" className="glyphicon glyphicon-minus"></span>
                                    </a>
                                    </h4>
                                </div>
                            </div>);
                    }, this);

                }
               view=<div>
                       <div className="div-absolute"><h3><a onClick={this.addInterest} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div>
                       <div className={"div-relative resume-item " + this.state.hideInterests}>{interests_data}</div>
                       <ReactTagsInput type="text" placeholder="Keywords" name="interests" onChange={this.handleTagsInputChange}  value={JSON.parse(this.state.tags)}/>
                   <div className="row">
                       <div className="col-xs-12  col-lg-2 col-lg-offset-10 col-md-2 col-md-offset-10">
                           <button  onClick={this.save} className="btn btn-general" value="">Save</button>
                           <button  onClick={this.cancelEdit} className="btn btn-general" value="">Cancel</button>
                       </div>

                   </div>
               </div>
            }
            else
            {
                var interests_data=[];
                if (this.state.interests != "")
                {
                    JSON.parse(this.state.interests).map(function(item, i) {
                        interests_data.push (
                            <div className="about-item-hr">
                                <p className="r-noneditable no-margin">{item}</p>
                            </div>);
                    }, this);

                }
               view= <div className="row">
                   <div className="col-xs-11" onClick = {this.editClicked} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
                        <div className={"div-relative resume-item " + this.state.hideInterests}>{interests_data}</div>
                    </div>
                {(this.state.hover)?
                    <div className="col-xs-1">
                        <i className="fa fa-pencil-square-o" aria-hidden="true"></i>
                    </div>: ""
                }
                   <div className="col-xs-12 margin-top-20">{JSON.parse(this.state.tags).map(function(item)
                   {
                       return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>; })
                   }
                   </div>
                   </div>
            }
        }
        else {
            var interests_data=[];
            if (this.state.interests != "")
            {
                JSON.parse(this.state.interests).map(function(item, i) {
                    interests_data.push (
                        <div className="about-item-hr">
                            <p className="r-noneditable no-margin">{item}</p>
                        </div>);
                }, this);

            }
            view = <div>
                <div className={"div-relative resume-item " + this.state.hideInterests}>{interests_data}</div>
                <div className="margin-top-20">{JSON.parse(this.state.tags).map(function (item) {
                    return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>;
                })
                }
                </div>
            </div>
        }

        return (
        <div id="resume-expertise-and-interests" className="div-relative"><hr/>
            <div>
                <h3 className="no-margin-top" >Research Interests</h3>
            </div>
            {view}
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
    deleteObjectChange: function(index) {
        this.setState({action: "delete"}, function(){ this.submitObjectChange() }.bind(this));
        this.props.delete;
    },
    handleObjectChange: function(e) {
        this.setState({[e.target.name]: e.target.value, action: "update"});
    },
    updateChanges: function(){
        this.props.updateChanges();
    },
    submitObjectChange: function(index) {
        var dataForm = {key: this.state.key, field:this.state.field, action: this.state.action, title: this.state.title, major: this.state.major,
                        company: this.state.company, description: this.state.description,
                        start: this.state.start, end: this.state.end, type: this.state.type};
        $.ajax({
            url: path + "/updateWorkEducation",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({data: data}, function(){this.updateChanges()});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/updateWorkEducation", status, err.toString());
            }.bind(this)
        });

        //return;
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
                    {(currentUsername == username) ? <div className="div-minus">
                        <h4>
                            <a onClick={this.deleteObjectChange.bind(this, this.state.key)} key={this.state.key} className="image-link">
                                <span aria-hidden="true" className="glyphicon glyphicon-minus"></span>
                            </a>
                        </h4>
                    </div> : "" }
                    <h5 className="h4-resume-item display-inline-block">
                        <b>{(currentUsername == username) ? <input type="text" className="r-editable r-editable-full" contentEditable="true" name="company" placeholder="Company" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.company}/> : <span  className="no-margin">{this.state.company}</span>}</b>
                        {(currentUsername == username) ? <span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                            <input type="date" name="start" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.start} className="r-editable r-editable-date"/>
                        </span> : (startDate=="") ? <span  className="no-margin workeducationDate"> <b>{endDate}</b> </span>: (endDate=="")?"":<span  className="no-margin workeducationDate">&nbsp;-&nbsp;<b>{endDate}</b> </span>
                            }
                         {(currentUsername == username) ? <span className="r-editable profile_date_editable">to: &nbsp;&nbsp;
                             <input type="date" name="end" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.end} className="r-editable r-editable-date"/>
                         </span> : <span className="no-margin workeducationDate">
                             <b>{startDate} </b>
                         </span>}
                    </h5>

                    <p className="no-margin">
                    {(currentUsername == username) ? <span><input type="text" className="r-editable r-editable-full" contentEditable="true" name="title" placeholder="Position" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.title}/></span>: <span>{this.state.title}</span>}
                    </p>
                        {(currentUsername == username) ? <div className="r-editable-50">
                            <textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleObjectChange} onBlur={this.submitObjectChange}>{this.state.description}</textarea>
                        </div> : <p className="no-margin">{this.state.description}</p>}

                </div>
            )
        } else{ //if field is education, use education placeholders
            return (
                <div className={"about-item-hr relative " + this.state.display} >
                    {(currentUsername == username) ? <div className="div-minus">
                        <h4>
                            <a onClick={this.deleteObjectChange.bind(this, this.state.key)} key={this.state.key} className="image-link">
                                <span aria-hidden="true" className="glyphicon glyphicon-minus"></span>
                            </a>
                        </h4>
                    </div> : "" }
                    <h5 className="h4-resume-item display-inline-block ">
                        <b>{(currentUsername == username) ? <input type="text" className="r-editable r-editable-full" contentEditable="true" name="company" placeholder="Institution" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.company}/> : <span  className="no-margin">{this.state.company}</span>}</b>
                        {(currentUsername == username) ? <span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                            <input type="date" name="start" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.start} className="r-editable r-editable-date"/>
                        </span> : (startDate=="") ? <span  className="no-margin workeducationDate"> <b>{endDate}</b> </span>: (endDate=="")?"":<span  className="no-margin workeducationDate">&nbsp;-&nbsp;<b>{endDate}</b> </span>
                        }
                         {(currentUsername == username) ? <span className="r-editable profile_date_editable">to: &nbsp;&nbsp;
                             <input type="date" name="end" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.end} className="r-editable r-editable-date"/>
                         </span> : <span className="no-margin workeducationDate">
                             <b>{startDate} </b>
                         </span>}
                    </h5>

                    <p className="no-margin">
                    {(currentUsername == username) ? <span><input type="text" className="r-editable r-editable-full" contentEditable="true" name="title" placeholder="Degree" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.title}/></span>: <span>{this.state.title}</span>}
                    {(currentUsername == username) ? <span><input type="text" className="r-editable r-editable-full" contentEditable="true" name="major" placeholder="Major" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.major}/></span> : (this.state.title=="") ? <span>{this.state.major}</span>:(this.state.major=="")?"":<span>, &nbsp;{this.state.major}</span>}
                    </p>
                        {(currentUsername == username) ? <div className="r-editable-50">
                            <textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleObjectChange} onBlur={this.submitObjectChange}>{this.state.description}</textarea>
                        </div> : <p className="no-margin">{this.state.description}</p>}

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
                                <a href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/project/'+item.objectId} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
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
                            {(currentUsername == username) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltip}><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></OverlayTrigger></td> : ""}
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
                        <a href={'/publication/'+item.type+'/'+item.id} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
                        <span className="font-15">
                        <table className="item-box-table-info">
                            <table className="item-box-table-info">
                                <tr><td>Authors: </td><td>{item.contributors.map(function(contributor) {
                                        console.log(contributor);
                                        if (contributor !== null && typeof contributor === 'object') {
                                            return <a href={contributor.link} className="tagsinput-tag-link react-tagsinput-tag">{contributor.label}</a>;
                                        } else {
                                            return <a href={getLinkFromCollaborator(contributor)} className="tagsinput-tag-link react-tagsinput-tag">{getNameFromCollaborator(contributor)}</a>;
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
                    <h3 className="margin-top-bottom-5"><a href={"/publication/" + this.props.objectId} className="body-link"> {title}</a></h3>
                    <span className="font-15">
                    <b>Authors:</b> <a href="#" className="body-link">{this.props.author}</a><br/>
                    <b>Abstract:</b> {this.props.description.substr(0,120)}... <a href={"/publication/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
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
                                <a href={'/model/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/model/'+item.objectId} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
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
                                <a href={'/data/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <h4 className="margin-top-bottom-5">
                                <a href={'/data/'+item.objectId} className="body-link">{item.title}</a>
                                {/*TODO uncomment<SettingsModal delete={self.deleteEntry} path={dataPath} refresh={self.render} />*/}
                            </h4>
                            <span className="font-15">
                            <table className="item-box-table-info">
                                <tr><td><b>Collaborators: </b></td><td>{item.collaborators.map(function(collaborator) {
                                    return <a href={collaborator.link} className="tagsinput-tag-link react-tagsinput-tag">{collaborator.label}</a>;
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
                   {(currentUsername == username) ? (this.props.publication) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltip}><input className="item-add-button-publication" onClick={this.open} type="button" value="+"/></OverlayTrigger></td> :
                       <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltip}><input className="item-add-button" onClick={this.open} type="button" value="+"/></OverlayTrigger></td>  : ""}

                    {(currentUsername == username && this.props.publication) ? <td className="padding-left-5 "><input className="item-add-button-publication" onClick={this.redirect} type="button" value="Import Publications"/></td> : ""}
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
                <p style={{textAlign: 'center'}}><img className="loading-bar" src="../images/loadingbar.gif"/>
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


var Education_Object = React.createClass({
    getInitialState() {
        return {
            id:'',
            institution: '',
            start: null,
            end: null,
            degree: '',
            major: '',
            description: ''
        };
    },

    handleChange(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    updateState(type,obj)
    {
        console.log(obj);
       //TODO: INJA budi dashti check mikardi chi tu obj has. Vaghti az server educationa miad bayad be forme obj bashe ke beshe populate kard.
       //TODO: Ehtemalan bayad servero taghir bedi ke be in format befreste. kole etelaate company bayad biad
       //TODO: add/remove bayad neveshte beshe, edit/view mode ham bayad neveshte beshe
        this.setState( {institution:obj} );

    },
    next() {
        // Send education to server
        var education = {institution: this.state.institution, start_date: this.state.start, end_date: this.state.end,
            faculty: this.state.major, description: this.state.description, degree: this.state.degree};
        $.ajax({
            url: '/education',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(education),
            success: function(status) {
                console.log("Updated education");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/post education", status, err.toString(), xhr);
            }.bind(this)
        });
    },

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 " >
                        <div id="resume-education" className="div-relative">
                            <div className="h4-resume-item display-inline-block ">
                                <SearchInput name="institution" placeholder="Latest School" updateState={this.updateState}  />
								<span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                                    <input type="date" name="start" onChange={this.handleChange} value={this.state.start} className="r-editable r-editable-date"/>
								</span>
								<span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
                                    <input type="date" name="end" onChange={this.handleChange} value={this.state.end} className="r-editable r-editable-date"/>
								</span>
                                <span><input type="text" className="r-editable r-editable-full" name="degree" placeholder="Degree" onChange={this.handleChange} value={this.state.degree}/></span>
                                <span><input type="text" className="r-editable r-editable-full" name="major" placeholder="Major" onChange={this.handleChange} value={this.state.major}/></span>
                                <textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleChange} value={this.state.description}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var SearchInput = React.createClass({
    getInitialState: function() {
        return {
            value: '',
            data: [],
            ajaxTimer: null
        };
    },
    componentWillMount: function() {
        this.state.ajaxTimer = setTimeout(this.inputChange, 60000);
        clearTimeout(this.state.ajaxTimer);
    },
    inputChangeWrapper: function(inputValue) {
        clearTimeout(this.state.ajaxTimer);
        this.state.ajaxTimer = setTimeout(this.inputChange.bind(null, inputValue), 200);
    },
    inputChange: function(inputValue) {
        this.state.data = [];
        if (inputValue.length <= 0) return;
        var newValue= {label: inputValue, value: inputValue, category: "Organizations", imgsrc: null, link: null, objectId: null, buttonText: null};
        this.setState({value: newValue});
        this.props.updateState(this.props.name,newValue);

        var that = this;
        var str = inputValue;
        var r = [];
        $.when(

            $.ajax({
                url: '/allorganizations',
                dataType: 'json',
                type: 'POST',
                data: {substr: str, limit: 5},
                cache: false,
                success: function(data) {
                    $.map(data, function(item){
                        var dlink = "/organization/" + item.name;
                        r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
                    });
                },
                error: function(xhr) {
                    console.log(xhr.status);
                }
            })
        ).then(function() {
                that.setState({data: r});
            });
    },
    updateValue (newValue) {
        this.setState({
            value: newValue
        });
        //pass it to the parent
        this.props.updateState(this.props.name,newValue);
    },

    preventDefault: function(link, event) {
        event.preventDefault();
        event.stopPropagation();
        // window.location.href = link;
    },
    truncate: function(str) {
        if (str.length >= 45) {
            return str.substring(0, 45) + "...";
        } else {
            return str;
        }
    },
    onBlurHandler: function(event) {
    },
    getOptions: function(input, callback) {
        var that = this;
        var str = input;
        var r = [];
        $.when(
            $.ajax({
                url: '/allorganizations',
                dataType: 'json',
                type: 'POST',
                data: {substr: str},
                cache: false,
                success: function(data) {
                    $.map(data, function(item){
                        var dlink = "/organization/" + item.name;
                        r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
                    });
                },
                error: function(xhr) {
                    console.log(xhr.status);
                }
            })
        ).then(function() {
                callback(
                    null, {
                        options: r
                    }
                );
                that.setState({data: r});
            });
    },
    render: function () {
        return (
            <div>
                <div >
                    <Select
                        placeholder={this.props.placeholder}
                        options={this.state.data}
                        value={this.state.value}
                        onInputChange={this.inputChangeWrapper}
                        onChange={this.updateValue}
                        onBlurResetsInput={false}
                        onBlur={this.onBlurHandler} />
                </div>
            </div>
        )
    }
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

