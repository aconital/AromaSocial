var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var ButtonToolbar = ReactBootstrap.ButtonToolbar;
var DropdownButton= ReactBootstrap.DropdownButton;
var Dropdown= ReactBootstrap.Dropdown;
var Glyphicon= ReactBootstrap.Glyphicon;
var MenuItem= ReactBootstrap.MenuItem;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Carousel = ReactBootstrap.Carousel;
var Tooltip = ReactBootstrap.Tooltip;

const tooltipEquip = (
    <Tooltip className="tooltip2">Add an Equipment</Tooltip>
);
const tooltipConc = (
    <Tooltip className="tooltip2">Add a Connection</Tooltip>
);
const tooltipPeople = (
    <Tooltip className="tooltip2">Invite people to join</Tooltip>
);
var Organization = React.createClass ({
    getInitialState: function() {
        return {    isAdmin: [],
            status: '',
            organization_imgURL: [organization_imgURL],
            showModal: false,
            imgSubmitText: 'Upload',
            imgSubmitDisabled: false,
            isAdmin:false,
            modalMode: 1, //the active carousel item, values =1,2,3
            carousel_1_img: {carousel_1_img},
            carousel_2_img: {carousel_2_img},
            carousel_3_img: {carousel_3_img},
            errorText: 'Could not complete operation.'};
    },
    componentWillMount: function() {
        var connectURL= "/organization/"+objectId+"/join-status";

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
    clickOpen() {
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ imgSubmitText: "Upload" });
        this.setState({ imgSubmitDisabled: false });
        this.setState({ showModal: false});
    },
    componentDidMount : function() {
        console.log("In organization main: ", objectId);
        var peopleUrl = "/organization/" + objectId + "/admins";

        $.ajax({
            url: peopleUrl,
            success: function (data) {
                var isAdmin = false;
                for (var p in data) {
                    if (data[p].username == currentUsername)
                        isAdmin = true;
                }
                this.setState({isAdmin: isAdmin});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error("couldnt retrieve people");
            }.bind(this)
        })
    },
    clickJoin: function() {
        var connectURL= "/organization/"+objectId+"/join";

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
    clickLeave: function() {
        var self = this;
        var connectURL= "/organization/"+objectId+"/leave";
        var adminURL = "/organization/"+objectId+"/admins";

        $.ajax({
            url: adminURL,
            data: {getCount: true}
        }).done(function(count) {
            if (self.state.isAdmin && count < 2) {
                self.setState({errorText: "Can't leave network with no admins! Either delete network or add an administrator."});
                $("#error-dialog").show();
                setTimeout(function() { $("#error-dialog").hide(); }, 5000);
            } else {
                $.ajax({
                    url: connectURL
                }).done(function(status) {
                    console.log(status);
                    self.setState({status: "not-joined"});
                }).fail(function(xhr, status, error) {
                    console.log(status + ': ' + error);
                });
            }
        }).fail(function(xhr, status, err) {
            console.log(status + ': ' + error);
        });

    },
    submitPicture: function() { 
        var dataForm = {name: this.state.name, picture: this.state.picture, pictureType: this.state.pictureType};
        this.setState({imgSubmitText: "Uploading. Give us a sec..."});
        this.setState({imgSubmitDisabled:true});
        var that = this;
        $.ajax({
            url: path + "/updatePicture",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(data.status);
                this.setState({organization_imgURL: this.state.picture});
                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/update", status, err.toString());
            }.bind(this)
        }).then(function() {
            that.setState({imgSubmitText: "Upload"});
            that.setState({imgSubmitDisabled:false});
        }, function(err) {
            that.setState({imgSubmitText: "Error. Please select an image and click me again."});
            that.setState({imgSubmitDisabled:false});
        });
        return;
    },
    deleteOrg:function(orgId){
        var connectURL= "/organization/"+orgId+"/delete";

        $.ajax({
            url: connectURL,
            success: function(status) {
                location.reload();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't retrieve people.");
            }.bind(this)
        });

    },
    handlePicture: function(e) { //todo export utils
        var self = this,
            reader = new FileReader(),
            file = e.target.files[0],
            extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                picture: upload.target.result,
                pictureType: extension
            });
        }
        reader.readAsDataURL(file);
    },

    render: function() {
        var joinButton = <button className="btn btn-panel btn-right-side" value=""></button>;
        // var orgNameArr = name.split(".");
        // var orgName = orgNameArr[0];

        if (this.state.status == "joined") {
            joinButton = <button onClick={this.clickLeave} className="btn btn-panel btn-right-side" value="Leave">Leave</button>;
        }
        else if (this.state.status == "pending") {
            joinButton = <button className="btn btn-panel btn-right-side pending_btn" value="Pending">Pending</button>;
        }
        else if (this.state.status == "not-joined") {
            joinButton = <button onClick={this.clickJoin} className="btn btn-panel btn-right-side" value="Join">Join</button>;
        }

        if(this.state.isAdmin)
            return (
                <div>
                    <Modal show={this.state.showModal} onHide={this.clickClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Organization Picture</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div id="field1-container">
                                <input className="form-control" type="file" name="publication-upload" id="picture" required="required" placeholder="File" onChange={this.handlePicture} />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <input className="publication-button" type="submit" disabled={this.state.imgSubmitDisabled} value={this.state.imgSubmitText} onClick={this.submitPicture} />
                        </Modal.Footer>
                    </Modal>
                    <div className="content-wrap">
                        <div id="error-dialog">
                            <div className="alert alert-danger">
                                <strong>Error:</strong> <span id="error-string">{this.state.errorText}</span>
                            </div>
                        </div>
                        <div className="item-bottom">
                            <div className="item-row1">
                            </div>
                            <div className="item-row1">
                                <div className="item-bottom-1">
                                <a href="#" onClick={this.clickOpen}>
                                    <div className="edit-overlay-div">
                                        <img src={this.state.organization_imgURL} className="contain-image" />
                                        <div className="edit-overlay-background">
                                            <span className="glyphicon glyphicon-edit edit-overlay"></span></div>
                                    </div>
                                </a>
                            </div>
                            <div id="item-bottom-2-organization" className="item-bottom-2">
                                <div className="interact-buttons-wrap">
                                    {joinButton}
                                    <button onClick={this.deleteOrg.bind(self, objectId)} className="btn btn-panel btn-right-side" value="Delete">Delete Page</button>
                                </div>
                                <h3 className="no-margin-padding align-left h1-title">{displayName}</h3>
                                <h4 className="no-margin-padding align-left h3-title">{orgLocation}</h4>
                            </div>
                            </div>
                        </div>
                                <div className="item-bottom-3">

                                    <OrganizationMenu isAdmin = {this.state.isAdmin}  tabs={['Home','About', 'Equipment', 'Projects', 'Publications', 'Figures & Data', 'Software & Code']} />
                        </div>
                    </div>
                </div>
            );
        //not admin
        else
            return (
                <div>
                    <div className="content-wrap">
                        <div id="error-dialog">
                            <div className="alert alert-danger">
                                <strong>Error:</strong> <span id="error-string">{this.state.errorText}</span>
                            </div>
                        </div>
                        <div className="item-bottom">
                            <div className="item-row1">
                            </div>
                            <div className="item-row1">
                                <div className="item-bottom-1">
                                            <img src={this.state.organization_imgURL} className="contain-image" />
                                </div>
                                <div id="item-bottom-2-organization" className="item-bottom-2">
                                    <div className="interact-buttons-wrap">
                                    {joinButton}
                                    </div>
                                    <h3 className="no-margin-padding align-left h1-title">{displayName}</h3>
                                    <h4 className="no-margin-padding align-left h3-title">{orgLocation}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="item-bottom-3">

                            <OrganizationMenu isAdmin = {this.state.isAdmin}  tabs={['Home','About', 'Equipment', 'Projects', 'Publications', 'Figures & Data', 'Software & Code']} />
                        </div>
                    </div>
                </div>

            );
    }
});

