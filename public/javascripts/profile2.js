var OrganizationMenu = React.createClass ({
    getInitialState: function() {
        return { focused: 0 };
    },
    clicked: function(index) {
        this.setState({ focused: index });
    },
    render: function() {
        var self = this;
        return (
            <div>
            <div id="tabs">
                <ul id="content-nav">
                    {this.props.tabs.map(function(tab,index){
                    if (self.state.focused == index) {
                    var style = ""
                        style = "selected-tab";
                    }
                    return <li id={style}>
                            <a href="#" onClick={self.clicked.bind(self, index)} id={style}>{tab}</a>
                           </li>;
                    })}
                </ul>
            </div>
            <div id="content" className="content">
                {self.state.focused == 0 ? <Connections/> : "" }
                {self.state.focused == 1 ? <People/> : "" }
                {self.state.focused == 2 ? <About/> : "" }
                {self.state.focused == 3 ? <NewsAndEvents/> : "" }
                {self.state.focused == 4 ? <Knowledge/> : "" }
            </div>
            </div>
        );
    }
});

var Connections = React.createClass({
  render: function() {
    return (
      <div>
        Connections of {objectId}
      </div>
    )
  }
});

var People = React.createClass({
  render: function() {
    return (
      <div>
        People
      </div>
    )
  }
});

var About = React.createClass({
mixins: [ParseReact.Mixin],
  render: function() {
    return (
      <div>
        About
      </div>
    )
  }
});

var Models = React.createClass({
  render: function() {
    return (
      <div>
        NewsAndEvents
      </div>
    )
  }
});

var Data = React.createClass({
  render: function() {
    return (
      <div>
        Knowledge
      </div>
    )
  }
});

React.render(
    <ProfileMenu tabs={['Connections', 'Resume', 'Friends', 'About', 'Publications', 'Models', 'Data']}/>,
    document.getElementById('item-bottom-2-profile'));


