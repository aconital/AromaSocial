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
var awsLink = "https://s3-us-west-2.amazonaws.com/syncholar/";

module.exports=function(app,Parse) {
  /*******************************************
   *
   * HOME PAGE
   *
   ********************************************/
  app.get('/', function(req, res, next) {
        res.render('home', {user: req.user});
  });


    /*******************************************
   *
   * SIGN UP
   *
   ********************************************/
  app.get('/signup', function (req, res, next) {

       res.render('signup', {title: 'Sign Up', path: req.path, Error: ""});
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

    res.render('signin', {title: 'Login', path: req.path});
  });

  app.post('/signin', function (req, res, next) {
    Parse.User.logIn(req.body.username, req.body.password, {
      success: function(user) {
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
    res.render('index', {title: 'Come back again!', path: req.path});
});

};
