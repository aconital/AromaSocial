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
var React = require('react');
var ReactDOM = require('react-dom');
var ReactBootstrap = require('react-bootstrap');
var TagsInput = require('react-tagsinput');
var Loading = require('react-loading');
var socket_io    = require( "socket.io" );
var exphbs = require('express-handlebars');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var helmet = require('helmet')

var app = express();
var io           = socket_io();
app.io           = io;

app.use(helmet());

Parse.initialize("development", "Fomsummer2014", "Fomsummer2014");
Parse.serverURL = 'http://52.33.206.191:1337/parse/';

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

app.use(passport.initialize());
app.use(passport.session());

require('./routes/routes')(app,Parse,io);
require('./routes/organization')(app,Parse,io);
require('./routes/user')(app,Parse,io);
require('./routes/equipment')(app,Parse,io);
require('./routes/project')(app,Parse,io);
require('./routes/publication')(app,Parse,io);
require('./routes/data')(app,Parse,io);
require('./routes/model')(app,Parse,io);
require('./routes/newsfeed')(app,Parse,io);
require('./routes/search')(app,Parse,io);
require('./routes/group')(app,Parse,io);
require('./routes/report')(app,Parse,io);

io.on('connection', function(socket){

    socket.on('registerUser', function (data) {

       socket.join(data.userId,function(){
           console.log(socket.rooms);
       });
    });
    socket.on("friendrequest",function(data){
        console.log("hahaha");
        console.log(data);
    });

});

//===============PASSPORT=================
// Use the LocalStrategy within Passport to login/�signin� users.
passport.use(new LocalStrategy(function(email, password, done) {

    // get real username from input email
    var username = "";
    var queryUsername = new Parse.Query(Parse.User);
    queryUsername.equalTo("email", email);
    queryUsername.first({
      success: function (user) {
        if (user == undefined) {
          return;
        }
        username = user.get("username");
        console.log("Retrieved username: ", username);
      },
      error: function (err) {
        console.log("Error while trying to retrieve username: ", err);
      }
    }).then(function () {
      var query = new Parse.Query(Parse.User);
      query.equalTo("username", username);
      query.first({
          success: function (user) {
              if(user === null)
              {
                  return done(null, false, {message: 'Invalid username or password'});
              }
              else {
                  Parse.User.logIn(username, password, {
                      success: function(user) {
                          return done(null, user.attributes.username);
                      },
                      error: function(user, error) {
                          // Show the error message somewhere and let the user try again.
                          return done(null, false, {message: 'Invalid username or password'});
                      }
                  });
              }

          },
          error: function(user,error){
              console.log(error.message);
          }
      });
    });
}));

passport.serializeUser(function(user, done) {

    done(null, user);
});

passport.deserializeUser(function(username, done) {

    var query = new Parse.Query(Parse.User);
    query.equalTo("username", username);
    query.first({
        success: function (user) {
            var jsonUser={
                id: user.id,
                username: user.attributes.username,
                cover_imgURL:user.attributes.cover_imgURL,
                email: user.attributes.email,
                emailVerified: user.attributes.emailVerified,
                fullname:user.attributes.fullname,
                imgUrl:user.attributes.imgUrl,
                summary:user.attributes.summary,
                interests:user.attributes.interests,
                interestsTag:user.attributes.interestsTag,
                educations: user.attributes.educations,
                workExperience: user.attributes.workExperience,
                projects:user.attributes.projects,
                linkedin_id:user.attributes.linkedin_id
            };
              done(null, jsonUser);
        }
        ,error:function(user,error)
        {
            console.log("Error in deserialize user: "+error.message);
        }
    });
});


app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin', '*');

    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});




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




