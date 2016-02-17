Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Profile = React.createClass ({
    getInitialState: function() {
      return { showModal: false,
            username: [username],
            profile_imgURL: [profile_imgURL],

            fromModelTab: false,
            pictureChosen: null,

            picture: null, pictureType: '', status: ''
      };
    },
    clickOpen() {
      this.setState({ showModal: true });
    },
    clickClose() {
      this.setState({ showModal: false});
    },
    openFileUpload() {
	    var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);

        this.state.fileChosen.on('fileselect', function(event, numFiles, label) {
            console.log(numFiles);
            console.log(label);
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
        var randomNumber = Math.floor(Math.random() * 100000000);
        var dataForm = {picture: this.state.picture, pictureType: this.state.pictureType, randomNumber: randomNumber};
        var changeImgURL = "https://s3-us-west-2.amazonaws.com/syncholar/" + this.state.username + "_profile_picture_" + randomNumber + "." + this.state.pictureType;

        var $this = this;
        $.ajax({
            url: path + "/picture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            success: function(status) {
                console.log(status);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/picture", status, err.toString());
            }.bind(this)
        }).then(function(){
            $this.clickClose();
            $this.setState({profile_imgURL:changeImgURL});
        });
    },
    componentWillMount: function() {
      var connectURL= "/profile/"+objectId+"/connection-status";

      $.ajax({
        url: connectURL,
        success: function(status) {
            console.log(status);
            this.setState({status: status})
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    clickConnect: function() {
      var connectURL= "/profile/"+objectId+"/connect";

      $.ajax({
        url: connectURL,
        success: function(status) {
            this.setState({status: "pending"});
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
            this.setState({status: "connect"});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("Couldn't retrieve people.");
        }.bind(this)
      });
    },
    render: function() {
        var connectButton = <input className="btn btn-panel btn-right-side" value="" />;
        if (this.state.status == "connected") {
             connectButton = <input onClick={this.clickDisconnect} className="btn btn-panel btn-right-side" value="Disconnect" />;
        }
        else if (this.state.status == "pending") {
             connectButton = <input className="btn btn-panel btn-right-side" value="Pending" />;
        }
        else if (this.state.status == "not-connected") {
             connectButton = <input onClick={this.clickConnect} className="btn btn-panel btn-right-side" value="Connect" />;
        }
        else { console.log("Nothing"); }
        return (
        <div>
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
                    <input className="publication-button" type="submit" value="Submit" onClick={this.handleSubmitData} />
                  </Modal.Footer>
                </Modal>
        <div className="item-top item-top-container">
        </div>
        <div className="content-wrap">
            <div>
                <div className="item-top-1 col" id="overlay">
                    {(currentUsername == username) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.profile_imgURL} className="contain-image" /><div className="edit-overlay-background"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={profile_imgURL} className="contain-image" />}
                </div>
            </div>
            <div className="item-bottom">
                <div className="item-bottom-1">
                    <div className="side-panel"><h5>{fullname}</h5><br/>{position}</div>
                    {(currentUsername == username) ? "" : <div className="item-panel-empty contain-panel-empty">{connectButton}<input className="btn btn-panel" value="Follow" /></div> }
                    {/*
                    <div className="item-panel contain-panel"><h5>{position} @</h5><br/>
                        {this.props.locations.map(function(listValue){
                            return <a href="#" className="body-link">{listValue}<br/></a>;
                        })}
                    </div>
                    <div className="item-panel contain-panel"><h5>Other Roles</h5><br/>
                        {this.props.roles.map(function(listValue){
                            return <a href="#" className="body-link">{listValue}<br/></a>;
                        })}
                    </div>
                    <div className="item-panel contain-panel"><h5>Groups & Networks</h5><br/>
                        {this.props.connections.map(function(listValue){
                            return <a href="#" className="body-link">{listValue}<br/></a>;
                        })}
                    </div>
                    <div className="item-panel contain-panel"><h5>Expertise</h5><br/>
                        {this.props.expertise.map(function(listValue){
                            return <a href="#" className="body-link">{listValue}<br/></a>;
                        })}
                    </div>
                    */}
                </div>
                <div id="item-bottom-2-profile" className="item-bottom-2">
                     <ProfileMenu tabs={['About','Connections','Organizations', 'Equipments', 'Projects', 'Publications', 'Data', 'Models']} />
                </div>
                <div className="item-bottom-3">
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
                3: <Equipments objectId={objectId}/>,
                4: <Projects objectId={objectId}/>,
                5: <Publications objectId={objectId}/>,
                6: <Data objectId={objectId}/>,
                7: <Models objectId={objectId}/>
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
                        return <li id={style}>
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
        return {data: []};
    },
    componentDidMount : function(){
        var peopleUrl= "/profile/"+objectId+"/connections";

        $.ajax({
            url: peopleUrl,
            success: function(data) {

                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        });
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
                    <div className="item-box">
                        <div key={person.username} id="item-list" className="row">
                                <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="contain-icons" /></a>
                                <a href={'/profile/'+person.username} className="body-link"><h3 className="margin-top-bottom-5">{person.fullname}</h3></a>
                                <span className="font-15">{person.workTitle} @ {person.company}</span>
                        </div>
                    </div>
                    )}
                </div>
            );
        });
        return (
            <div>
                {peopleList}
            </div>
        )
    }
});

var Organizations = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        var orgUrl= "/profile/"+objectId+"/organizations";

        $.ajax({
            url: orgUrl,
            success: function(data) {

                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve orgs");
            }.bind(this)
        });
    },
    render: function() {

        var orgList = $.map(this.state.data,function(org) {

            return (
                <div className="item-box">
                    <div key={org.orgId} id="item-list" className="row">
                        <a href={'/organization/'+org.orgId}><img src={org.orgImgUrl} className="contain-icons" /></a>
                        <a href={'/organization/'+org.orgId} className="body-link"><h3 className="margin-top-bottom-5">{org.name}</h3></a>
                        <span className="font-15">{org.location}</span>
                    </div>
                </div>
            );
        });
        return (
            <div>
                {orgList}
            </div>
        )
    }
});

