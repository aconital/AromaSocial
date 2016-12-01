/**
 * Created by hroshandel on 12/1/2016.
 */
var Button = ReactBootstrap.Button;
var Pagination = ReactBootstrap.Pagination;
var PageHeader = ReactBootstrap.PageHeader;
var Panel = ReactBootstrap.Panel;

var Education_Object = React.createClass({
    getInitialState() {
        return {
            institution: '',
            start: null,
            end: null,
            degree: '',
            major: '',
            description: ''
        };
    },

    handleChange(e) {
        var changedState = {};
        changedState[e.target.name] = e.target.value;
        this.setState( changedState );
    },
    updateState(type,obj)
    {
            this.setState( {institution:obj} );

    },
    next() {
        // Send education to server
        var education = {institution: this.state.institution, start_date: this.state.start, end_date: this.state.end,
            faculty: this.state.major, description: this.state.description, degree: this.state.degree};
        $.ajax({
            url: '/education',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            data: JSON.stringify(education),
            success: function(status) {
                console.log("Updated education");
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(path + "/post education", status, err.toString(), xhr);
            }.bind(this)
        });
    },

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-xs-10 col-sm-10 col-md-8 col-lg-8 col-center" >
                        <div id="resume-education" className="div-relative"><hr/>
                            <h3 className="no-margin-top">Education</h3>
                            <div className="h4-resume-item display-inline-block ">
                                <SearchInput name="institution" placeholder="Latest School" updateState={this.updateState}  />
								<span className="r-editable profile_date_editable">From: &nbsp;&nbsp;
                                    <input type="date" name="start" onChange={this.handleChange} value={this.state.start} className="r-editable r-editable-date"/>
								</span>
								<span className="r-editable profile_date_editable">To: &nbsp;&nbsp;
                                    <input type="date" name="end" onChange={this.handleChange} value={this.state.end} className="r-editable r-editable-date"/>
								</span>
                                <span><input type="text" className="r-editable r-editable-full" name="degree" placeholder="Degree" onChange={this.handleChange} value={this.state.degree}/></span>
                                <span><input type="text" className="r-editable r-editable-full" name="major" placeholder="Major" onChange={this.handleChange} value={this.state.major}/></span>
                                <textarea type="text" className="r-editable r-editable-full" name="description" placeholder="Description" onChange={this.handleChange} value={this.state.description}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var SearchInput = React.createClass({
    getInitialState: function() {
        return {
            value: '',
            data: [],
            ajaxTimer: null
        };
    },
    componentWillMount: function() {
        this.state.ajaxTimer = setTimeout(this.inputChange, 60000);
        clearTimeout(this.state.ajaxTimer);
    },
    inputChangeWrapper: function(inputValue) {
        clearTimeout(this.state.ajaxTimer);
        this.state.ajaxTimer = setTimeout(this.inputChange.bind(null, inputValue), 200);
    },
    inputChange: function(inputValue) {
        this.state.data = [];
        if (inputValue.length <= 0) return;
        var newValue= {label: inputValue, value: inputValue, category: "Organizations", imgsrc: null, link: null, objectId: null, buttonText: null};
        this.setState({value: newValue});
        this.props.updateState(this.props.name,newValue);

        var that = this;
        var str = inputValue;
        var r = [];
        $.when(

            $.ajax({
                url: '/allorganizations',
                dataType: 'json',
                type: 'POST',
                data: {substr: str, limit: 5},
                cache: false,
                success: function(data) {
                    $.map(data, function(item){
                        var dlink = "/organization/" + item.name;
                        r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
                    });
                },
                error: function(xhr) {
                    console.log(xhr.status);
                }
            })
        ).then(function() {
                that.setState({data: r});
            });
    },
    updateValue (newValue) {
        this.setState({
            value: newValue
        });
        //pass it to the parent
        this.props.updateState(this.props.name,newValue);
    },

    preventDefault: function(link, event) {
        event.preventDefault();
        event.stopPropagation();
        // window.location.href = link;
    },
    truncate: function(str) {
        if (str.length >= 45) {
            return str.substring(0, 45) + "...";
        } else {
            return str;
        }
    },
    onBlurHandler: function(event) {
    },
    getOptions: function(input, callback) {
        var that = this;
        var str = input;
        var r = [];
        $.when(
            $.ajax({
                url: '/allorganizations',
                dataType: 'json',
                type: 'POST',
                data: {substr: str},
                cache: false,
                success: function(data) {
                    $.map(data, function(item){
                        var dlink = "/organization/" + item.name;
                        r.push({label: item.displayName, value: item.displayName, category: "Organizations", imgsrc: item.picture.url, link: dlink, buttonText: 'Join', objectId: item.objectId});
                    });
                },
                error: function(xhr) {
                    console.log(xhr.status);
                }
            })
        ).then(function() {
                callback(
                    null, {
                        options: r
                    }
                );
                that.setState({data: r});
            });
    },
    render: function () {
        return (
            <div>
                <div >
                    <Select
                        placeholder={this.props.placeholder}
                        options={this.state.data}
                        value={this.state.value}
                        onInputChange={this.inputChangeWrapper}
                        onChange={this.updateValue}
                        onBlurResetsInput={false}
                        onBlur={this.onBlurHandler} />
                </div>
            </div>
        )
    }
});