var Organization = React.createClass ({
    render: function() {
        return (
            <div>
                <div className="item-top item-top-container">
                </div>
                <div className="content-wrap">
                <div>
                    <div className="item-top-1 col">
                        <img src={organization_imgURL} className="contain-image" />
                    </div>
                </div>
                <div className="item-bottom">
                    <div className="item-bottom-1">
                        <div className="item-panel contain-panel" id="item-name"><h4>{name}</h4></div>
                        <div className="item-panel contain-panel" id="item-location"><h4>{orgLocation}</h4></div>
                    </div>
                    <div id="item-bottom-2-organization" className="item-bottom-2">
                        <OrganizationMenu tabs={['Connections', 'People', 'About', 'News And Events', 'Knowledge']} />
                    </div>
                </div>
                </div>
            </div>
        );
    }
});

var OrganizationMenu = React.createClass ({
    getInitialState: function() {
        return { focused: 0 };
    },
    clicked: function(index) {
        this.setState({ focused: index });
    },
    render: function() {
        var self = this;
        var tabMap = {0: <Connections />,
                1: <People />,
                2: <About />,
                3: <NewsAndEvents/>,
                4: <Knowledge/>};
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
        Connections of {name}
      </div>
    )
  }
});

var People = React.createClass({
  render: function() {
    return (
      <div>
        People of {name}
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

React.render(<Organization />, document.getElementById('content'));
