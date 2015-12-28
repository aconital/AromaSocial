Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Publication = React.createClass ({
    getInitialState: function() {
     return {
        title: [title],
        description: description
        };
    },
    handleChange: function(e) {
        this.setState({[e.target.name]:e.target.value});
        console.log("YES");
    },
    submitChange: function() {
        var dataForm = {title: this.state.title, description: this.state.description};

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
    render: function() {
        return (
        <div className="content-wrap">
            <div className="item-bottom-big">
                    <div className="item-panel contain-panel-big">
                    <div>
                        {(currentUserId == creatorId) ? <h2 className="no-margin"><input className="contain-panel-big-h2 p-editable" type="text" name="title" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.title} /></h2> : <h2 className="contain-panel-big-h2 p-noneditable">{title}</h2>}
                        <h2 className="corner"><a href="#" className="image-link"><span className="glyphicon glyphicon-check space"></span></a>
                            <a href="#" className="image-link"><span className="glyphicon glyphicon-download space"></span></a>
                        </h2>
                    </div>
                    <div>
                       {(currentUserId == creatorId) ? <p className="no-margin"><input className="p-editable" type="text" name="description" onChange={this.handleChange} onBlur={this.submitChange} value={this.state.description}/></p> : <p className="p-noneditable">{description}</p>}
                    </div>
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
                    <div className="item-panel contain-panel-big">
                    <div>
                        <h4 className="contain-panel-big-h4">Discussions</h4>
                    </div>
                    <div>

                    <table>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    <tr><td className="comment-picture">
                    <a href="/profile/saeedghaf" className="nostyle"><img src="https://media.licdn.com/mpr/mpr/shrink_200_200/p/2/000/100/1fa/01e2c05.jpg" className="contain-panel-big-icons contain-panel-big-comment-icons"/></a>
                    </td><td className="comment-text">
                    <div className="float-right"><a href="/profile/saeedghaf" className="nostyle"><strong>Saeed Ghafghazi (Post-Doctoral Fellow)</strong></a>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus molestie dui ac mollis. In et justo lorem. Aenean interdum ex iaculis est cursus, eu tincidunt mauris placerat. </p></div>
                    </td></tr>
                    </table>

                    <form role="comment" method="post" action="/comment">
                        <div className="input-group contain-panel-big-input-group">
                            <input type="text" placeholder="Comment..." className="form-control comment-bar"/>
                            <button type="submit" className="btn btn-primary btn-comment">Post</button>
                        </div>
                    </form>
                    </div>
                    </div>
            </div>
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
        </div>
        );
    }
});


React.render(<Publication
    groups={["FRESH Lab","Forest Resource Management","Faculty of Forestry","UBC"]}
    keywords={["Techno-Economic Assessment","Bio-Fuels","Bio-Energy","Supply Chain Management"]}/>,
    document.getElementById('content'));