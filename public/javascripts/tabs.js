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
                    var style = ""
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
                Selected: {this.props.tabs[this.state.focused]}
            </div>
            </div>
        );
    }
});

React.render(
    <OrganizationMenu tabs={['Connections', 'People', 'About', 'News And Events', 'Knowledge']}/>,
    document.getElementById('item-bottom-2-organization'));