var About = React.createClass({
    mixins: [ParseReact.Mixin],
    observe: function() {
        return {
            publications: (new Parse.Query('Publication').equalTo("user", {__type: "Pointer",
                                                                           className: "_User",
                                                                           objectId: objectId}).limit(2)),
            datas: (new Parse.Query('Data').equalTo("user", {__type: "Pointer",
                                                                           className: "_User",
                                                                           objectId: objectId}).limit(2)),
            models: (new Parse.Query('Model').equalTo("user", {__type: "Pointer",
                                                                           className: "_User",
                                                                           objectId: objectId}).limit(2))
        };
    },
    getInitialState: function() {
        return {
            summary: summary,
            work_experiences: work_experiences,
            educations: educations,
            projects: projects,
            expertise: expertise,
            interests: interests
            };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
    },
    submitChange: function() {
        var dataForm = {summary: this.state.summary};

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
    deleteArrayChange: function(index) {
        var expertiseTemp = JSON.parse(this.state.expertise);
        delete expertiseTemp[index];
        var expertiseTemp = JSON.stringify(expertiseTemp).replace(',null','').replace('null,','');
        this.setState({expertise: expertiseTemp}, function(){ this.submitArrayChange() }.bind(this));
    },
    handleArrayChange: function(index) {
        var expertiseChange = document.getElementById("expertise-" + index).value;
        console.log(expertiseChange);
        var expertiseTemp = JSON.parse(this.state.expertise);
        expertiseTemp[index] = expertiseChange;
        var expertiseTemp = JSON.stringify(expertiseTemp);
        this.setState({expertise: expertiseTemp});
    },
    handleTagsInputChange: function(e) {
        var interestsSubmit = (JSON.stringify(e));
        this.setState({interests:interestsSubmit}, function(){ this.submitArrayChange() }.bind(this));
    },
    submitArrayChange: function() {
        var dataForm = { expertise: this.state.expertise, interests: this.state.interests };

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
    submitObjectChange: function() {
        var dataForm = { work_experiences: this.state.work_experiences,
                         educations: this.state.educations,
                         projects: this.state.projects };

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
    addEI: function() {
        if (this.state.expertise != "") { var result = this.state.expertise.substring(0,this.state.expertise.length-1) + ',"Add Another Expertise!"]'; }
        else { var result = '["Add An Expertise!"]'; }
        this.setState({expertise:result});
        console.log(result);
    },
    addWE: function() {
        var randomNumber = Math.floor(Math.random() * 100000000);
        if (this.state.work_experiences == "") { var arrayWE = [{company:"Organization Name",description:"Work Description",end:"yyyy-MM-dd",key: randomNumber,start:"yyyy-MM-dd",title:"Work Position"}]; }
        else { var newWE = {company:"Organization Name",description:"Work Description",end:"yyyy-MM-dd",key: randomNumber,start:"yyyy-MM-dd",title:"Work Position"};
               var arrayWE = JSON.parse(this.state.work_experiences); arrayWE.push(newWE); }
        this.setState({work_experiences:JSON.stringify(arrayWE)}, function(){ this.submitObjectChange() }.bind(this));
        console.log(work_experiences);
    },
    addE: function() {
        var randomNumber = Math.floor(Math.random() * 100000000);
        if (this.state.educations == "") { var arrayWE = [{company:"Organization Name",description:"Education Description",end:"yyyy-MM-dd",key:randomNumber,start:"yyyy-MM-dd",title:"Major / Degree"}]; }
        else { var newWE = {company:"Organization Name",description:"Education Description",end:"yyyy-MM-dd",key:randomNumber,start:"yyyy-MM-dd",title:"Major / Degree"};
               var arrayWE = JSON.parse(this.state.educations); arrayWE.push(newWE); }
        this.setState({educations:JSON.stringify(arrayWE)}, function(){ this.submitObjectChange() }.bind(this));
        console.log(educations);
    },
    addP: function() {
        var randomNumber = Math.floor(Math.random() * 100000000);
        if (this.state.projects == "") { var arrayWE = [{company:"Project Name",description:"Project Description",end:"yyyy-MM-dd",key:randomNumber,start:"yyyy-MM-dd",title:"Project Position"}]; }
        else { var newWE = {company:"Project Name",description:"Project Description",end:"yyyy-MM-dd",key:randomNumber,start:"yyyy-MM-dd",title:"Project Position"};
               var arrayWE = JSON.parse(this.state.projects); arrayWE.push(newWE); }
        this.setState({projects:JSON.stringify(arrayWE)}, function(){ this.submitObjectChange() }.bind(this));
        console.log(projects);
    },
    tabChange: function(index) {
        this.props.tab(index);
    },
    render: function() {
        var work_experiences_data = [];
        var educations_data = [];
        var projects_data = [];
        var expertise_data = [];
        var publications_data = [];
        var datas_data = [];
        var models_data = [];
        if (this.state.work_experiences != "") {
            var WEItems = JSON.parse(this.state.work_experiences);
            WEItems.forEach(function(item) {
                work_experiences_data.push(<AboutTabObject identifier={item.key} title={item.title} company={item.company} description={item.description} start={item.start} end={item.end} type="work_experience" />);
            });
        }
        if (this.state.educations != "") {
            var EItems = JSON.parse(this.state.educations);
            EItems.forEach(function(item) {
                educations_data.push(<AboutTabObject identifier={item.key} title={item.title} company={item.company} description={item.description} start={item.start} end={item.end} type="education" />);
            });
        }
        if (this.state.projects != "") {
            var PItems = JSON.parse(this.state.projects);
            PItems.forEach(function(item) {
                projects_data.push(<AboutTabObject identifier={item.key} title={item.title} company={item.company} description={item.description} start={item.start} end={item.end} type="project" />);
            });
        }
        if (this.state.expertise != "") {
            JSON.parse(this.state.expertise).map(function(item, i) {
               expertise_data.push (<div className="div-relative">
                        {(currentUsername == username) ? <div className="div-minus"><h4><a onClick={this.deleteArrayChange.bind(this, i)} key={i} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-minus"></span></a></h4></div> : "" }
                        {(currentUsername == username) ? <p className="no-margin"><textarea rows="1" type="text" className="r-editable r-editable-full" id={"expertise-" + i} name={"expertise-" + i} contentEditable="true" onChange={this.handleArrayChange.bind(this, i)} onBlur={this.submitArrayChange}>{item}</textarea></p> : <p className="r-noneditable no-margin">{item}</p>}
                     </div>);
            }, this)
        }
        this.data.publications.map(function(publication) {
            publications_data.push(<Publication objectId={publication.objectId} author={publication.author} title={publication.title} description={publication.description} publication_code={publication.publication_code} />);
        })
        this.data.datas.map(function(item) {
            datas_data.push(<DatumListItem objectId={item.objectId}
                                   collaborators={item.collaborators}
                                   title={item.title}
                                   image_URL={item.image_URL}
                                   keywords={item.keywords}
                                   number_cited={item.number_cited}
                                   number_syncholar_factor={item.number_syncholar_factor}
                                   license={item.license}
                                   access={item.access}
                                   abstract={item.description} />);
        })
        this.data.models.map(function(model) {
            models_data.push(<ModelListItem objectId={model.objectId}
                                   collaborators={model.collaborators}
                                   title={model.title}
                                   image_URL={model.image_URL}
                                   keywords={model.keywords}
                                   number_cited={model.number_cited}
                                   number_syncholar_factor={model.number_syncholar_factor}
                                   license={model.license}
                                   access={model.access}
                                   abstract={model.abstract} />);
        })
        return (
            <div id="resume">
                <div id="resume-summary">
                <div>
                    <h3 className="summary-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-info-sign"></span> Summary</h3>
                </div>
                <div id="resume-summary-item">
                    {(currentUsername == username) ? <p className="no-margin"><input type="text" className="p-editable" name="summary" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.summary} /></p> : <p className="p-noneditable">{this.state.summary}</p>}
                </div>
                </div>
                <div id="resume-expertise-and-interests" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" ><span aria-hidden="true" className="glyphicon glyphicon-certificate"></span> Expertise & Interests</h3>
                    </div>
                    {(currentUsername == username) ? <div className="div-absolute"><h3><a onClick={this.addEI} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div> : ""}
                    {expertise_data}
                    <hr className="margin-top-bottom-5"/>
                    {(currentUsername == username) ? <div>{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Interests (Enter Separated)", className: "l-editable-input", name: "interests", onChange : this.handleTagsInputChange, value : JSON.parse(this.state.interests)}))}</div> : <div>{JSON.parse(this.state.interests).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>; })}</div> }
                </div>
                <div className="clear"></div>
                <div id="resume-education" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" ><span aria-hidden="true" className="glyphicon glyphicon-paperclip"></span> Education</h3>
                    </div>
                    {(currentUsername == username) ? <div className="div-absolute"><h3><a onClick={this.addE} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div> : ""}
                    {educations_data}
                </div>
                <div id="resume-experience" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" ><span aria-hidden="true" className="glyphicon glyphicon-education"></span> Work Experience</h3>
                    </div>
                    {(currentUsername == username) ? <div className="div-absolute"><h3><a onClick={this.addWE} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div> : ""}
                    {work_experiences_data}
                </div>
                <div id="resume-projects" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-star"></span> Projects</h3>
                    </div>
                    {(currentUsername == username) ? <div className="div-absolute"><h3><a onClick={this.addP} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-plus"></span></a></h3></div> : ""}
                    {projects_data}
                </div>
                <div id="resume-publications" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-book"></span> Publications</h3>
                    </div>
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,3)} className="body-link">See More</a></h3></div>
                    {publications_data}
                </div>
                <div className="clear"></div>
                <div id="resume-datas" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-stats"></span> Data</h3>
                    </div>
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,4)} className="body-link">See More</a></h3></div>
                    {datas_data}
                </div>
                <div className="clear"></div>
                <div id="resume-models" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-blackboard"></span> Models</h3>
                    </div>
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,5)} className="body-link">See More</a></h3></div>
                    {models_data}
                </div>
            </div>
        )
    }
});
var AboutTabObject = React.createClass({
    mixins: [ParseReact.Mixin],
    getInitialState: function() {
        return {
            key: this.props.identifier,
            title: this.props.title,
            company: this.props.company,
            description: this.props.description,
            start: this.props.start,
            end: this.props.end,
            data: this.props.data,
            type: this.props.type,
            action: "",

            display: ""
            };
    },
    observe: function() {
        return {
        organization: (new Parse.Query('Organization').equalTo("name", this.state.company))
        };
    },
    deleteObjectChange: function(index) {
        this.setState({display: "deleted"});
        this.setState({action: "delete"}, function(){ this.submitObjectChange() }.bind(this));
    },
    handleObjectChange: function(e) {
        this.setState({[e.target.name]: e.target.value, action: "update"});
    },
    submitObjectChange: function(index) {
        var dataForm = {key: this.state.key, action: this.state.action, title: this.state.title,
                        company: this.state.company, description: this.state.description,
                        start: this.state.start, end: this.state.end, type: this.state.type};

        console.log(dataForm);

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
    render: function() {
        var startDate = this.props.start.replace(/-/g,'/');
        var endDate = this.props.end.replace(/-/g,'/');
        return(
            <div className={this.state.display}>
            <div className="resume-item div-relative">
                {(currentUsername == username) ? <div className="div-minus"><h4><a onClick={this.deleteObjectChange.bind(this, this.state.key)} key={this.state.key} className="image-link"><span aria-hidden="true" className="glyphicon glyphicon-minus"></span></a></h4></div> : "" }
                <h4 className="h4-resume-item">
                    <b>{(currentUsername == username) ? <input type="text" className="r-editable" contentEditable="true" name="title" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.title}/> : <span className="r-noneditable">{this.state.title}</span>}
                     @ {(currentUsername == username) ? <input type="text" className="r-editable r-editable-50" contentEditable="true" name="company" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.company}/> : <span  className="no-margin">{this.state.company}</span>}
                    </b></h4>
                    <p className="no-margin">&nbsp;(&nbsp;{(currentUsername == username) ? <input type="date" name="start" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.start} className="r-editable r-editable-date"/> : <span className="no-margin">{startDate}</span>}
                    &nbsp;-&nbsp;{(currentUsername == username) ? <input type="date" name="end" onChange={this.handleObjectChange} onBlur={this.submitObjectChange} value={this.state.end} className="r-editable r-editable-date"/> : <span  className="no-margin">{endDate}</span>}&nbsp;)</p>
                {(currentUsername == username) ? <p className="no-margin"><textarea type="text" className="r-editable r-editable-full" name="description" onChange={this.handleObjectChange} onBlur={this.submitObjectChange}>{this.state.description}</textarea></p> : <p className="p-noneditable no-margin">{this.state.description}</p>}
            </div>
            </div>
        )
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

var Equipments = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false };
    },
    componentWillMount : function() {
        var equipmentsURL= "/profile/"+objectId+"/equipments_list";

        $.ajax({
            type: 'GET',
            url: equipmentsURL,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Equipments!");
            }.bind(this)
        });
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(item) {
            console.log(item);
            return (
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <a href={'/equipment/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                        </div>
                        <div className="item-box-right">
                            <a href={'/equipment/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">{item.description}</span>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>New Equipment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Modal.Title>To Be Determined!</Modal.Title>
                    </Modal.Body>
                </Modal>
                <table className="item-search-field" width="100%">
                    <tr>
                        <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                        {(currentUsername == username) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></td> : ""}
                    </tr>
                </table>
                {itemsList}
            </div>
        )
    }
});