var OrganizationMenu = React.createClass ({
    getInitialState: function () {
        return {activeLabelIndex: 0, selectedTab: 0};
    },
    clicked: function (index) {
        this.setState({activeLabelIndex: index, selectedTab: index});
    },
    showPeople: function (index) {
        this.setState({activeLabelIndex: -1, selectedTab: index});
    },
    showConnections: function (index)
    {
        this.setState({activeLabelIndex: -1, selectedTab: index});
    },
    render: function() {
        var self = this;

        var tabMap = {
            0: <Home viewConnections={this.showConnections.bind(self,3)} viewPeople={this.showPeople.bind(self,2)} objectId={objectId} />,
            1: <About objectId={objectId} />,
            2: <People isAdmin={this.props.isAdmin} />,
            3: <Connections isAdmin={this.props.isAdmin}  />,
            4: <Equipments objectId={objectId}/>,
            5: <Projects objectId={objectId}/>,
            6: <Publications objectId={objectId}/>,
            7: <Data objectId={objectId}/>,
            8: <Models objectId={objectId}/>

        };
        return (
            <div>
                <div id="tabs">
                    <ul id="content-nav">
                        {this.props.tabs.map(function(tab,index){
                            var style = "";
                            if (self.state.activeLabelIndex == index) {
                                style = "selected-tab";
                            }
                            return <li id={style}>
                                <a href="#" onClick={self.clicked.bind(self, index)} id={style}>{tab}</a>
                            </li>;
                        })}
                    </ul>
                </div>
                <div id="content" className="content">
                    {tabMap.hasOwnProperty(self.state.selectedTab) ? tabMap[self.state.selectedTab] : ""}
                </div>
            </div>
        );
    }
});

