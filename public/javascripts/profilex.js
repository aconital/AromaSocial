Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Profile = React.createClass ({
    render: function() {
        return (
        <div>
            <div className="item-top item-top-container">
                <div className="item-top-1 col">
                    <img src={profile_imgURL} className="contain-image" />
                </div>
            </div>
            <div className="item-bottom">
                <div className="item-bottom-1">
                    <div className="item-panel contain-panel"><h5>{fullname}</h5><br/>{position}</div>
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
                <div className="extend-bottom">&nbsp;</div>
                </div>
                <div id="item-bottom-2-profile" className="item-bottom-2">
                     <ProfileMenu tabs={['About','Connections', 'Profile', 'Publications', 'Data', 'Models', 'More']} />
                <div className="extend-bottom">&nbsp;</div>
                </div>
                <div className="item-bottom-3">
                    <div className="item-panel-empty contain-panel-empty">
                    <input className="btn btn-panel" value="Connect" />
                    <input className="btn btn-panel" value="Follow" />
                    <input className="btn btn-panel" value="Message" />
                    <input className="btn btn-panel" value="Ask" />
                    </div>
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
                <div className="extend-bottom">&nbsp;</div>
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
        var tabMap = {0: <About />,
                1: <Connections />,
                2: <ProfileTab />,
                3: <Publications objectId={objectId}/>,
                4: <Data />,
                5: <Models />,
                6: <More />};
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
  render: function() {
    return (
      <div>
      <div id="connections-list">
         <div className="list-item"><a href="#" className="nostyle"><img src="/images/organization.png" className="contain-icons"/><h4 className="no-margin">Organizations Name</h4></a><span>Organizations Title</span> @ <span>Organizations Location</span></div>
         <div className="list-item"><a href="#" className="nostyle"><img src="/images/organization.png" className="contain-icons"/><h4 className="no-margin">Organizations Name</h4></a><span>Organizations Title</span> @ <span>Organizations Location</span></div>
         <div className="list-item"><a href="#" className="nostyle"><img src="/images/organization.png" className="contain-icons"/><h4 className="no-margin">Organizations Name</h4></a><span>Organizations Title</span> @ <span>Organizations Location</span></div>
         <div className="list-item"><a href="#" className="nostyle"><img src="/images/organization.png" className="contain-icons"/><h4 className="no-margin">Organizations Name</h4></a><span>Organizations Title</span> @ <span>Organizations Location</span></div>
      </div>
      </div>
    )
  }
});

var ProfileTab = React.createClass({
  render: function() {
    return (
            <div id="resume">
                <div id="resume-summary">
                <div>
                    <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-info-sign"></span> Summary</h3>
                </div>
                <div id="resume-summary-item">
                    React components implement a render() method that takes input data and returns what to display. This example uses an XML-like syntax called JSX. Input data that is passed into the component can be accessed by render() via
                </div>
                </div>
                <hr/>
                <div id="resume-education">
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-education"></span> Education</h3>
                    </div>
                    <div id="resume-education-item">
                        <h4 className="h4-resume-item">Hogwarts University (January  - Present)</h4>
                        React components implement a render() method that takes input data and returns what to display. This example uses an XML-like syntax called JSX. Input data that is passed into the component can be accessed by render() via
                    </div><br/>
                    <div id="resume-education-item">
                        <h4 className="h4-resume-item">Monsters University (January  - January )</h4>
                        React components implement a render() method that takes input data and returns what to display. This example uses an XML-like syntax called JSX. Input data that is passed into the component can be accessed by render() via
                    </div>
                </div>
                <hr/>
                <div id="resume-experience">
                    <div>
                        <h3 className="no-margin-top" ><span aria-hidden="true" className="glyphicon glyphicon-paperclip"></span> Experience</h3>
                    </div>
                    <div id="resume-experience-item">
                        <h4 className="h4-resume-item">Cake Eater (January  - Present)</h4>
                        React components implement a render() method that takes input data and returns what to display. This example uses an XML-like syntax called JSX. Input data that is passed into the component can be accessed by render() via
                    </div>
                </div>
                <hr/>
                <div id="resume-projects">
                    <div>
                        <h3 className="no-margin-top"><span aria-hidden="true" className="glyphicon glyphicon-star"></span> Projects</h3>
                    </div>
                    <div id="resume-project-item">
                        React components implement a render() method that takes input data and returns what to display. This example uses an XML-like syntax called JSX. Input data that is passed into the component can be accessed by render() via\
                    </div>
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

var About = React.createClass({
  render: function() {
    return (
           <div>
             {about}
           </div>
         )
  }
});

var PublicationForm = React.createClass({
  getInitialState: function() {
    return { showModal: false,
             step : 1,
             type : 1,
             txtTitle : "",
             txtAuthors : [fullname,"SDFSDF"],
             txtEditors : "",
             txtPublishPartner : "",
             txtPublishDate : "",
             txtInput1 : "",
             txtInput2 : "",
             txtInput3 : "",
             txtAbstract : "",
             txtKeywordsTags : "",
             txtURL : "",
             txtDOI : "",
             txtTags: "",
             txtPrivacy: "" };
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
  title: function(e) {
    this.setState({ txtTitle : e.target.value })
  },
  authors: function(e) {
    this.setState({ txtAuthors : e.target.value })
 },
  editors: function(e) {
    this.setState({ txtEditors : e.target.value })
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
    this.setState({ txtKeywordsTags : e.target.value })
  },
  URL: function(e) {
    this.setState({ txtURL : e.target.value })
  },
  DOI: function(e) {
    this.setState({ txtDOI : e.target.value })
  },
  tags: function(e) {
    this.setState({ txtTags : e.target.value })
  },
  privacy: function(e) {
    this.setState({ txtPrivacy : e.target.value })
  },
  render: function() {
    var self = this;
    var stepMap = {1: <Step1 title={this.title} txtTitle={this.state.txtTitle}
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
                    <td className="padding-right">
                    <input type="text" id="search" placeholder="Search..." className="form-control"/>
                    </td>
                    <td className="padding-left"><input className="publication-button" onClick={this.clickOpen} type="button" value="+"/></td>
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
                        {this.state.step != 3 ? <div></div> : <input className="publication-button" type="submit" value="Submit" onClick={this.clickContinue.bind(self, this.state.step)} />}
                        {this.state.step != 4 ? <div></div> : <input className="publication-button" type="submit" value="Close" onClick={this.clickClose} />}
                      </td>
                    </tr></table>
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
          <input onChange={this.props.tags} defaultValue={this.props.txtTags} className="form-control" type="text" ref="title" name="title" id="field1" required="required" placeholder="Please Provide Tags (Comma Separated) That Describes Your Entry" />
        </div>
        <div id="field2-container" className="form-group">
          <input onChange={this.props.privacy} defaultValue={this.props.txtPrivacy} className="form-control" type="text" name="authors" id="field8" required="required" placeholder="Please Provide Who (Comma Separated) Can Access Your Entry"/>
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
        <b>Title:</b> { this.props.title } <br/>
        <b>Authors:</b> { this.props.authors } <br/>
        <b>Editors:</b> { this.props.editors } <br/>
        <b>Publisher:</b> { this.props.publishPartner } <br/>
        <b>Publishing Date:</b> { this.props.publishDate } <br/>
          - { this.props.input1 } <br/>
          - { this.props.input2 } <br/>
          - { this.props.input3 } </td>
        <td>
        <b>Abstract:</b> { this.props.abstract } <br/>
        <b>Keywords:</b> { this.props.keywordsTags } <br/>
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
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required" placeholder="File" onChange={this.clickClose}/>
                </div>
                <div id="field1-container" className="form-group">
                    <input onChange={this.props.title} defaultValue={this.props.txtTitle} className="form-control" type="text" name="title" id="field1" required="required" placeholder="Book Title" />
                </div>
                <div id="field8-container" className="form-group">
                    {React.createElement("div", null, React.createElement(ReactTagsInput, { ref: "tags", placeholder: "Book Authors", onChange : this.props.authors, defaultValue : this.props.txtAuthors}))}
                </div>
                <div id="field8-container" className="form-group">
                    <input onChange={this.props.editors} defaultValue={this.props.txtEditors} className="form-control" type="text" name="editors" id="field8" required="required" placeholder="Book Editors (Comma Separated)"/>
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
                    <input onChange={this.props.keywordsTags} defaultValue={this.props.txtKeywordsTags} className="form-control" type="text" name="tags" id="field10" required="required" placeholder="Keywords (Comma Separated)"/>
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
            rows.push(<Publication author={publication.author} title={publication.title} description={publication.description} />);
        })}
        {rows}
      </div>
    );
  }
});

var Publication = React.createClass({
    render: function() {
        return (
                <div className="publication-box">
                <div className="publication-box-left">
                    <h3 className="no-margin-top">{this.props.title}</h3>
                    Authors: <a href="#" className="body-link">{this.props.author}</a><br/>
                    Abstract: {this.props.description}... <a href="#" className="body-link">Show Full Abstract</a><br/>
                    PUBLICATION CODE
                </div>
                <div className="publication-box-right">
                    <h5>Information</h5><br/>
                    ## Syncholar Factor<br/>
                    ## Times Cited<br/>
                    ## Views<br/>
                    ## Impact Factor
                </div>
                </div>
        )
    }
});

var Models = React.createClass({
  render: function() {
    return (
           <div>
             Models
           </div>
         )
  }
});

var Data = React.createClass({
  render: function() {
    return (
           <div>
             Data
           </div>
         )
  }
});

React.render(<Profile
    locations={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    roles={["Treasurer At FFABNET"]}
    connections={["BiofuelNet","FFABNet","IIE","INFORMS"]}
    expertise={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}
    news={["INFORMS","IIASA","FRESH LAB"]}/>, document.getElementById('content'));