var Projects = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var projectsURL= "/profile/"+objectId+"/projects_list";

        $.ajax({
            type: 'GET',
            url: projectsURL,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Projects!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(item) {
            console.log(item);
            return (
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <a href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                        </div>
                        <div className="item-box-right">
                            <a href={'/project/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">{item.description}</span>
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
                    <Modal.Body>
                        <Modal.Title>To Be Determined!</Modal.Title>
                    </Modal.Body>
                </Modal>
                <table className="item-search-field" width="100%">
                    <tr>
                        <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                        {(currentUsername == username) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></td> : ""}
                    </tr>
                </table>
                {itemsList}
            </div>
        )
    }
});

var creator = ParseReact.Mutation.Create('Organization', {
   name: 'DDD'
});
creator.dispatch({waitForServer: 'false'});

var PublicationForm = React.createClass({
  getInitialState: function() {
    return { showModal: false,
    		 formFeedback: '',
             step : 1,
             type : 1,
             pubFile : null,
             pubFileExt : "",
             txtTitle : "",
             txtAuthors : [fullname],
             txtEditors : [],
             txtPublishPartner : "",
             txtPublishDate : "",
             txtInput1 : "",
             txtInput2 : "",
             txtInput3 : "",
             txtAbstract : "",
             txtKeywordsTags : [],
             txtURL : "",
             txtDOI : "",
             txtTags: [],
             txtPrivacy: [] };
  },
  clickOpen() {
    this.setState({ showModal: true });
  },
  clickClose() {
    this.setState({ showModal: false, step : 1 });
  },
  clickBack: function(currentStep) {
    this.setState({ step: currentStep - 1 });
  },
  clickContinue: function(currentStep) {
    this.setState({ step: currentStep + 1 });
  },
  clickSubmit: function() {
//  NOTE: ParseReact POSTing might not work atm due to versioning issues (see commit msg). Using regular Ajax.
//     var creator = ParseReact.Mutation.Create('Publication', {
//       title: this.state.title,
//       author: this.state.txtAuthors[0],
//       description: this.state.txtAbstract,
//       filename: "",
//       groups: this.state.txtPrivacy,
//       keywords: this.state.txtKeywordsTags,
//       hashtags: this.state.txtTags,
//       license: "Testtt",
//       publication_link: "why.jpg"
//     });
//
//     // ...and execute it
//     creator.dispatch();
	var isValidForm = this.validateForm();
	if (isValidForm.length === 0) {
		var pubForm = {  title: this.state.txtTitle,
					  author: this.state.txtAuthors[0],
					  description: this.state.txtAbstract,
					  publishDate: this.state.txtPublishDate,
					  groups: this.state.txtPrivacy,
					  keywords: this.state.txtKeywordsTags,
					  hashtags: this.state.txtTags,
					  license: "Testtt",
					  publication_link: "why.jpg",
					  file: this.state.pubFile,
					  fileType: this.state.pubFileExt };

		$.ajax({
		 url: path + "/publication",
		 dataType: 'json',
		 contentType: "application/json; charset=utf-8",
		 type: 'POST',
		 data: JSON.stringify(pubForm),
		 processData: false,
		 success: function(data) {
			 this.setState({data: data});
		 }.bind(this),
		 error: function(xhr, status, err) {
			console.error(path + "/publication", status, err.toString());
		 }.bind(this)
		});
	} else {
		var message = 'Publication could not be added: ';
		if (isValidForm.indexOf('REQUIRED') > -1) {
			message += ' Please check that all required fields are filled in.';
		}
		if (isValidForm.indexOf('FILE') > -1) {
			message += ' Please upload a file.';
		}
		this.setState({formFeedback: message});
	}
  },
  	validateForm: function() {
  		var issues = []
  		if (!this.state.txtTitle.trim() || !this.state.txtAuthors || !this.state.txtKeywordsTags || !this.state.txtPublishDate) {
  			issues.push("REQUIRED");
  		}
  		if (!this.state.pubFile) {
  			issues.push("FILE");
  		}
  		return issues;
  	},
  title: function(e) {
    this.setState({ txtTitle : e.target.value })
  },
  authors: function(e) {
    this.setState({ txtAuthors : e })
 },
  editors: function(e) {
    this.setState({ txtEditors : e })
  },
  publishPartner: function(e) {
    this.setState({ txtPublishPartner : e.target.value })
  },
  publishDate: function(e) {
    this.setState({ txtPublishDate : e.target.value })
  },
  input1: function(e) {
    this.setState({ txtInput1 : e.target.value })
  },
  input2: function(e) {
    this.setState({ txtInput2 : e.target.value })
  },
  input3: function(e) {
    this.setState({ txtInput3 : e.target.value })
  },
  abstract: function(e) {
    this.setState({ txtAbstract : e.target.value })
  },
  keywordsTags: function(e) {
    this.setState({ txtKeywordsTags : e })
  },
  URL: function(e) {
    this.setState({ txtURL : e.target.value })
  },
  DOI: function(e) {
    this.setState({ txtDOI : e.target.value })
  },
  tags: function(e) {
    this.setState({ txtTags : e })
  },
  privacy: function(e) {
    this.setState({ txtPrivacy : e })
  },
  pubUpload: function(e) {
    console.log('hello there');
    var self = this;
    var reader = new FileReader();
    var file = e.target.files[0];
    var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

    reader.onload = function(upload) {
      self.setState({
        pubFile: upload.target.result,
        pubFileExt: extension,
      });
    }
    reader.readAsDataURL(file);
  },
  render: function() {
    var self = this;
    var stepMap = {1: <Step1 title={this.title} txtTitle={this.state.txtTitle}
                             pubUpload={this.pubUpload} pubFile={this.state.pubFile} pubFileExt={this.state.pubFileExt}
                             authors={this.authors} txtAuthors={this.state.txtAuthors}
                             editors={this.editors} txtEditors={this.state.txtEditors}
                             publishPartner={this.publishPartner} txtPublishPartner={this.state.txtPublishPartner}
                             publishDate={this.publishDate} txtPublishDate={this.state.txtPublishDate}
                             input1={this.input1} txtInput1={this.state.txtInput1}
                             input2={this.input2} txtInput2={this.state.txtInput2}
                             input3={this.input3} txtInput3={this.state.txtInput3}
                             abstract={this.abstract} txtAbstract={this.state.txtAbstract}
                             keywordsTags={this.keywordsTags} txtKeywordsTags={this.state.txtKeywordsTags}
                             URL={this.URL} txtURL={this.state.txtURL}
                             DOI={this.DOI} txtDOI={this.state.txtDOI} />,
                   2: <Step2 tags={this.tags} txtTags={this.state.txtTags}
                             privacy={this.privacy} txtPrivacy={this.state.txtPrivacy}/>,
                   3: <Step3 title={this.state.txtTitle}
                             authors={this.state.txtAuthors}
                             editors={this.state.txtEditors}
                             publishPartner={this.state.txtPublishPartner}
                             publishDate={this.state.txtPublishDate}
                             input1={this.state.txtInput1}
                             input2={this.state.txtInput2}
                             input3={this.state.txtInput3}
                             abstract={this.state.txtAbstract}
                             keywordsTags={this.state.txtKeywordsTags}
                             URL={this.state.txtURL}
                             DOI={this.state.txtDOI}
                             tags={this.state.txtTags}
                             privacy={this.state.txtPrivacy} />,
                   4: <Step4 />};
    return (
      <div className="">
            <form id="publication-form" action="" method="" novalidate="" enctype="multipart/form-data" className="publication-form">
                <table id="upload-field" width="100%"><tr>
                    <td>
                    <input type="text" id="search" placeholder="Search..." className="form-control"/>
                    </td>
                    {(currentUsername == username) ? <td className="padding-left-5"><input className="publication-button" onClick={this.clickOpen} type="button" value="+"/></td> : ""}
                </tr>
                </table>
                 <Modal show={this.state.showModal} onHide={this.clickClose}>
                  <Modal.Header closeButton>
                    <Modal.Title>New Publication</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    {stepMap[self.state.step]}
                  </Modal.Body>
                  <Modal.Footer>
                    <table id="form-submit" width="100%"><tr>
                      <td className="padding-right fifty-fifty">
                        {this.state.step == 1 || this.state.step == 4 ? <div></div> : <input className="publication-button" type="submit" value="Back" onClick={this.clickBack.bind(self, this.state.step)}/>}
                      </td>
                      <td className="padding-left fifty-fifty">
                        {this.state.step == 3 || this.state.step == 4 ? <div></div> : <input className="publication-button" type="submit" value="Next" onClick={this.clickContinue.bind(self, this.state.step)} />}
                        {this.state.step != 3 ? <div></div> : <input className="publication-button" type="submit" value="Submit" onClick={this.clickSubmit} />}
                        {this.state.step != 4 ? <div></div> : <input className="publication-button" type="submit" value="Close" onClick={this.clickClose} />}
                      </td>
                    </tr></table>

      				<div style={{textAlign:'center'}}>{this.state.formFeedback}</div>
                  </Modal.Footer>
                </Modal>
            </form>
      </div>
    )
  }
});

var Step1 = React.createClass({
  render: function() {
    return (
      <div>
      <div className="breadcrumb flat">
            <a href="#" className="active">General Info</a>
            <a href="#">Extra Info</a>
            <a href="#">Check Info</a>
            <a href="#">Completion!</a>
        </div>
        <PublicationType     title={this.props.title} txtTitle={this.props.txtTitle}
                             pubUpload={this.props.pubUpload} pubFile={this.props.pubFile} pubFileExt={this.props.pubFileExt}
                             authors={this.props.authors} txtAuthors={this.props.txtAuthors}
                             editors={this.props.editors} txtEditors={this.props.txtEditors}
                             publishPartner={this.props.publishPartner} txtPublishPartner={this.props.txtPublishPartner}
                             publishDate={this.props.publishDate} txtPublishDate={this.props.txtPublishDate}
                             input1={this.props.input1} txtInput1={this.props.txtInput1}
                             input2={this.props.input2} txtInput2={this.props.txtInput2}
                             input3={this.props.input3} txtInput3={this.props.txtInput3}
                             abstract={this.props.abstract} txtAbstract={this.props.txtAbstract}
                             keywordsTags={this.props.keywordsTags} txtKeywordsTags={this.props.txtKeywordsTags}
                             URL={this.props.URL} txtURL={this.props.txtURL}
                             DOI={this.props.DOI} txtDOI={this.props.txtDOI}/>

      </div>
    )
  }
});
var Step2 = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#" className="active">Extra Info</a>
            <a href="#">Check Info</a>
            <a href="#">Completion!</a>
        </div>
        <div id="field1-container" className="form-group">
         {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Please Provide Tags That Describe Your Publication", onChange : this.props.tags, defaultValue : this.props.txtTags}))}
        </div>
        <div id="field2-container" className="form-group">
          {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Please Provide Who Can View Your Publication", onChange : this.props.privacy, defaultValue : this.props.txtPrivacy}))}
        </div>
      </div>
    )
  }
});
var Step3 = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#">Extra Info</a>
            <a href="#" className="active">Check Info</a>
            <a href="#">Completion!</a>
        </div>
        <table className="summary"><tr><td>
        <b><Required content="*"/>Title:</b> { this.props.title } <br/>
        <b><Required content="*"/>Authors:</b> { this.props.authors } <br/>
        <b>Editors:</b> { this.props.editors } <br/>
        <b>Publisher:</b> { this.props.publishPartner } <br/>
        <b><Required content="*"/>Publishing Date:</b> { this.props.publishDate } <br/>
          - { this.props.input1 } <br/>
          - { this.props.input2 } <br/>
          - { this.props.input3 } <br/>
        <b>Abstract:</b> { this.props.abstract } <br/>
        <b><Required content="*"/>Keywords:</b> { this.props.keywordsTags } <br/>
        <b>URL:</b> { this.props.URL } <br/>
        <b>DOI:</b> { this.props.DOI } <br/>
        <b>Tags:</b> { this.props.tags } <br/>
        <b>Privacy:</b> { this.props.privacy }
        </td></tr></table>
      </div>
    )
  }
});
var Step4 = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#">Extra Info</a>
            <a href="#">Check Info</a>
            <a href="#" className="active">Completion!</a>
        </div>
        <h3>Congrats! Completed!</h3>
            <a href="#">Click here to view your publication!</a>
      </div>
    )
  }
});