var Home = React.createClass({
    getInitialState: function() {
        return {showModal:false,discussions:[]}
    },
    componentWillMount : function() {
        var discussionsUrl= "/organization/"+objectId+"/discussions";
        $.ajax({
            type: 'GET',
            url: discussionsUrl,
            success: function(data) {
                this.setState({ discussions: data.discussions });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve discussions!");
            }.bind(this)
        });
    },
    openModal:function(){
        this.setState({showModal:true});
    },
    closeModal:function(){
        this.setState({showModal:false});
    },inviteTrigger: function(e) {
    console.log(e);
    e.stopPropagation();
    var source = {
        id: objectId,
        name: name,
        displayName: displayName,
        imgUrl: picture
    };
    invite(e.nativeEvent, "org2people", source);
},
    render:function(){
        var discussions;
            if(this.state.discussions.length>0)
            {
                discussions = this.state.discussions.map(function (disc) {
                    return (
                        <Discussion discId={disc.id} topic={disc.topic} createdAt={disc.created} madeBy={disc.madeBy}
                                    key={disc.id}>
                            {disc.content.msg}
                        </Discussion>
                    );
                });
            }
        else
            {
                discussions= <div className="no-discussion"><p>This network does not have any open discussion yet!</p></div>
            }
        return (
            <div className="row">
                <Modal show={this.state.showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Discussion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                           <CreateDiscussion/>
                    </Modal.Body>
                </Modal>
                <div className="col-xs-12 col-sm-8 col-md-8 col-lg-8">
                    <h4 className="discussion-form-headline">Recent discussions <a onClick={this.openModal}className="create-discussion-list">Create New</a></h4>
                  <div className="items-list">
                      {discussions}
                  </div>
                </div>
                <div className="col-xs-12 col-sm-4 col-md-4 col-lg-4">
                    <div className = "createorg_panel">
                        <button className="btn btn-panel createorg_btn" value="Create Discussion"><span className="nfButton"><i className="fa fa-calendar-plus-o" aria-hidden="true"></i> Create Event</span></button>
                    </div>
                    <div className = "panel search-panel your-groups">
                        <h4 className="white"><span className="nfButton">Upcoming Events</span></h4>
                            <div className="list-group">
                                <a href="#"  className="list-group-item groups-list">&#x25cf; BBQ Party</a>
                                <a href="#"  className="list-group-item groups-list">&#x25cf; All You can eat sushi</a>
                            </div>
                    </div>

                    <div className="row">
                        <div>
                        <h4><span className="nfButton">Members <small>(<a onClick={this.props.viewPeople} href="#">124</a>)</small></span></h4>
                        </div>
                        <div className="member-section">
                         <ul className="thumbnail-list">
                             <li><img src="http://159.203.60.67:1336/parse/files/development/f288f2f08b4f197c3d077fce068690d9_user_picture.jpg" /></li>
                             <li><img src="http://159.203.60.67:1336/parse/files/development/96c7110632da4e71812e74f8d2206bd7_user_picture.jpg" /></li>
                             <li><img src="http://159.203.60.67:1336/parse/files/development/8e73c4c765a8dc93ae945883e21ef82e_user_picture.jpg" /></li>
                             <li><img src="http://159.203.60.67:1336/parse/files/development/51bc3e7b22434d0036dc3f8821e0f0ce_user.png" /></li>
                         </ul>
                        </div>
                        <div className = "createorg_panel">
                            <button className="btn btn-panel createorg_btn" onClick={this.inviteTrigger}><span className="nfButton"><i className="fa fa-user-plus" aria-hidden="true"></i> Invite Members</span></button>
                        </div>
                    </div>
                    <div className="row home-connections-box">
                        <div>
                            <h4><span className="nfButton">Networks <small>(<a onClick={this.props.viewConnections} href="#">3</a>)</small></span></h4>
                        </div>
                        <div className="member-section">
                            <ul className="thumbnail-list">
                                <li><img src="http://159.203.60.67:1336/parse/files/development/9fdb1cf649b1814567ef53dbbed0a7de_org_picture.png" /></li>
                                <li><img src="https://upload.wikimedia.org/wikipedia/en/0/03/Uwaterloo_seal.gif" /></li>
                                <li><img src="https://meds.queensu.ca/templates/medicine/img/QueensLogo_colour.png" /></li>
                            </ul>
                        </div>
                        <div className = "createorg_panel">
                            <button className="btn btn-panel createorg_btn" onClick={this.inviteTrigger}><span className="nfButton"><i className="fa fa-connectdevelop" aria-hidden="true"></i> Join More</span></button>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
});
var CreateDiscussion = React.createClass({
    getInitialState: function() {
        return {content: '', topic: ''};
    },
    handleTopicChange: function(e) {
        this.setState({topic: e.target.value});
    },
    handleContentChange: function(e) {
        this.setState({content: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var topic = this.state.topic;
        var content = this.state.content;
        if (!topic || topic.trim()== "" || !content || content.trim()=="") {
            return;
        }
        $.ajax({
            url: '/organization/'+objectId+'/discussions/',
            method:'post',
            data: {topic: topic,content:content},
            success: function(data) {
                this.setState({topic: '',content:''});
                location.reload();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    },
    render:function(){
        return (
            <div className="row">
                <div className="col-xs-12">
                    <form>
                        <label>Title</label>
                        <input
                            placeholder="Choose a title for your discussion"
                            className="creatediscussion-topic"
                            type="text"
                            value={this.state.topic}
                            onChange={this.handleTopicChange}
                            />
                        <textarea
                         rows="8" cols="50"
                         className="creatediscussion-input"
                         placeholder=""
                         value = {this.state.content}
                         onChange={this.handleContentChange}>
                        </textarea>
                    </form>
                    <div>
                        <a onClick={this.handleSubmit} className="submit-discussion">Submit</a>
                    </div>
                </div>
            </div>
        );
    }
});
var Discussion = React.createClass ({
    getInitialState: function() {
        return {createdAt:""};
    },
    componentDidMount: function() {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
        setInterval(this.refreshTime, 30000);
    },
    refreshTime: function () {
        this.setState({createdAt:moment(this.props.createdAt).fromNow()});
    },
    rawMarkup: function() {
        var rawMarkup = marked(this.props.children, {sanitize: true});
        return { __html: rawMarkup };
    },
    deleteDiscussion:function(discId)
    { console.log(discId);
    swal({   title: "Are you sure?",
            text: "You will not be able to recover this discussion and its posts!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            loseOnConfirm: false },
        function(){
            $.ajax({
                type: 'DELETE',
                url: "/organization/"+objectId+"/discussions/",
                data:{discId:discId,orgName:name},
                success: function(data) {
                    swal("Deleted!", "Your Discussion has been deleted.", "success");
                    location.reload();
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error("Couldn't Retrieve discussions!");
                }.bind(this)
            });
        });
},
    render:function(){
        return (
            <div  className="row discussion-row" id="item-list">
                <div className="col-xs-3 col-lg-2 discussion-user-img">
                        <a href={"/profile/"+this.props.madeBy.username}><img src={this.props.madeBy.imgUrl} className="discussion-userImg" /></a>
                </div>
                <div className="col-xs-8 col-lg-9 discussion-user-info">
                    <a href={"/profile/"+this.props.madeBy.username} className="body-link"><h4 className="margin-top-bottom-5">{this.props.madeBy.fullname}</h4></a>
                    <p className="discussion-about">{this.props.madeBy.about}</p>
                    <p className="discussion-Date">{this.state.createdAt}</p>
                </div>
                <div className="col-xs-1 col-lg-1">
                    { currentUsername == this.props.madeBy.username? <a onClick={this.deleteDiscussion.bind(this,this.props.discId)} className="discussion-remove"><i className="fa fa-times" aria-hidden="true"></i></a>:""}
                </div>
                <div className="col-xs-12 col-lg-12">
                    <p ><a href={"/organization/"+objectId+"/discussions/"+this.props.discId} className="discussion-topic">{this.props.topic}</a></p>
                    <p className="discussion-content" dangerouslySetInnerHTML={this.rawMarkup()} />
                </div>
            </div>
        );
    }


});
var About = React.createClass({
    getInitialState: function(){
        return {about: about,
            orgCountry: orgCountry,
            orgProv: orgProv,
            orgCity: orgCity,
            orgStreet: orgStreet,
            orgPostalcode: orgPostalcode,
            orgWebsite: orgWebsite,
            orgTel: orgTel,
            orgFax: orgFax,
            orgEmail: orgEmail,
            carousel_1_img:{carousel_1_img},
            carousel_1_head: carousel_1_head,
            carousel_1_body: carousel_1_body,
            carousel_2_img: {carousel_2_img},
            carousel_2_head: carousel_2_head,
            carousel_2_body: carousel_2_body,
            carousel_3_img: {carousel_3_img},
            carousel_3_head: carousel_3_head,
            carousel_3_body: carousel_3_body,
            showModal: false,
            isAdmin:false,
            modalMode : 1 //the active carousel item, values =1,2,3
        };
    },
    componentDidMount : function() {
        var isAdminURL= "/organization/"+objectId+"/isAdmin";
        $.ajax({
            type: 'GET',
            url: isAdminURL,
            success: function(isAdminData) {
                this.setState({ isAdmin: isAdminData.isAdmin });
                console.log(isAdminData.isAdmin);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
            }.bind(this)
        });
    },
    handlePicture: function(e) { //todo export utils
        var self = this,
            reader = new FileReader(),
            file = e.target.files[0],
            extension = file.name.substr(file.name.lastIndexOf('.')+1) || '';

        reader.onload = function(upload) {
            self.setState({
                picture: upload.target.result,
                pictureType: extension
            });
        }
        reader.readAsDataURL(file);
    },

    handleChange: function(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    submitChange: function() {
        var dataForm = {isAdmin: false, about: this.state.about.replace(/(\r\n|\n|\r|\\)/gm,'\\n'),
                        carousel_1_head: this.state.carousel_1_head, carousel_1_body: this.state.carousel_1_body,
                        carousel_2_head: this.state.carousel_2_head, carousel_2_body: this.state.carousel_2_body,
                        carousel_3_head: this.state.carousel_3_head, carousel_3_body: this.state.carousel_3_body,
            country: this.state.orgCountry,
            prov: this.state.orgProv,
            city: this.state.orgCity,
            street: this.state.orgStreet,
            postalcode: this.state.orgPostalcode,
            website: this.state.orgWebsite,
            tel: this.state.orgTel,
            fax: this.state.orgFax,
            email: this.state.orgEmail
        };
        console.log(JSON.stringify(dataForm));
        $.ajax({
            url: path + "/update",
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
    },

    submitCarouselPicture_1: function() { //todo export utils
        var dataForm = {name: this.state.name, picture: this.state.picture, pictureType: this.state.pictureType};
        $.ajax({
            url: path + "/updateCarouselPicture_1",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(data.status);
                this.setState({carousel_1_img: this.state.picture});

                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/updateCarouselPicture_1", status, err.toString());
            }.bind(this)
        });
        return;
    },
    submitCarouselPicture_2: function() { //todo export utils
        var dataForm = {name: this.state.name, picture: this.state.picture, pictureType: this.state.pictureType};
        $.ajax({
            url: path + "/updateCarouselPicture_2",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(data.status);
                this.setState({carousel_2_img: this.state.picture});

                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/updateCarouselPicture_2", status, err.toString());
            }.bind(this)
        });
        return;
    },
    submitCarouselPicture_3: function() { //todo export utils
        var dataForm = {name: this.state.name, picture: this.state.picture, pictureType: this.state.pictureType};
        $.ajax({
            url: path + "/updateCarouselPicture_3",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                console.log(data.status);
                this.setState({carousel_3_img: this.state.picture});

                this.clickClose();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/updateCarouselPicture_3", status, err.toString());
            }.bind(this)
        });
        return;
    },
    clickOpen(modalMode) {
        this.setState({modalMode : modalMode});
        console.log(modalMode);
        this.setState({ showModal: true });
    },
    clickClose() {
        this.setState({ showModal: false});
    },
    render: function() {

        if (this.state.isAdmin)
            return (
                <div>
                    <Modal show={this.state.showModal} onHide={this.clickClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Carousel Picture</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div id="field1-container">
                                <input className="form-control" type="file" name="publication-upload" id="picture" required="required" placeholder="File" onChange={this.handlePicture} />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            {(this.state.modalMode == 1)? <input className="publication-button" type="submit" value="Submit" onClick={this.submitCarouselPicture_1} />: ""}
                            {(this.state.modalMode == 2)? <input className="publication-button" type="submit" value="Submit" onClick={this.submitCarouselPicture_2} />: ""}
                            {(this.state.modalMode == 3)? <input className="publication-button" type="submit" value="Submit" onClick={this.submitCarouselPicture_3} />: ""}
                        </Modal.Footer>
                    </Modal>
                    <div className="carousel_div">
                    <Carousel>

                        <Carousel.Item>
                            <a href="#" onClick={()=>this.clickOpen(1)} id="carousel-image"><div className="carousel_div"><img src={carousel_1_img} className="carousel_img"/><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a>

                            <Carousel.Caption>

                                <h3><textarea rows="1" type="text" className="carouselTextarea" id="carousel_1_head" placeholder="Image Title" name="carousel_1_head" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_1_head}</textarea></h3>
                                <p><textarea rows="1" type="text" className="carouselTextarea" id="carousel_1_body" placeholder="Image Description" name="carousel_1_body" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_1_body}</textarea></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <a href="#" onClick={()=>this.clickOpen(2)} id="carousel-image"><div className="carousel_div"><img src={carousel_2_img} className="carousel_img" /><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a>

                            <Carousel.Caption>
                                <h3><textarea rows="1" type="text" className="carouselTextarea" id="carousel_2_head" placeholder="Image Title" name="carousel_2_head" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_2_head}</textarea></h3>
                                <p><textarea rows="1" type="text" className="carouselTextarea" id="carousel_2_body" placeholder="Image Description" name="carousel_2_body" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_2_body}</textarea></p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item>
                            <a href="#" onClick={()=>this.clickOpen(3)} id="carousel-image"><div className="carousel_div"><img src={carousel_3_img} className="carousel_img" /><div className="edit-overlay-background edit-overlay-background-big"><span className="glyphicon glyphicon-edit edit-overlay"></span></div></div></a>
                            <Carousel.Caption>
                                <h3><textarea rows="1" type="text" className="carouselTextarea" id="carousel_3_head" placeholder="Image Title" name="carousel_3_head" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_3_head}</textarea></h3>
                                <p><textarea rows="1" type="text" className="carouselTextarea" id="carousel_3_body" placeholder="Image Description" name="carousel_3_body" onChange={this.handleChange} onBlur={this.submitChange}>{carousel_3_body}</textarea></p>
                            </Carousel.Caption>
                        </Carousel.Item>

                    </Carousel>
                        </div>
                    <div className="resume-item div-relative ">

                        <textarea rows="5" type="text" className="r-editable r-editable-full" id="about" placeholder="Summary of activities" name="about" onChange={this.handleChange} onBlur={this.submitChange}>{about}</textarea>
                    </div>
                    <div id="organizaiton_address" className="div-relative"><hr/>
                        <div>
                            <h3 className="no-margin-top" >Contact</h3>
                        </div>
                        <table className="resume-item div-relative ">
                            <tbody >

                                <tr >

                                  <td> <input id="streetInp" type="text" className="p-editable transparent" name="orgStreet" placeholder="Street Address, Unit/Room #"  onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgStreet} /></td>
                                </tr>
                                <tr >
                                    <td ><input type="text" className="p-editable transparent" placeholder="Country" name="orgCountry" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgCountry} /></td>

                                    <td ><input type="text" className="p-editable transparent" placeholder="State / Province" name="orgProv" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgProv} /></td>
                                </tr>
                                <tr >
                                    <td><input type="text" className="p-editable transparent" name="orgCity" placeholder="City" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgCity} /></td>

                                    <td><input type="text" className="p-editable transparent" name="orgPostalcode" placeholder="Zip / Postal-code" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgPostalcode} /></td>
                                </tr >

                                <tr>
                                    <td className="tdnowrap"><span>Tel:</span><input type="text" id="telInp" className="p-editable transparent" name="orgTel" placeholder="+cc-area-number" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgTel} /></td>
                                </tr>
                                <tr>
                                    <td className="tdnowrap"><span>Fax:</span><input type="text" className="p-editable transparent" name="orgFax" placeholder="+cc-area-number" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgFax} /></td>
                                </tr>
                                <tr>
                                    <td className="tdnowrap"><span>Email:</span><input type="text" className="p-editable transparent" name="orgEmail" placeholder="Email" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgEmail} /></td>
                                </tr>
                                <tr>
                                    <td className="tdnowrap"><span>Website:</span><input type="text" className="p-editable transparent" name="orgWebsite" placeholder="Website url" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.orgWebsite} /></td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                </div>

        ) ;
        //not admin
        else
        return (
            <div>
            {(carousel_1_img != "/images/carousel.png" || carousel_2_img != "/images/carousel.png" || carousel_3_img != "/images/carousel.png")?
                <div className="carousel_div">
                <Carousel>
                   {(carousel_1_img != "/images/carousel.png")?
                        <Carousel.Item>
                            <img src={carousel_1_img}/>
                            <Carousel.Caption>
                                <h3>{carousel_1_head}</h3>
                                <p>{carousel_1_body}</p>
                            </Carousel.Caption>
                        </Carousel.Item> :"" }
                    {(carousel_2_img != "/images/carousel.png")?
                        <Carousel.Item>
                            <img src={carousel_2_img}/>
                            <Carousel.Caption>
                                <h3>{carousel_2_head}</h3>
                                <p>{carousel_2_body}</p>
                            </Carousel.Caption>
                        </Carousel.Item> :"" }
                    {(carousel_3_img != "/images/carousel.png")?
                        <Carousel.Item>
                            <img src={carousel_3_img}/>
                            <Carousel.Caption>
                                <h3>{carousel_3_head}</h3>
                                <p>{carousel_3_body}</p>
                            </Carousel.Caption>
                        </Carousel.Item> :"" }
                </Carousel></div> : ""
                }
            {(about != "")?
                <div className="resume-item div-relative ">

                    <pre>{about}</pre>
                </div>:""}
            {(orgStreet != "" || orgCity != "" || orgProv != "" || orgCountry != "" || orgPostalcode != "" || orgEmail != "" || orgTel != "" || orgFax != "" || orgWebsite != "") ?
                <div id="organizaiton_address" className="div-relative"><hr/>
                    <div>
                        <h3 className="no-margin-top" >Contact</h3>
                    </div>
                    <table className="resume-item div-relative ">
                        <tbody >

                            <tr >
                                {(orgStreet != "")?<td className="tdnowrap">{orgStreet}</td> : ""}
                            </tr>
                            <tr >
                                {(orgLocation != "")?<td className="tdnowrap">{orgLocation}</td> : ""}
                            </tr>
                            <tr >
                                {(orgPostalcode != "")?<td className="tdnowrap">{orgPostalcode}</td> : ""}
                            </tr>
                            <tr >
                                {(orgTel != "")?<td className="tdnowrap"><span>Tel:</span>{orgTel}</td> : ""}
                            </tr>
                            <tr >
                                {(orgFax != "")?<td className="tdnowrap"><span>Fax:</span>{orgFax}</td> : ""}
                            </tr>
                            <tr >
                                {(orgEmail != "")?<td className="tdnowrap"><a href={"mailto:"+orgEmail}>{orgEmail}</a></td> : ""}
                            </tr>
                            <tr >
                                {(orgWebsite != "")?<td className="tdnowrap"><a href={orgWebsite} target="blank">{orgWebsite}</a></td> : ""}
                            </tr>
                        </tbody>
                    </table>
                </div>
                :""}

            </div>
        );
    }

})

