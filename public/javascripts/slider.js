var MenuItem = React.createClass({ // TODO: PASS FUNCTION AS PROP

    render: function() {
    	//var callback = this.props.callback.bind(this.props.type);
        console.log("In MenuItem: ", this.props.callback);
        return <div className="menu-item" onClick={this.props.callback.bind(this, this.props.type)}>{this.props.children}</div>;
    }
});

var Menu = React.createClass({
    getInitialState: function() {
        return {
            visible: false  
        };
    },

    show: function() {
        this.setState({ visible: true });
        document.addEventListener("click", this.hide.bind(this));
    },

    hide: function() {
        document.removeEventListener("click", this.hide.bind(this));
        this.setState({ visible: false });
    },

    render: function() {
        return <div className="menu">
            <div className={(this.state.visible ? "visible " : "") + this.props.alignment}>{this.props.children}</div>
        </div>;
    }
});

var Slider = React.createClass({
    showLeft: function() {
        this.refs.left.show();
    },

    render: function() {
    	var callback = this.props.callback;
   		//console.log(callback);
        return <div>
            <button onClick={this.showLeft}>Show Sidebar</button>

            <Menu ref="left" alignment="left">
            	{this.props.items.map(function(i) {
            		return <MenuItem type={i} callback={callback}>{i}</MenuItem>;
            	})}
            </Menu>

        </div>;
    }
});

// ReactDOM.render(<Slider />, document.getElementById('content'));