var PublicationType = React.createClass ({
    getInitialState: function() {
        return { type: 1 };
    },
    change: function(event) {
        this.setState({type: event.target.value});
    },
    render: function() {
        var self = this;
        var publicationType = {1: <PublicationBook title={this.props.title} txtTitle={this.props.txtTitle}
                                                 pubUpload={this.props.pubUpload} pubFile={this.props.pubFile} pubFileExt={this.props.pubFileExt}
                                                 authors={this.props.authors} txtAuthors={this.props.txtAuthors}
                                                 editors={this.props.editors} txtEditors={this.props.txtEditors}
                                                 publishPartner={this.props.publishPartner} txtPublishPartner={this.props.txtPublishPartner}
                                                 publishDate={this.props.publishDate} txtPublishDate={this.props.txtPublishDate}
                                                 input1={this.props.input1} txtInput1={this.props.txtInput1}
                                                 input2={this.props.input2} txtInput2={this.props.txtInput2}
                                                 input3={this.props.input3} txtInput3={this.props.txtInput3}
                                                 abstract={this.props.abstract} txtAbstract={this.props.txtAbstract}
                                                 keywordsTags={this.props.keywordsTags} txtKeywordsTags={this.props.txtKeywordsTags}
                                                 URL={this.props.URL} txtURL={this.props.txtURL}
                                                 DOI={this.props.DOI} txtDOI={this.props.txtDOI}/>,
                               2: <PublicationBookChapter />,
                               3: <PublicationConferenceProceeding />,
                               4: <PublicationJournalArticle />,
                               5: <PublicationPatent />,
                               6: <PublicationReport />,
                               7: <PublicationThesis />,
                               8: <PublicationUnpublishedArticle />};
        return (
            <div>

                <div id="field0-container">
                <select className="form-control" name="option" id="publication-type" required="required" onChange={this.change} value={this.state.value}>
                    <option value={1}>Book</option>
                    <option value={2}>Book Chapter</option>
                    <option value={3}>Conference Proceeding</option>
                    <option value={4}>Journal Article</option>
                    <option value={5}>Patent</option>
                    <option value={6}>Report</option>
                    <option value={7}>Thesis</option>
                    <option value={8}>Unpublished Article</option>
                </select>
                </div>{this.state.value}
                    {publicationType.hasOwnProperty(self.state.type) ? publicationType[self.state.type] : ""}
            </div>
        );
    }
});

