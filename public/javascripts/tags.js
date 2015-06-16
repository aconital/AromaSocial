var possibleTags = [
      "#data",
      "#research",
      "#statistics",
      "#dirt",
      "#soil",
      "#bimat",
      "#BIMAT",
      "#Canada",
      "#paper",
      "#journal",
      "#loam",
      "#cedar",
      "#bugs",
      "#forest"
    ];


var TagsComponent = React.createClass({
  displayName: "TagsComponent",

  mixins: [React.addons.LinkedStateMixin],

  getInitialState: function () {
    return {
      tags: []
      , completions: []
    };
  },

  complete: function (value) {
    value = value.toLowerCase();

    if (value === "") {
      return this.setState({
        completions: []
      });
    }

    this.setState({
      completions: possibleTags.filter(function (comp) {
        var norm = comp.toLowerCase();
        return norm.substr(0, value.length) == value && this.state.tags.indexOf(comp) == -1;
      }.bind(this))
    });
  },

  transform: function (tag) {
    if (this.state.completions.length === 1) {
      return this.state.completions[0];
    }
  },

  validate: function (tag) {
    return this.state.completions.indexOf(tag) > -1;
  },

  change: function (tags) {
    this.setState({
      tags: tags
      , completions: []
    });
  },

  render: function () {
    var completionNodes = this.state.completions.map(function (comp) {
      var add = function (e) {
        this.refs.tags.addTag(comp);
      }.bind(this);

      return React.createElement("span", {},React.createElement("a", { className: "research-tag", onClick: add }, comp)," ");
    }.bind(this));

    var tagsInputProps = {
      ref: "tags",
      value: this.state.tags,
      onChange: this.change,
      onChangeInput: this.complete,
      transform: this.transform,
      validate: this.validate,
      addOnBlur: false,
      placeholder: "#research"
    };

    return (
      React.createElement("div", null,
        React.createElement(ReactTagsInput, tagsInputProps),
        React.createElement("div", { style: { marginTop: "10px" } }, completionNodes)
      )
    );
  }
});




