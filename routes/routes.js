var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var awsUtils = require('../utils/awsUtils');
var mandrill = require('node-mandrill')('UEomAbdaxFGITwF43ZsO6g');
var nodemailer = require('nodemailer');
var awsLink = "https://s3-us-west-2.amazonaws.com/syncholar/";

var transporter = nodemailer.createTransport("SMTP",{
        service: "Gmail",
        auth: {
            user: "shariqazz15@gmail.com",
            pass: "University@1"
        }
    });

// setup e-mail data with unicode symbols 
var mailOptions = {
    from: 'Syncholar 👥 <foo@blurdybloop.com>', // sender address 
    to: 'shariqazz15@gmail.com', // list of receivers 
    subject: 'Syncholar Test Invite', // Subject line 
    text: 'Testing nodemailer', // plaintext body 
    html: '<h2>You just got invited! 🐴</h2>' // html body 
};

function sendEmail ( _name, _email, _subject, _message) {
  // send mail with defined transport object 
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
  });
}

module.exports=function(app,Parse) {

// MIDDLEWARE REDIRECTION
  app.use('/newsfeed', function(req, res, next) {
    if (req.session && !req.session.user) {
        res.render('signin', {title: 'Login', path: req.path});
    } else {
        next();
    }
  });

  app.use('/profile', function(req, res, next) {
    if (req.session && !req.session.user) {
        res.render('signin', {title: 'Login', path: req.path});
    } else {
        next();
    }
  });

  // EMAIL API
  app.post('/sendemail', function(req, res, next){
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var msg = req.body.message;

    // checks go here
    console.log("SENDING EMAIL!!");
    sendEmail(name, email, subject, msg);
    next();
  });

  app.get('/invite', function(req, res){
    res.render('invite');
  });
  /*******************************************
   *
   * HOME PAGE
   *
   ********************************************/
  app.get('/', function(req, res, next) {
        if (req.session && req.session.user) {
        	res.redirect('/newsfeed');
        } else {
       		res.render('home', {user: req.user});
        }
  });

  /*******************************************
   *
   * SIGN UP
   *
   ********************************************/
  app.get('/signup', function (req, res, next) {
	if (req.session && !req.session.user) {
       res.render('signup', {title: 'Sign Up', path: req.path, Error: ""});
	} else {
		res.redirect('/newsfeed');
	}
   });
     app.post('/signup', function (req, res, next) {
     var user = new Parse.User();
     user.set("username", req.body.username);
     user.set("password", req.body.password);
     user.set("fullname", req.body.fullname);
     user.set("email", req.body.email);
     user.set("imgUrl", "/images/user.png");
     console.log(req.body.username);
     user.signUp(null, {
       success: function (user) {
           console.log("sucessful signup");
           res.render('newsfeed', {layout:'home',title: 'Website', username: user.attributes.username, currentUserImg: user.attributes.imgUrl});
       },
       error: function (user, error) {
         // Show the error message somewhere and let the user try again.
         res.render('signup', {Error: error.message, path: req.path});
       }
     });

   });

  /*******************************************
   *
   * SIGN IN
   *
   ********************************************/
  app.get('/signin', function (req, res, next) {
	if (req.session && !req.session.user) {
    	res.render('signin', {title: 'Login', path: req.path});
	} else {
		res.redirect('/newsfeed');
	}
  });

  app.post('/signin', function (req, res, next) {
    Parse.User.logIn(req.body.username, req.body.password, {
      success: function(user) {
      	  req.session.user = user;
          res.redirect('/newsfeed');
      },
      error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          res.render('signin', {Error: error.message, path: req.path});
      }
    });

  });

/*******************************************
 *
 * SIGN OUT
 *
 ********************************************/

app.get('/signout', function (req, res, next) {
    Parse.User.logOut();
    req.session.destroy();
    res.render('home', {title: 'Come back again!', path: req.path});
});

};