var PublicationBook = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="pubUpload" required="required" placeholder="File" onChange={this.props.pubUpload}/>
                </div>
                <div id="field1-container" className="form-group">
                    <input onChange={this.props.title} defaultValue={this.props.txtTitle} className="form-control" type="text" name="title" id="field1" required="required" placeholder="Title" />
                </div>
                <div id="field8-container" className="form-group">
                    {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Authors (Enter Separated)", onChange : this.props.authors, defaultValue : this.props.txtAuthors}))}
                </div>
                <div id="field8-container" className="form-group">
                   {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Editors (Enter Separated)", onChange : this.props.editors, defaultValue : this.props.txtEditors}))}
                </div>
                <div id="field8-container" className="form-group">
                    <input onChange={this.props.publishPartner} defaultValue={this.props.txtPublishPartner} className="form-control" type="text" name="publisher" id="field8" required="required" placeholder="Publisher"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input onChange={this.props.publishDate} defaultValue={this.props.txtPublishDate} className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input onChange={this.props.input1} defaultValue={this.props.txtInput1}  className="form-control" type="text" name="title" id="field1" required="required" placeholder="ISBN"/></td>
                    <td className="padding-right padding-left"><input onChange={this.props.input2} defaultValue={this.props.txtInput2}  className="form-control" type="text" name="title" id="field1" required="required" placeholder="Edition"/></td>
                    <td className="padding-left"><input onChange={this.props.input3} defaultValue={this.props.txtInput3}  className="form-control" type="text" name="title" id="field1" required="required" placeholder="Pages"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input onChange={this.props.abstract} defaultValue={this.props.txtAbstract} className="form-control" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", onChange : this.props.keywordsTags, defaultValue : this.props.txtKeywordsTags}))}
                </div>
                <div id="field10-container" className="form-group">
                    <input onChange={this.props.URL} defaultValue={this.props.txtURL} className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input onChange={this.props.DOI} defaultValue={this.props.txtDOI} className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});
