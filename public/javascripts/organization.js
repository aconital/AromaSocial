var OrganizationName = React.createClass({
    mixins: [ParseReact.Mixin],
    observe: function () {
        return {

        };
    },
    render: function() {
        return (
            <h4>Hello</h4>
        );
    }
});

React.render(
    <OrganizationName/>,document.getElementById('organization-name')
);