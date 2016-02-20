// require('babel-register');
// var React = require('react');
// var ReactDOM = require('react-dom/server');
//var components = require('./public/components.js'); // change path later

//var HelloMessage = React.createFactory(components.HelloMessage); //???

var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var bourbon = require('node-bourbon');
var Parse = require('parse/node');
var React = require('react-dom');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var ParseReact = require('parse-react');
var TagsInput = require('react-tagsinput');
var TextAreaAutoSize = require('react-textarea-autosize');
var InputAutoSize = require('react-input-autosize');
var Loading = require('react-loading');
var exphbs = require('express-handlebars');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var app = express();

Parse.initialize("3wx8IGmoAw1h3pmuQybVdep9YyxreVadeCIQ5def", "tymRqSkdjIXfxCM9NQTJu8CyRClCKZuht1be4AR7");
Parse.User.enableUnsafeCurrentUser();

// just to check that s3 is connected. remove when deploying
s3.listBuckets(function(err, data) {
  if (err) { console.log("Error:", err); }
  else {
    for (var index in data.Buckets) {
      var bucket = data.Buckets[index];
      console.log("Bucket: ", bucket.Name, ' : ', bucket.CreationDate);
    }
  }
});

aws.config.update({
    accessKeyId: "AKIAJAKJNWQBINWXOD7Q",
    secretAccessKey: "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"
});

// view engine setup
// Configure express to use handlebars templates
var hbs = exphbs.create({
  defaultLayout: 'main', //we will be creating this layout shortly
  partialsDir: [
        'views/'
    ]
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());
app.use(session({
    secret: "SYNCHOLARTOKEN",
//    store: todo,
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/routes')(app,Parse);
require('./routes/organization')(app,Parse);
require('./routes/user')(app,Parse);
require('./routes/equipment')(app,Parse);
require('./routes/project')(app,Parse);
require('./routes/publication')(app,Parse);
require('./routes/data')(app,Parse);
require('./routes/model')(app,Parse);
require('./routes/newsfeed')(app,Parse);
require('./routes/search')(app,Parse);
require('./routes/group')(app,Parse);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;