var PublicationBookChapter = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Book Title" />
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Chapter Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Book Authors (Comma Separated)"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Book Editors (Comma Separated)"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Publisher"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="ISBN"/></td>
                    <td className="padding-right padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Edition"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Pages"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Topics (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});
var PublicationConferenceProceeding = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Conference Proceeding Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Conference"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Conference Date" type="date"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Conference Volume"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Conference Location"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});
var PublicationJournalArticle = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Journal Article Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Journal"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Volume"/></td>
                    <td className="padding-right padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Issue"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Pages"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});
var PublicationPatent = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Patent Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Patent Date" type="date"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Patent Reference Number"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Patent Reference Number"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Patent Location"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});
var PublicationReport = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Report Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Report Number"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Report Location"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});

var PublicationThesis = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Thesis Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="University"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Supervisor(s) (Comma Separated)"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Degree"/></td>
                    <td className="padding-right padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Department"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Pages"/></td>
                </tr></table>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Topics (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});

var PublicationUnpublishedArticle = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Unpublished Article Title" />
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Place of Publication"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Publication Date" type="date"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input className="form-control form-textarea" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
                </div>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});

var PublicationJournal = React.createClass ({
    render: function() {
        return (
            <div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Title"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Volume"/></td>
                    <td className="padding-right padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Issue"/></td>
                    <td className="padding-left"><input className="form-control" type="text" name="title" id="field1" required="required" placeholder="Journal Pages"/></td>
                    </tr>
                </table>
                <div id="field8-container" className="form-group">
                    <input className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Authors (Comma Separated)"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input className="form-control" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field3-container" className="form-group">
                    <input className="form-control" id="field3" maxlength="524288" name="publication-date" placeholder="Date" type="date"/>
                </div>
                <table id="upload-field" width="100%" className="form-group"><tr>
                    <td className="padding-right"><input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File"/></td>
                    <td className="padding-left"><input className="form-control" type="url" name="publication-url" id="field6" required="required" placeholder="URL"/></td>
                </tr>
                </table>
                <div id="field10-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Tags (Comma Separated)"/>
                </div>
                <div id="field11-container" className="form-group">
                    <input className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Digital Object Identifier"/>
                </div>
            </div>
        )
    }
});

