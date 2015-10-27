Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");

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
                    <div className="item-panel contain-panel"><h4>{fullname}</h4></div>
                    <div className="item-panel contain-panel"><h4>{position}</h4></div>
                </div>
                <div id="item-bottom-2-profile" className="item-bottom-2">
                     <ProfileMenu tabs={['Connections', 'Resume', 'Friends', 'About', 'Publications', 'Models', 'Data']} />
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
        var tabMap = {0: <Connections />,
                1: <Resume />,
                2: <Friends />,
                3: <About />,
                4: <Publications userId={objectId} />,
                5: <Models />,
                6: <Data />};
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

var Resume = React.createClass({
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

var Friends = React.createClass({
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
  render: function() {
    return (
      <div>
<form id="publication-form" action="" method="" novalidate="" enctype="multipart/form-data">
                <div id="field1-container" className="form-group">
                    <label for="field1">
                        Title:
                    </label>
                    <input className="form-control" type="text" name="title" id="field1" required="required"/>
                </div>
<div id="field2-container" className="form-group">
                    <label for="field2">
                        Publication/Publisher:
                    </label>
                    <input className="form-control" type="text" name="publication-publisher" id="field2" required="required"/>
                </div>
                <div id="field3-container" className="form-group">
                    <label for="field3">
                        Publication Date:
                    </label>
                    <input className="form-control" type="date" id="field3" maxlength="524288" name="publication-date"
                           required="" size="20" tabindex="0" title=""/>
                </div>
                <div id="field5-container" className="radio-group required form-group">
                    <label for="field5-1">
                        Publication
                    </label>
                    <div className="option clearfix">
                        <input type="radio" name="publication" id="field5-1" value="Upload"/>
                    <span className="option-title">
                         Upload
                    </span>
                        <input type="radio" name="publication" id="field5-2" value="URL"/>
                    <span className="option-title">
                         URL
                    </span>
                    </div>
                </div>
                <div id="field4-container" className="form-group">
                    <label for="field4">
                        Upload:
                    </label>
                    <input className="form-control" type="file" name="publication-upload" id="field4" required="required"/>
                </div>
                <div id="field6-container" className="form-group">
                    <label for="field6">
                        URL:
                    </label>
                    <input className="form-control" type="url" name="publication-url" id="field6" required="required"/>
                </div>
                <div id="field8-container" className="form-group">
                    <label for="field8">
                        Authors:
                    </label>
                    <input className="form-control" type="text" name="authors" id="field8" required="required"/>
                </div>
                <div id="field9-container" className="form-group">
                    <label for="field9">
                        Description:
                    </label>
                    <input className="form-control" type="text" name="description" id="field9" required="required"/>
                </div>
                <div id="field10-container" className="form-group">
                    <label for="field10">
                        Tags:
                    </label>
                    <input className="form-control" type="text" name="tags" id="field10" required="required"/>
                </div>
                <table id="form-submit" width="100%"><tr>
                    <td className="padding-right"><input className="publication-button" type="submit" value="Submit"/></td>
                    <td className="padding-left"><input className="publication-button" type="submit" value="Cancel"/></td>
                </tr>
                </table>
            </form>
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
        publications: (new Parse.Query('Publication'))
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
                <div>
                <hr/>
                <div>
                    <h3 className="no-margin-top">{this.props.title} by {this.props.author}</h3>
                </div>
                <div>
                    {this.props.description}
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

React.render(<Profile />, document.getElementById('content'));
