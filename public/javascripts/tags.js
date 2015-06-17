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
      , completions: [],
      tagString: "#test"
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

  saveTags: function () {
    console.log("tags: ", this.refs.tags.getTags().join(", "));
        console.log(tagArray);
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
    
    var tagArray = [];
    for (i = 0; i<tags.length; i++){
      
      if(!tags[i].match(/(^|\s)(#\w+)\b/g)){
        tagArray.push("#"+tags[i]);
      }
      else{
        tagArray.push(tags[i]);
      }
      
      if($.inArray(tags[i],possibleTags ) < 0){
        possibleTags.push(tags[i]);
      }

    }

    this.setState({
      tagString: tagArray.join(", ")
    });
    console.log(tagArray);

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
      placeholder: "#research"
    };

    return (
      
      React.createElement("div",null,
        React.createElement(ReactTagsInput, tagsInputProps),
        React.createElement("div", { style: { marginTop: "10px" } }, completionNodes),
        <input type="hidden" name="tags" value={this.linkState('tagString').value}/>
      )
    );
  }
});



  