var Publications = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false };
    },
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false });
    },
    componentWillMount : function() {
        var publicationsURL= "/profile/"+objectId+"/publications_list";

        $.ajax({
            type: 'GET',
            url: publicationsURL,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Publications!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type;
            var typeList = [];
            for (var i in items) {
                var item = items[i];
                typeList.push(item);
            }
            return (
            <div>
                <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                {typeList.map(item =>
                <div className="item-box">
                    <div key={item.objectId}>
                        <a href={'/publication/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                        <span className="font-15">
                        <table className="item-box-table-info">
                            <tr><td><b>Authors: </b></td><td>{item.authors.map(author => <a href="" className="body-link">{author} </a>)}</td></tr>
                            <tr><td><b>Description: </b></td><td>{item.description}</td></tr>
                            <tr><td><b>Publication Code: </b></td><td>{item.publication_code}</td></tr>
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
                <PublicationForm />
                {itemsList}
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
        return { data: [], showModal: false };
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
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Models!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type;
            var typeList = [];
            for (var i in items) {
                var item = items[i];
                typeList.push(item);
            }
            return (
            <div>
                <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                {typeList.map(item =>
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <a href={'/model/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                        </div>
                        <div className="item-box-right">
                            <a href={'/model/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">
                            <table className="item-box-table-info">
                                <tr><td><b>Authors: </b></td><td>{item.authors.map(author => <a href="" className="body-link">{author} </a>)}</td></tr>
                                <tr><td><b>Description: </b></td><td>{item.description}</td></tr>
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
                <ResourceForm />
                {itemsList}
            </div>
        )
    }
});

var Data = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false };
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
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Data!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = items[0].type;
            var typeList = [];
            for (var i in items) {
                var item = items[i];
                typeList.push(item);
            }
            return (
            <div>
                <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                {typeList.map(item =>
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <a href={'/data/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                        </div>
                        <div className="item-box-right">
                            <a href={'/data/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">
                            <table className="item-box-table-info">
                                <tr><td><b>Authors: </b></td><td>{item.authors.map(author => <a href="" className="body-link">{author} </a>)}</td></tr>
                                <tr><td><b>Description: </b></td><td>{item.description}</td></tr>
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
                <ResourceForm />
                {itemsList}
            </div>
        )
    }
});

var ModelsList = React.createClass({
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        models: (new Parse.Query('Model').equalTo("user", {__type: "Pointer",
                                                          className: "_User",
                                                          objectId: this.props.objectId}))
      };
    },
  render: function() {
    var rows = [];
    return (
      <div>
        <ResourceForm fromModelTab={true} list={this.data} />
        {this.data.models.map(function(model) {
            rows.push(<ModelListItem objectId={model.objectId}
                                   collaborators={model.collaborators}
                                   title={model.title}
                                   image_URL={model.image_URL}
                                   keywords={model.keywords}
                                   number_cited={model.number_cited}
                                   number_syncholar_factor={model.number_syncholar_factor}
                                   license={model.license}
                                   access={model.access}
                                   abstract={model.abstract} />);
        })}
        {rows}
      </div>
    );
  }
});

var ModelListItem = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
                <div className="model-box">
                <div className="model-box-image">
                    <a href={"/model/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="contain-image-preview" /></a>
                </div>
                <div className="model-box-left model-box-left-full">
                    <span className="font-15">
                    <a href={"/model/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                    <b>Authors: </b>
                        {this.props.collaborators.map(function(item, i){
                            if (i == 0) {return <a href="#" className="body-link">{item}</a>;}
                            else {return <span>, <a href="#" className="body-link">{item}</a></span>;}
                        })}
                    <br/>
                    <b>Abstract:</b> {this.props.abstract.substr(0,170)}... <a href={"/model/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                    </span>
                </div>
                {/*
                <div className="model-box-right">
                    <h5>Information</h5><br/>
                    {this.props.number_syncholar_factor} Syncholar Factor<br/>
                    {this.props.number_cited} Times Cited<br/>
                    {this.props.license}<br/>
                    {this.props.access.map(function(item, i){
                        if (i == 0) {return item;}
                        else {return ", " + item;}
                    })} <br/> Uses This
                </div>
                */}
                </div>
        )
    }
});

var Step1Model = React.createClass({
  imagePreview: function(e) {
    this.setState({ txtCollaborators : e })
  },
  render: function() {
    return (
            <div>
                <div className="breadcrumb flat">
                            <a href="#" className="active">General Info</a>
                            <a href="#">Extra Info</a>
                            <a href="#">Check Info</a>
                            <a href="#">Completion!</a>
                        </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="Image" onChange={this.imagePreview}/>
                </div>
                <div id="field1-container" className="form-group">
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.clickClose}/>
                </div>
                <div id="field1-container" className="form-group">
                    <input onChange={this.props.title} defaultValue={this.props.txtTitle} className="form-control" type="text" name="title" id="field1" required="required" placeholder="Title" />
                </div>
                <div id="field8-container" className="form-group">
                    {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Collaborators (Enter Separated)", onChange : this.props.collaborators, defaultValue : this.props.txtCollaborators}))}
                </div>
                <div id="field3-container" className="form-group">
                    <input onChange={this.props.creationDate} defaultValue={this.props.txtCreationDate} className="form-control" id="field3" maxlength="524288" name="creation-date" placeholder="Creation Date" type="date"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input onChange={this.props.abstract} defaultValue={this.props.txtAbstract} className="form-control" type="text" name="description" id="field9" required="required" placeholder="Abstract"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input onChange={this.props.license} defaultValue={this.props.txtLicense} className="form-control" type="text" name="description" id="field9" required="required" placeholder="License"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input onChange={this.props.linkToPublication} defaultValue={this.props.txtLinkToPublication} className="form-control" type="text" name="description" id="field9" required="required" placeholder="Link To Publication"/>
                </div>
                <div id="field9-container" className="form-group">
                    <input onChange={this.props.linkToPatent} defaultValue={this.props.txtLinkToPatent} className="form-control" type="text" name="description" id="field9" required="required" placeholder="Link To Patent"/>
                </div>
                <div id="field10-container" className="form-group">
                    {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Keywords (Enter Separated)", onChange : this.props.keywordsTags, defaultValue : this.props.txtKeywordsTags}))}
                </div>
                <div id="field10-container" className="form-group">
                    <input onChange={this.props.URL} defaultValue={this.props.txtURL} className="form-control" type="text" name="tags" id="field10" required="required" placeholder="URL (Alternate Links)"/>
                </div>
            </div>
    )
  }
});
var Step2Model = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#" className="active">Extra Info</a>
            <a href="#">Check Info</a>
            <a href="#">Completion!</a>
        </div>
        <div id="field1-container" className="form-group">
         {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Please Provide Tags That Describe Your Model", onChange : this.props.tags, defaultValue : this.props.txtTags}))}
        </div>
        <div id="field2-container" className="form-group">
          {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Please Provide Who Can View Your Model", onChange : this.props.privacy, defaultValue : this.props.txtPrivacy}))}
        </div>
      </div>
    )
  }
});
var Step3Model = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#">Extra Info</a>
            <a href="#" className="active">Check Info</a>
            <a href="#">Completion!</a>
        </div>
        <table className="summary"><tr><td>
        <b>Title:</b> { this.props.title } <br/>
        <b>Collaborators:</b> { this.props.collaborators } <br/>
        <b>Creation Date:</b> { this.props.creationDate } <br/>
        <b>Abstract:</b> { this.props.abstract } <br/>
        <b>License:</b> { this.props.license } <br/>
        <b>Link To Publication:</b> { this.props.linkToPublication } <br/>
        <b>Link To Patent:</b> { this.props.linkToPatent } <br/>
        <b>Keywords:</b> { this.props.keywordsTags } <br/>
        <b>URL:</b> { this.props.URL } <br/>
        <b>Tags:</b> { this.props.tags } <br/>
        <b>Privacy:</b> { this.props.privacy }
        </td></tr></table>
      </div>
    )
  }
});
var Step4Model = React.createClass({
  render: function() {
    return (
      <div>
        <div className="breadcrumb flat">
            <a href="#">General Info</a>
            <a href="#">Extra Info</a>
            <a href="#">Check Info</a>
            <a href="#" className="active">Completion!</a>
        </div>
        <h3>Congrats! Completed!</h3>
            <a href="#">Click here to view your publication!</a>
      </div>
    )
  }
});

