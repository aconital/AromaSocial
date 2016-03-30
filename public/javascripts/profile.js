Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
// require('autocomplete.js').UserAutocomplete();

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
    checkConnection:function()
    {
        var connectURL= "/profile/"+username+"/connection-status";

        $.ajax({
            url: connectURL,
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
            this.setState({status: "not-connected"});
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
        <div className="content-wrap">
            <div className="item-bottom">
                <div className="item-bottom-1">
                    {(currentUsername == username) ? <a href="#" onClick={this.clickOpen}><div className="edit-overlay-div"><img src={this.state.profile_imgURL} className="contain-image" /><div className="edit-overlay-background"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a> : <img src={profile_imgURL} className="contain-image" />}
                    <div className="side-panel"><h5>NEWS AND EVENTS</h5></div>
                    <div className="side-panel"><h5>RATINGS</h5></div>
                    <div className="side-panel"><h5>OTHERS</h5></div>
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
                    {(currentUsername == username) ? "" : <div className="interact-buttons-wrap">{connectButton}<input className="btn btn-panel" value="Follow" /></div> }
                    <h1 className="no-margin-padding align-left h1-title">{fullname} ({username})</h1>
                    <h3 className="no-margin-padding align-left h3-title">{position} @ {current_location}</h3>
                    <ProfileMenu tabs={['About','Connections','Organizations', 'Projects', 'Publications', 'Data', 'Models']} />
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
                    <div className="item-box" key={person.username} id="item-list">
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/profile/'+person.username}><img src={person.userImgUrl} className="item-box-image" /></a>
                            </div>
                        </div>
                        <div className="item-box-right">
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
                <div className="item-box" key={org.orgId} id="item-list">
                    <div className="item-box-left">
                        <div className="item-box-image-outside">
                            <a href={'/organization/'+org.orgId}><img src={org.orgImgUrl} className="item-box-image" /></a>
                        </div>
                    </div>
                    <div className="item-box-right">
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

var Publications = React.createClass({
  mixins: [ParseReact.Mixin],
  getInitialState: function() {
      return {data: []};
    },
  observe: function() {
      return {
        publications: (new Parse.Query('Publication').equalTo("user", {__type: "Pointer",
                                                                      className: "_User",
                                                                      objectId: this.props.objectId}))
      };
    },
  render: function() {
    var rows = [];
    return (
      <div>
        <PublicationForm />
        {this.data.publications.map(function(publication) {
            rows.push(<Publication objectId={publication.objectId} author={publication.author} title={publication.title} description={publication.description} publication_code={publication.publication_code} pubGroup={publication.pubGroup} />);
        })}
        {rows}
      </div>
    );
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
                    {(currentUsername == username) ? <div className="margin-top-20">{React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Interests (Enter Separated)", className: "l-editable-input", name: "interests", onChange : this.handleTagsInputChange, value : this.state.interests}))}</div> : <div className="margin-top-20">{JSON.parse(this.state.interests).map(function(item) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{item}</a>; })}</div> }
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
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,5)} className="body-link">See More</a></h3></div>
                    {publications_data}
                </div>
                <div className="clear"></div>
                <div id="resume-datas" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-stats"></span> Data</h3>
                    </div>
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,6)} className="body-link">See More</a></h3></div>
                    {datas_data}
                </div>
                <div className="clear"></div>
                <div id="resume-models" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-blackboard"></span> Models</h3>
                    </div>
                    <div className="div-absolute"><h3><a onClick={this.tabChange.bind(this,7)} className="body-link">See More</a></h3></div>
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
                            <div className="item-box-image-outside">
                                <a href={'/project/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/project/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <table className="item-box-right-tags">
                                <tr><td><b>Authors: </b></td><td>{item.authors.map(function(author) { return <span><a href="#" className="body-link">{author}</a> </span>;})}</td></tr>
                                <tr><td><b>Locations: </b></td><td>{item.locations.map(function(location) { return <span><a href="#" className="body-link">{location}</a> </span>;})}</td></tr>
                                <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>
                                <tr><td><b>Period: </b></td><td>{item.start_date} -  {item.end_date}</td></tr>
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
                            <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                            {(currentUsername == username) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></td> : ""}
                        </tr>
                    </table>
                </div>
                {itemsList}
            </div>
        )
    }
});

var creator = ParseReact.Mutation.Create('Organization', {
   name: 'DDD'
});
creator.dispatch({waitForServer: 'false'});

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
        var publicationsURL= "/profile/"+username+"/publications";

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
                <ResourceForm publication={true} />
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
                            <div className="item-box-image-outside">
                                <a href={'/model/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
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
                <ResourceForm fromModelTab={true} />
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
                            <div className="item-box-image-outside">
                                <a href={'/data/'+item.objectId}><img src={item.image_URL} className="item-box-image"/></a>
                            </div>
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
                <ResourceForm fromModelTab={false} />
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
		<div className="item-search-div">
            <table className="item-search-field" width="100%">
                <tr>
                    <td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>
                    {(currentUsername == username) ? <td className="padding-left-5"><input className="item-add-button" onClick={this.open} type="button" value="+"/></td> : ""}
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
        fileFeedback: {},
        autoFillStatus: '',

        // field labels
        labels: {title: 'Title', collaborators: 'Authors', creationDate: 'Publication Date', description: 'Abstract',
        		 keywords: 'Keywords', url: 'URL', doi: 'DOI (Digital Object Identifier', // common
        		 journal: 'Journal', volume: 'Journal Volume', issue: 'Issue', pages: 'Pages', // journal articles
        		 publisher: 'Publisher' },

        // common form fields
        type: 'journal', file: null, fileType: '', title: '', description: '', collaborators: '',
        creationDate: '', description: '', keywords: '', url: '', doi: '',
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

	render: function() {
		var self = this;

		var titleLabel = "Title:";

		var autoFillBtn = (
			<Button className="" onClick={this.fillDoi}>Auto-fill</Button>
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
			<Input type="text" placeholder="Chapter Title:" name="chapter" onChange={this.handleChange} value={this.state.book_chapter} />
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
					showBookChapterTitle(true);
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

		return (
		<div>
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
                <Input type="text" placeholder="Authors:" name="collaborators" required onChange={this.handleChange} value={this.state.collaborators} />
                <Input type="date" placeholder="Creation Date:" name="creationDate" required onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
				{showTypeFields(this.state.type)}
                <Input type="textarea" placeholder="Description:" name="description" required onChange={this.handleChange} value={this.state.description} />
                <Input type="text" placeholder="Keywords (type in comma separated tags)" name="keywords" required onChange={this.handleChange} value={this.state.keywords} />
                <Input type="text" placeholder="URL" name="url" onChange={this.handleChange} value={this.state.url} />
				<Input type="text" placeholder="DOI (Digital Object Identifier)" name="doi" onChange={this.handleChange} value={this.state.doi} buttonAfter={autoFillBtn} />
				<div className="form-feedback auto-fill-status">{this.state.autoFillStatus}</div>

				<Modal.Footer>
					<Input className="btn btn-default pull-right" type="submit" value="Continue" />
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

	fillDoi: function(e) {
		$.ajax({
			url: 'http://api.crossref.org/works/' + this.state.doi,
			type: 'GET',
			success: function(data) {
				console.log(data);
				var entry = data.message;
				this.setState({
					title: entry.title[0],
					collaborators: (entry.hasOwnProperty('author') ? entry.author[0].given + ' ' + entry.author[0].family : ''),
					creationDate: entry.created['date-time'].split('T')[0],//entry['published-print']['date-parts'][0],
					url: entry.URL,
					keywords: (entry.hasOwnProperty('subject') ? entry.subject.join(",") : ''),
					autoFillStatus: "",
				});
				this.fillDetails(entry, null);
			}.bind(this),
			error: function(xhr, status, err) {
				console.error('http://api.crossref.org/works/', status, err.toString());
				this.setState({ autoFillStatus: "DOI not found. Try again. EXAMPLE: 10.1126/science.1157784" });
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

        var pubForm = {file: this.state.file, fileType: this.state.fileType,
        				collaborators: this.state.collaborators, creationDate: this.state.creationDate,
        				description: this.state.description, doi: this.state.doi, url: this.state.url,
        				keywords: this.state.keywords, title: this.state.title, type: this.state.type};
		this.fillDetails({type:this.state.type}, pubForm);

		console.log("pubForm after", pubForm);

		$.ajax({
			url: path + "/publication",
			dataType: 'json',
			contentType: "application/json; charset=utf-8",
			type: 'POST',
			data: JSON.stringify(pubForm),
			processData: false,
			success: function(data) {
				console.log("Publication upload done");
				console.log(data);
				this.close();
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(path + "/publication", status, err.toString());
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

// var ResourceAddForm = React.createClass({
//     close: function(e) {
//         if (typeof this.props.submitSuccess === 'function') {
//             this.props.submitSuccess();
//         }
//     },
//     getInitialState: function() {
//      return {
//         fromModelTab: false,
//         buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
//         formFeedback: '',
//         fileFeedback: {},
//         pictureFeedback: '',

//         // form
//         picture: null, file: null, pictureType: '', fileType: '', title: '', description: '', collaborators: '',
//         creationDate: '', description: '', license: '', pubLink: '', keywords: '', url: '', groupies: ''
//         };
//     },
//     componentDidMount: function() {
//         var eCode = <script>
//                         $(function() {
//                             $('.auto').autocomplete({
//                                     source: function(req, res) {
//                                         $.ajax({
//                                           url: '/allusers',
//                                           dataType: 'JSON',
//                                           cache: false,
//                                           success: function(data) {
//                                             console.log("SUCCESS!!!!!!!");
//                                             console.log(data);
//                                             var arr = $.grep(data, function(item){
//                                               return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
//                                             });
//                                             res($.map(arr, function(item){
//                                               return {
//                                                 label: item.fullname,
//                                                 value: item.username
//                                               };
//                                             }));
//                                           },
//                                           error: function(xhr) {
//                                             console.log("ERROR WTF!!!");
//                                             console.log(xhr.status);
//                                           }
//                                         });
//                                     },
//                                     messages: {
//                                       noResults: '',
//                                       results: function() {}
//                                     }
//                             })
//                         });
//                     </script>
//         //var eCode = <script src="/javascripts/autocomplete.js"></script>
//         $("#scriptContainer").append(eCode);
//     },
// 	render: function() {
// 		return (
// 		<div>
//             <div id="scriptContainer"></div>
// 			<form className="form" onSubmit={this.handleSubmitData}>
// 			    <div className="well" style={this.buttonStyles}>
//                     <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
//                     	style={{display: this.showPictureUpload(this.props.fromModelTab), background: this.state.pictureFeedback}}>
//                         Add Picture <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
//                     </Button>
//                     <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
//                         Select Files... <input type="file" onChange={this.handleFile} />
//                     </Button>
//                   </div>

//                 <Input type="text" placeholder="Title:" name="title" onChange={this.handleChange} value={this.state.title} />
//                 <Input type="text" placeholder="Collaborators:" name="collaborators" className="auto" onChange={this.handleChange} value={this.state.collaborators} />
//                 <Input type="date" placeholder="Creation Date:" name="creationDate" onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.creationDate} />
//                 <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
//                 <Input type="text" placeholder="License:" name="license" onChange={this.handleChange} value={this.state.license} />
//                 <Input type="text" placeholder="Link to publication:" name="pubLink" onChange={this.handleChange} value={this.state.pubLink} />
//                 <Input type="text" placeholder="Keywords (type in comma separated tags)" name="keywords" onChange={this.handleChange} value={this.state.keywords} />
//                 <Input type="text" placeholder="URL (Link to patent)" name="url" onChange={this.handleChange} value={this.state.url} />
//                 <Input type="text" className="auto" placeholder="Users you'd like to share this with (type in comma separated names): " name="groupies" onChange={this.handleChange} value={this.state.groupies} />

//                <Modal.Footer>
//                    <Input className="btn btn-default pull-right" type="submit" value="Continue" />
//                    <div style={{textAlign:'center'}}>{this.state.formFeedback}</div>
//                </Modal.Footer>
//             </form>
// 		</div>
// 		);
// 	},

// 	handleChange: function(e) {
// 	    var changedState = {};
// 	    changedState[e.target.name] = e.target.value;
// 	    this.setState( changedState );
// 	},

// 	handleSubmitData: function(e) {
//         e.preventDefault();

//         var dataForm = {file: this.state.file, picture: this.state.picture,
//         				fileType: this.state.fileType, pictureType: this.state.pictureType,
//         				collaborators: this.state.collaborators, creationDate: this.state.creationDate,
//         				description: this.state.description, license: this.state.license, pubLink: this.state.pubLink,
//         				keywords: this.state.keywords, url: this.state.url, title: this.state.title, groupies: this.state.groupies};
// 		console.log(dataForm);

//         var isValidForm = this.validateForm();
// 		if (isValidForm.length === 0) {
// 			var endpoint = this.props.fromModelTab ? "/model" : "/data";
// 			var dataFormORIG = {file: this.state.file, picture: this.state.picture,
// 				fileType: this.state.fileType, pictureType: this.state.pictureType,
// 				collaborators: this.state.collaborators, creationDate: this.state.creationDate,
// 				description: this.state.description, license: this.state.license, pubLink: this.state.pubLink,
// 				keywords: this.state.keywords, url: this.state.url, title: this.state.title, groupies: this.state.groupies};

// 			$.ajax({
// 				url: path + endpoint,
// 				dataType: 'json',
// 				contentType: "application/json; charset=utf-8",
// 				type: 'POST',
// 				data: JSON.stringify(dataForm),
// 				processData: false,
// 				success: function(data) {
// 					this.setState({data: data});
// 					console.log("Data upload done");
// 					console.log(data);
// 					this.close();
// 				}.bind(this),
// 				error: function(xhr, status, err) {
// 					console.error(path + endpoint, status, err.toString());
// 				}.bind(this)
// 			});
// 		}
// 		else {
// 			var message = (this.props.fromModelTab ? 'Model' : 'Data') + ' could not be added:';
// 			if (isValidForm.indexOf('TITLE') > -1) {
// 				message += ' Title is required.';
// 			}
// 			if (isValidForm.indexOf('FILE') > -1) {
// 				message += ' Please upload a file.';
// 			}
// 			if (isValidForm.indexOf('DATE') > -1) {
// 				message += ' Please indicate the creation date.';
// 			}
// 			if (isValidForm.indexOf('KEYWORDS') > -1) {
// 				message += ' Please specify at least one keyword.';
// 			}
// 			this.setState({formFeedback: message});
// 		}
//         return;
//     },

// 	showPictureUpload(fromModel) {
// 	    if (fromModel) {
//             return '';
// 	    }
// 	    return 'none';
// 	},

// 	openFileUpload() {
// 	    var input = $(this),
//             numFiles = input.get(0).files ? input.get(0).files.length : 1,
//             label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
//         input.trigger('fileselect', [numFiles, label]);

//         this.state.file.on('fileselect', function(event, numFiles, label) {
//             console.log(numFiles);
//             console.log(label);
//             return input;
//         });
// 	},

// 	handleFile: function(e) {
//         var self = this;
//         var reader = new FileReader();
//         var file = e.target.files[0];
//         var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

//         reader.onload = function(upload) {
//           self.setState({
//             file: upload.target.result,
//             fileType: extension,
//             fileFeedback: {background: '#dff0d8'}
//           });
//         }
//         reader.readAsDataURL(file);
//     },

//     handlePicture: function(e) {
//         var self = this;
//         var reader = new FileReader();
//         var file = e.target.files[0];
//         var extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

//         reader.onload = function(upload) {
//          self.setState({
//            picture: upload.target.result,
//            pictureType: extension,
//            pictureFeedback: '#dff0d8'
//          });
//         }
//         reader.readAsDataURL(file);
//     },

// 	validateForm: function() {
// 		var issues = []
// 		if (!this.state.title.trim()) {
// 			issues.push("TITLE");
// 		}
// 		if (!this.state.file) {
// 			issues.push("FILE");
// 		}
// 		if (!this.state.creationDate) {
// 			issues.push("DATE");
// 		}
// 		if (!this.state.keywords.trim()) {
// 			issues.push("KEYWORDS");
// 		}
// 		return issues;
// 	},
// });

// <<<<<<< HEAD
function split(val) {
    return val.split( /,\s*/ );
}

function extractLast(term) {
    return split(term).pop();
}

var ResourceAddForm = React.createClass({
// =======
// var ProjectAddForm = React.createClass({
// >>>>>>> e7b8d2179a31785e6c2ba648da230c93d201ef1f
    close: function(e) {
        this.props.submitSuccess();
    },
    getInitialState: function() {
     return {
        alertVisible: false,
        buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
        formFeedback: '',
        fileFeedback: {},
        pictureFeedback: '',

        // form
        picture: null, file: null, pictureType: '', fileType: '', title: '', description: '', collaborators: '',
        startDate: '', endDate: '', description: '', link_to_resources: '', client: '', keywords: '', url: '',
        organizationId: 'AJgSwufvvO'
        };
    },
    componentDidMount: function() {
        var eCode = <script>
                        $(function() {
                            $('.auto').bind("keydown", function(event) {
                                if ( event.keyCode === $.ui.keyCode.TAB &&
                                    $( this ).autocomplete( "instance" ).menu.active ) {
                                  event.preventDefault();
                                }
                            })
                            .autocomplete({
                                    source: function(req, res) {
                                        $.ajax({
                                          url: '/allusers',
                                          dataType: 'JSON',
                                          cache: false,
                                          success: function(data) {
                                            console.log("SUCCESS!!!!!!!");
                                            console.log(data);
                                            var arr = $.grep(data, function(item){
                                              return item.username.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                                            });
                                            res($.ui.autocomplete.filter($.map(data, function(item){
                                              return {
                                                label: item.fullname,
                                                value: item.username
                                              };
                                            }), extractLast(req.term)));
                                          },
                                          error: function(xhr) {
                                            console.log(xhr.status);
                                          }
                                        });
                                    },
                                    focus: function() {
                                        return false;
                                    },
                                    messages: {
                                      noResults: '',
                                      results: function() {}
                                    },
                                    select: function(event, ui) {
                                        var terms = split(this.value);
                                        terms.pop();
                                        terms.push(ui.item.value);
                                        terms.push("");
                                        this.value = terms.join(", ");
                                        return false;
                                    }
                            })
                        });
                    </script>
        //var eCode = <script src="/javascripts/autocomplete.js"></script>
        $("#scriptContainer").append(eCode);
    },
	render: function() {
	    if (this.state.alertVisible) {
	        var alert = <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}> {this.state.formFeedback} </Alert>;
	    } else {var alert = "";}
		return (
		<div>
            <div id="scriptContainer"></div>
			<form className="form" onSubmit={this.handleSubmitData}>
			    <Modal.Body>
			    {alert}
			    <div className="well" style={this.buttonStyles}>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block
                    	style={{background: this.state.pictureFeedback}}>
                        Add Picture <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                    </Button>
                    <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                        Select Files... <input type="file" onChange={this.handleFile} />
                    </Button>
                  </div>

                <Input type="text" placeholder="Title:" name="title" onChange={this.handleChange} value={this.state.title} />
                <Input type="text" placeholder="Collaborators:" name="collaborators" className="auto" onChange={this.handleChange} value={this.state.collaborators} />
                <Input type="date" placeholder="Start Date:" name="startDate" onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.startDate} />
                <Input type="date" placeholder="End Date:" name="endDate" onChange={this.handleChange} defaultValue="" className="form-control" maxlength="524288" value={this.state.endDate} />
                <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
                <Input type="text" placeholder="Client:" name="client" onChange={this.handleChange} value={this.state.client} />
                <Input type="text" placeholder="Link to Resources:" name="link_to_resources" onChange={this.handleChange} value={this.state.link_to_resources} />
                <Input type="text" placeholder="Keywords (Comma Separated Tags):" name="keywords" onChange={this.handleChange} value={this.state.keywords} />
                <Input type="text" placeholder="URL (Link to Patent:)" name="url" onChange={this.handleChange} value={this.state.url} />
                </Modal.Body>
                <Modal.Footer>
                    <input className="full-button" type="submit" value="Submit"/>
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
	handleSubmitData: function(e) {
        e.preventDefault();

        var dataForm = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
        				fileType: this.state.fileType, pictureType: this.state.pictureType,
        				collaborators: this.state.collaborators, startDate: this.state.startDate, endDate: this.state.endDate,
        				description: this.state.description, client: this.state.client, link_to_resources: this.state.link_to_resources,
        				keywords: this.state.keywords, url: this.state.url, title: this.state.title};
		console.log(dataForm);

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
				    console.log(data);
				    this.close();
				}.bind(this),
				error: function(xhr, status, err) {
					console.error(path + endpoint, status, err.toString());
				}.bind(this)
			});
		}
		else {
			var message = 'Project could not be added!';
			if (isValidForm.indexOf('TITLE') > -1) {
				message += ' Title is required.';
			}
			if (isValidForm.indexOf('FILE') > -1) {
				message += ' Please upload a file.';
			}
			if (isValidForm.indexOf('DATE') > -1) {
				message += ' Please indicate the start and end date.';
			}
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
		if (!this.state.startDate) {
			issues.push("DATE");
		}
		if (!this.state.endDate) {
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