var Connections = React.createClass({
    getInitialState: function() {
        return {data: [], showModal: false };
    },
    componentDidMount : function(){
        var connectionUrl= "/organization/"+objectId+"/connections";
        $.ajax({
            url: connectionUrl,
            success: function(data) {
                this.setState({data:data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("couldnt retrieve orgs");
            }.bind(this)
        });

        var isAdminURL= "/organization/"+objectId+"/isAdmin";
        $.ajax({
            type: 'GET',
            url: isAdminURL,
            success: function(isAdminData) {
                this.setState({ isAdmin: isAdminData.isAdmin });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
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
        var orgList = $.map(this.state.data,function(org) {
            return (
                <div className="item-box">
                    <div className="item-box-left">
                        <div className="item-box-image-outside">
                            <a href={'/organization/'+org.name}><img src={org.orgImgUrl} className="item-box-image" /></a>
                        </div>
                    </div>
                    <div className="item-box-right">
                        <a href={'/organization/'+org.name} className="body-link"><h3 className="margin-top-bottom-5">{org.displayName}</h3></a>
                        <span className="font-15">{org.location}</span>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Connection</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <AddConnection submitSuccess={this.clickClose}/>
                    </Modal.Body>
                </Modal>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tbody>
                        <tr>
                            {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                            {(this.state.isAdmin) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltipConc}><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></OverlayTrigger></td> : <td></td>}
                        </tr>
                        </tbody>
                    </table>
                </div>
                {orgList}
            </div>
        )
    }
});

var AddConnection = React.createClass({
    close: function(e) {
        if (typeof this.props.submitSuccess === 'function') {
            this.props.submitSuccess();
        }
    },
    getInitialState: function() {
        return {
            joinOrganization: '',
            organizationId: '',
            joinType: '',
            formFeedback: ''
        }
    },
    componentDidMount : function(){
        var component = this;
        var autocomplete=<script>
            $(function() {
            $('.auto2').autocomplete({
                source: function(req, res) {
                    $.ajax({
                        url: '/allorganizations',
                        dataType: 'json',
                        cache: false,
                        success: function(data) {
                            var arr = $.grep(data, function(item){
                                return item.name.substring(0, req.term.length).toLowerCase() === req.term.toLowerCase();
                            });
                            res($.map(arr, function(item){
                                return {
                                    label: item.displayName,
                                    id: item.objectId
                                };
                            }));
                        },
                        error: function(xhr) {
                            console.log(xhr.status);
                        }
                    });
                },
                select: function(event, ui){
                    component.setState({organizationId: ui.item.id});
                },
                messages: {
                    noResults: '',
                    results: function() {}
                }
            })
        });
        </script>
        $("#scriptContainer").append(autocomplete);
    },

    render: function() {
        return (
            <div>
                <div id="scriptContainer"></div>
                <form className="form" onSubmit={this.handleSubmitData}>
                    <Input className="auto2" type="text" placeholder="Organization:" name="joinOrganization" label="Organization" required onChange={this.handleChange} value={this.state.organization}/>
                    <Input type="select" name="joinType" label="Connection type" required onChange={this.handleChange} value={this.state.organizationtype}>
                        <option value=""></option>
                        <option value="contains">We are part of this organization</option>
                        <option value="sponsors">This organization sponsors us</option>
                        <option value="collaborates">We collaborate with this organization</option>
                    </Input>
                    <Modal.Footer>
                        <Input className="btn pull-right" type="submit" value="Continue" />
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
        var connectionURL = "/organization/"+objectId+"/connect";
        var dataForm = {orgId: this.state.organizationId, type: this.state.joinType};
        this.setState({formFeedback: 'In progress...'});
        $.ajax({
            url: connectionURL,
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(dataForm),
            processData: false,
            success: function(data) {
                this.setState({formFeedback: 'Connection request sent.'});
                this.close();
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({formFeedback: 'Error creating connection: ' + err.toString()});
                this.close();
            }.bind(this)
        });
        return;
    }
});

var People = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        this.getPeople();
    },
    getPeople:function(){
        var peopleUrl= "/organization/"+objectId+"/people";
        $.ajax({
            url: peopleUrl,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve People");
            }.bind(this)
        });
    },
    deleteMember:function(userId)
    {

        $.ajax({
            url: '/organization/'+objectId+'/kick',
            type: 'POST',
            data: {userId:userId},
            success: function(data) {
                this.getPeople();
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(err);
            }.bind(this)
        });
    },
    MakeRemoveAdmin:function(userId,action)
    {
        $.ajax({
            url: '/organization/'+objectId+'/admin',
            type: 'POST',
            data: {userId:userId,makeAdmin:action},
            success: function(data) {
                this.getPeople();
            }.bind(this),
            error: function(xhr, status, err) {
               console.log(err);
            }.bind(this)
        });

    },
    inviteTrigger: function(e) {
        console.log(e);
        e.stopPropagation();
        var source = {
            id: objectId,
            name: name,
            displayName: displayName,
            imgUrl: picture
        };
        invite(e.nativeEvent, "org2people", source);
    },
    render: function() {
        var triggerFunc = this.inviteTrigger;
        var parent= this;
        var isAdmin= this.props.isAdmin;
        var peopleList = $.map(this.state.data,function(objects) {
            var role= objects[0].title;
            var plist=[];
            for(var i in objects) {
                var person = objects[i];
                plist.push(person);
            }

            return (
                <div id="items-list">
                    <div className="item-search-div">
                        <table className="item-search-field" width="100%">
                            <tr>
                                {(isAdmin) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltipPeople}><input className="item-add-button" onClick={triggerFunc} type="button" value="+"/></OverlayTrigger></td> : ""}
                            </tr>
                        </table>
                    </div>
                    <div className="clear"></div>
                    <div><h2 className="margin-top-bottom-5">{role}</h2></div>
                    <div className="clear"></div>
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
                                <div className="item-box-right">
                                    {(isAdmin == true && person.username != currentUsername) ? <a onClick={parent.deleteMember.bind(self,person.id)} href="#" alt="Delete member">Delete member</a>:""}
                                 </div>
                                <div className="item-box-right">
                                    {(isAdmin==true && person.isAdmin != true && person.username != currentUsername) ? <a onClick={parent.MakeRemoveAdmin.bind(self,person.id,true)} href="#" alt="Make Admin">Make Admin</a>:""}
                                    {(isAdmin==true && person.isAdmin == true && person.username != currentUsername) ? <a onClick={parent.MakeRemoveAdmin.bind(self,person.id,false)} href="#" alt="Make Admin">Remove Admin</a>:""}

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


var NewsAndEvents = React.createClass({
    render: function() {
        return (
            <div>
                News And Events
            </div>
        )
    }
});

var Knowledge = React.createClass({
    render: function() {
        return (
            <div>
                Knowledge
            </div>
        )
    }
});

var Equipments = React.createClass({
    getInitialState: function() {
        return { data: [], showModal: false, isAdmin: false };
    },
    componentWillMount : function() {
        var equipmentsURL= "/organization/"+objectId+"/equipments_list";

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
    componentDidMount : function() {
        var isAdminURL= "/organization/"+objectId+"/isAdmin";

        $.ajax({
            type: 'GET',
            url: isAdminURL,
            success: function(isAdminData) {
                this.setState({ isAdmin: isAdminData.isAdmin });
                console.log(isAdminData.isAdmin);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve isAdmin!");
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
            return (
                <div className="item-box" key={item.objectId}>
                    <div>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/equipment/'+item.objectId}><img src={item.picture.url} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/equipment/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <span className="font-15">
                            <table className="item-box-right-tags">
                            {/* <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                            </span>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.clickClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add Equipment</Modal.Title>
                    </Modal.Header>
                    <EquipmentAddForm submitSuccess={this.clickClose} />
                </Modal>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tr>
                            {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                            {(this.state.isAdmin) ? <td className="padding-left-5"><OverlayTrigger placement="right" overlay={tooltipEquip}><input className="item-add-button" onClick={this.clickOpen} type="button" value="+"/></OverlayTrigger></td> : <td></td>}
                        </tr>
                    </table>
                </div>
                {itemsList}
            </div>
        )
    }
});

var EquipmentAddForm = React.createClass({
    close: function(e) {
        this.setState({imgSubmitText: 'Continue'});
        this.setState({imgSubmitDisabled: false});
        this.props.submitSuccess();
    },
    getInitialState: function() {
        return {
            alertVisible: false,
            buttonStyles: {maxWidth: 400, margin: '0 auto 10px'},
            formFeedback: '',
            fileFeedback: {},
            pictureFeedback: '',
            imgSubmitText: 'Continue',
            imgSubmitDisabled: false,
            // form
            picture: null,
            file: null,
            pictureType: '',
            fileType: '',
            title: '',
            keywords: [],
            description: '',
            instructions: '',
            model: '',
            model_year: '',
            organizationId: objectId
        };
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
                            <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={{background: this.state.pictureFeedback}}>
                                Add Picture <input type="file" accept="image/gif, image/jpeg, image/png" onChange={this.handlePicture} />
                            </Button>
                            <Button bsSize="large" className="btn-file" onClick={this.openFileUpload} block style={this.state.fileFeedback}>
                                Select Files... <input type="file" onChange={this.handleFile} />
                            </Button>
                        </div>
                        <Input type="text" placeholder="Title:" name="title" required onChange={this.handleChange} value={this.state.title} />
                        <Input type="textarea" placeholder="Description:" name="description" onChange={this.handleChange} value={this.state.description} />
                        <Input type="textarea" placeholder="Instructions:" name="instructions" onChange={this.handleChange} value={this.state.instructions} />
                        <Input type="text" placeholder="Model:" name="model" onChange={this.handleChange} value={this.state.model} />
                        <Input type="text" placeholder="Model Year:" name="model_year" onChange={this.handleChange} value={this.state.model_year} />
                        <ReactTagsInput type="textarea" placeholder="Keywords:" required name="keywords" onChange={this.handleKeyChange} value={this.state.keywords} />
                    </Modal.Body>
                    <Modal.Footer>
                        <input className="full-button" type="submit" disabled={this.state.imgSubmitDisabled} value={this.state.imgSubmitText}/>
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
    handleSubmitData: function(e) {
        e.preventDefault();

        var dataForm = {    file: this.state.file,
            picture: this.state.picture,
            organizationId: this.state.organizationId,
            fileType: this.state.fileType,
            pictureType: this.state.pictureType,
            description: this.state.description,
            instructions: this.state.instructions,
            model: this.state.model,
            model_year: this.state.model_year,
            keywords: JSON.stringify(this.state.keywords),
            title: this.state.title};
        console.log(JSON.stringify(dataForm));

        var isValidForm = this.validateForm();
        if (isValidForm.length === 0) {
            var endpoint = "/equipment";
            var dataFormORIG = {file: this.state.file, picture: this.state.picture, organizationId: this.state.organizationId,
                fileType: this.state.fileType, pictureType: this.state.pictureType,
                description: this.state.description, instructions: this.state.instructions, model: this.state.model,
                model_year: this.state.model_year, keywords: this.state.keywords, title: this.state.title};

            this.setState({imgSubmitText: 'Creating Equipment. Give us a sec...'});
            this.setState({imgSubmitDisabled: true});
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
            }).then(function(){
                that.setState({imgSubmitText: 'Continue'});
                that.setState({imgSubmitDisabled: false});
            }, function(err) {
                that.setState({imgSubmitText: 'Error. Check fields and try again'});
                that.setState({imgSubmitDisabled: false});
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
        if (this.state.keywords.length<1) {
            issues.push("KEYWORDS");
        }
        return issues;
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
        var projectsURL= "/organization/"+objectId+"/projects_list";

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
            item.start_date = (new Date(item.start_date)).toUTCString().slice(8,-12);

            return (
                <div className="item-box">
                    <div key={item.objectId}>
                        <div className="item-box-left">
                            <div className="item-box-image-outside">
                                <a href={'/project/'+item.objectId}><img src={item.picture.url} className="item-box-image"/></a>
                            </div>
                        </div>
                        <div className="item-box-right">
                            <a href={'/project/'+item.objectId} className="body-link"><h3 className="margin-top-bottom-5">{item.title}</h3></a>
                            <table className="item-box-right-tags">
                                <tr><td><b>Collaborators: </b></td><td>{item.collaborators.map(function(collaborator) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{collaborator}</a>;})}</td></tr>
                                <tr><td><b>Start Date: </b></td><td>{item.start_date}</td></tr>
                            {/*   <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                            </table>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                    </table>
                </div>
                {itemsList}
            </div>
        )
    }
});

var Publications = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        var peopleUrl= "/organization/"+objectId+"/publications";

        $.ajax({
            url: peopleUrl,
            success: function(publications) {
                this.setState({data: publications});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Publications!");
            }.bind(this)
        });
    },
    render: function() {
        var itemsList = $.map(this.state.data,function(items) {
            var type = (items[0].type.charAt(0).toUpperCase() + items[0].type.slice(1)).replace("_"," ")
            var typeList = [];
            for (var i in items) {
                var item = items[i];
                item.date = (new Date(item.date)).toUTCString().slice(8,-12);
                typeList.push(item);
            }
            console.log(typeList);
            return (
                <div>
                    <div><h2 className="margin-top-bottom-10"><span aria-hidden="true" className="glyphicon glyphicon-list-alt"></span> {type}</h2></div>
                    {typeList.map(item =>
                            <div className="about-item-hr">
                                <div key={item.id}>
                                    <a href={'/publication/'+item.type+'/'+item.id} className="body-link"><h4 className="margin-top-bottom-5">{item.title}</h4></a>
                        <span className="font-15">
                        <table className="item-box-table-info">
                            <table className="item-box-table-info">
                                <tr><td><b>Authors: </b></td><td>{item.contributors ? item.contributors.map(function(contributors) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{contributors}</a>;}) : ''}</td></tr>
                                <tr><td><b>Publication Date: </b></td><td>{item.date.toString()}</td></tr>
                             { /*  <tr><td><b>Keywords: </b></td><td>{item.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
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
                {itemsList}
            </div>
        )
    }
});

var Publication = React.createClass({ //delete
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
            <div className="item-box">
                <div className="publication-box-left publication-box-left-full">
                    <a href={"/publication/" + this.props.objectId} className="body-link"><h4 className="margin-top-bottom-5">{title}</h4></a>
                    Authors: <a href="#" className="body-link">{this.props.author}</a><br/>
                    Abstract: {this.props.description.substr(0,120)}... <a href={"/publication/" + this.props.objectId} className="body-link">Show Full Abstract</a><br/>
                    {this.props.publication_code}
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



var Data = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        var peopleUrl= "/organization/"+objectId+"/datas";

        $.ajax({
            url: peopleUrl,
            success: function(datas) {
                this.setState({data: datas});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Data!");
            }.bind(this)
        });
    },
    render: function() {
        var rows = [];
        return (
            <div>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tbody>
                        <tr>
                            <td className="padding-right">
                                {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {this.state.data.map(function(item) {
                    return (<Datum objectId={item.objectId}
                                   collaborators={item.collaborators}
                                   title={item.title}
                                   image_URL={item.picture.url}
                                   start_date={(new Date(item.createdAt)).toUTCString().slice(8,-12)} />);
                })}
            </div>
        );
    }
});

var Datum = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        console.log(this.props);
        return (
            <div className="item-box">
                <div className="item-box-left">
                    <div className="item-box-image-outside">
                        <a href={"/data/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="item-box-image" /></a>
                    </div>
                </div>
                <div className="item-box-right">
                    <a href={"/data/" + this.props.objectId} className="body-link"><h4 className="margin-top-bottom-5">{title}</h4></a>
                    <span className="font-15">
                        <table className="item-box-table-info">
                            <tr><td><b>Collaborators: </b></td><td>{this.props.collaborators.map(function(collaborators) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{collaborators}</a>;})}</td></tr>
                            <tr><td><b>Creation Date: </b></td><td>{this.props.start_date}</td></tr>
                        {/*   <tr><td><b>Keywords: </b></td><td>{this.props.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                        </table>
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

var Models = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount : function(){
        var peopleUrl= "/organization/"+objectId+"/models";
        $.ajax({
            url: peopleUrl,
            success: function(models) {
                this.setState({data: models});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("Couldn't Retrieve Publications!");
            }.bind(this)
        });
    },
    render: function() {
        var rows = [];
        return (
            <div>
                <div className="item-search-div">
                    <table className="item-search-field" width="100%">
                        <tbody>
                        <tr>
                            <td className="padding-right">
                                {/*<td><input type="text" id="search" placeholder="Search..." className="form-control"/></td>*/}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                {this.state.data.map(function(model) {
                    return (<Model objectId={model.objectId}
                                   collaborators={model.collaborators}
                                   title={model.title}
                                   image_URL={model.picture.url}
                                   keywords={model.keywords}
                                   number_cited={model.number_cited}
                                   number_syncholar_factor={model.number_syncholar_factor}
                                   license={model.license}
                                   access={model.access}
                                   abstract={model.abstract}
                                   start_date={(new Date(model.createdAt)).toUTCString().slice(8,-12)} />);
                })}
                {rows}
            </div>
        );
    }
});

var Model = React.createClass({
    render: function() {
        if (typeof this.props.title == "undefined" || this.props.title=="") { var title = "Untitled"; }
        else { var title = this.props.title; }
        return (
            <div className="item-box">
                <div className="item-box-left">
                    <div className="item-box-image-outside">
                        <a href={"/model/" + this.props.objectId} className="body-image"><img src={this.props.image_URL} className="item-box-image" /></a>
                    </div>
                </div>
                <div className="item-box-right">
                    <a href={"/model/" + this.props.objectId} className="body-link"><h4 className="margin-top-bottom-5">{title}</h4></a>
                <span className="font-15">
                    <table className="item-box-table-info">
                        <tr><td><b>Collaborators: </b></td><td>{this.props.collaborators.map(function(collaborators) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{collaborators}</a>;})}</td></tr>
                        <tr><td><b>Creation Date: </b></td><td>{this.props.start_date}</td></tr>
                    { /*    <tr><td><b>Keywords: </b></td><td>{this.props.keywords.map(function(keyword) { return <a href="#" className="tagsinput-tag-link react-tagsinput-tag">{keyword}</a>;})}</td></tr>*/}
                    </table>
                </span>
                </div>
            </div>
        )
    }
});

$( document ).ready(function() {
    ReactDOM.render(<Organization />, document.getElementById('content'));
});