var DataList = React.createClass({
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        items: (new Parse.Query('Data').equalTo("user", {__type: "Pointer",
                                                          className: "_User",
                                                          objectId: this.props.objectId}))
      };
    },
  render: function() {
    var rows = [];
    return (
      <div id="dataListItems">
        <ResourceForm list={this.data}/>
        {this.data.items.map(function(item) {
            rows.push(<DatumListItem objectId={item.objectId}
                                   collaborators={item.collaborators}
                                   title={item.title}
                                   image_URL={item.image_URL}
                                   keywords={item.keywords}
                                   number_cited={item.number_cited}
                                   number_syncholar_factor={item.number_syncholar_factor}
                                   license={item.license}
                                   access={item.access}
                                   abstract={item.description} />);
        })}
        {rows}
      </div>
    );
  }
});

var DatumListItem = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
                <div className="model-box">
                <div className="model-box-image">
                    <a href={"/data/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="contain-image-preview" /></a>
                </div>
                <div className="model-box-left model-box-left-full">
                    <a href={"/data/" + this.props.objectId} className="body-link"><h3 className="margin-top-bottom-5">{title}</h3></a>
                    <span className="font-15">
                    <b>Authors: </b>
                        {this.props.collaborators.map(function(item, i){
                            if (i == 0) {return <a href="#" className="body-link">{item}</a>;}
                            else {return <span>, <a href="#" className="body-link">{item}</a></span>;}
                        })}
                    <br/>
                    <b>Abstract:</b> {this.props.abstract.substr(0,170)}... <a href={"/data/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                    </span>
                </div>
                {/*
                <div className="model-box-right">
                    <h5>Information</h5><br/>
                    {this.props.number_syncholar_factor} Syncholar Factor<br/>
                    {this.props.number_cited} Times Cited<br/>
                    {this.props.license}<br/>
                    {this.props.access.map(function(item, i){
                        if (i == 0) {return item;}
                        else {return ", " + item;}
                    })} <br/> Uses This
                </div>
                */}
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
  render: function() {
    return (
		<div>
        <table id="upload-field" width="100%">
            <tr>
                <td className="padding-right">
                <input type="text" id="search" placeholder="Search..." className="form-control"/>
                </td>
                {(currentUsername == username) ? <td className="padding-left-5"><input className="publication-button" onClick={this.open} type="button" value="+"/></td> : ""}
            </tr>
        </table>
       {/* <Button className="pull-right add-resource-btn" onClick={this.open}>Add Data</Button>*/}


		 <Modal show={this.state.showModal} onHide={this.close}>
		   <Modal.Header closeButton>
			 <Modal.Title>Add {this.props.fromModelTab ? 'Model' : 'Data'}</Modal.Title>
		   </Modal.Header>
		   <Modal.Body>

			 <ResourceAddForm fromModelTab={this.props.fromModelTab} submitSuccess={this.close} list={this.list} />

		   </Modal.Body>
		 </Modal>
		</div>
     );
  }
});

var ResourceAddForm = React.createClass({
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
        fileFeedback: {},
        pictureFeedback: '',

        // form
        picture: null, file: null, pictureType: '', fileType: '', title: '', description: '', collaborators: '',
        creationDate: '', description: '', license: '', pubLink: '', keywords: '', url: ''
        };
    },

	render: function() {
		return (
		<div>
			<form className="form" onSubmit={this.handleSubmitData}>
			    <div className="well" style={this.buttonStyles}>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                    	style={{display: this.showPictureUpload(this.props.fromModelTab), background: this.state.pictureFeedback}}>
                        Add Picture <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                    </Button>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                        Select Files... <input type="file" onChange={this.handleFile} />
                    </Button>
                  </div>

                <Input type="text" placeholder="Title:" name="title" onChange={this.handleChange} value={this.state.title} />
                <Input type="text" placeholder="Collaborators:" name="collaborators" onChange={this.handleChange} value={this.state.collaborators} />
                <Input type="date" placeholder="Creation Date:" name="creationDate" onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
                <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
                <Input type="text" placeholder="License:" name="license" onChange={this.handleChange} value={this.state.license} />
                <Input type="text" placeholder="Link to publication:" name="pubLink" onChange={this.handleChange} value={this.state.pubLink} />
                <Input type="text" placeholder="Keywords (type in comma separated tags)" name="keywords" onChange={this.handleChange} value={this.state.keywords} />
                <Input type="text" placeholder="URL (Link to patent)" name="url" onChange={this.handleChange} value={this.state.url} />

               <Modal.Footer>
                   <Input className="btn btn-default pull-right" type="submit" value="Continue" />
                   <div style={{textAlign:'center'}}>{this.state.formFeedback}</div>
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

	handleSubmitData: function(e) {
        e.preventDefault();

        var dataForm = {file: this.state.file, picture: this.state.picture,
        				fileType: this.state.fileType, pictureType: this.state.pictureType,
        				collaborators: this.state.collaborators, creationDate: this.state.creationDate,
        				description: this.state.description, license: this.state.license, pubLink: this.state.pubLink,
        				keywords: this.state.keywords, url: this.state.url, title: this.state.title};
		console.log(dataForm);

        var isValidForm = this.validateForm();
		if (isValidForm.length === 0) {
			var endpoint = this.props.fromModelTab ? "/model" : "/data";
			var dataFormORIG = {file: this.state.file, picture: this.state.picture,
				fileType: this.state.fileType, pictureType: this.state.pictureType,
				collaborators: this.state.collaborators, creationDate: this.state.creationDate,
				description: this.state.description, license: this.state.license, pubLink: this.state.pubLink,
				keywords: this.state.keywords, url: this.state.url, title: this.state.title};

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
					console.log(data);
					this.close();
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(path + endpoint, status, err.toString());
				}.bind(this)
			});
		}
		else {
			var message = (this.props.fromModelTab ? 'Model' : 'Data') + ' could not be added:';
			if (isValidForm.indexOf('TITLE') > -1) {
				message += ' Title is required.';
			}
			if (isValidForm.indexOf('FILE') > -1) {
				message += ' Please upload a file.';
			}
			if (isValidForm.indexOf('DATE') > -1) {
				message += ' Please indicate the creation date.';
			}
			if (isValidForm.indexOf('KEYWORDS') > -1) {
				message += ' Please specify at least one keyword.';
			}
			this.setState({formFeedback: message});
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
            console.log(numFiles);
            console.log(label);
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
		if (!this.state.title.trim()) {
			issues.push("TITLE");
		}
		if (!this.state.file) {
			issues.push("FILE");
		}
		if (!this.state.creationDate) {
			issues.push("DATE");
		}
		if (!this.state.keywords.trim()) {
			issues.push("KEYWORDS");
		}
		return issues;
	},
});

var Required = React.createClass({
	render: function() {
		var requiredField = {color: 'red', fontWeight: '800'}
		return (
			<span style={requiredField}>{this.props.content}</span>
		);
	},
});

React.render(<Profile
    locations={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    roles={["Treasurer At FFABNET"]}
    connections={["BiofuelNet","FFABNet","IIE","INFORMS"]}
    expertise={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}
    news={["INFORMS","IIASA","FRESH LAB"]}/>, document.getElementById('content'));
