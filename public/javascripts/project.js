var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Project = React.createClass ({
    getInitialState: function() {
     return {
        title: title,
        description: description,
        };
    },
    render: function() {
        return (
        <div className="content-wrap-pdm">
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
        );
    }
});

ReactDOM.render(<Project />,document.getElementById('content'));