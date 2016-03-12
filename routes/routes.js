var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var aws = require('aws-sdk');
var passport = require('passport');
var s3 = new aws.S3();
var awsUtils = require('../utils/awsUtils');
var mandrill = require('node-mandrill')('UEomAbdaxFGITwF43ZsO6g');
var nodemailer = require('nodemailer');
var awsLink = "https://s3-us-west-2.amazonaws.com/syncholar/";
var Linkedin = require('node-linkedin')('770zoik526zuxk', 'IAbJ2h0qBh2St1IZ', 'http://localhost:3000/auth/linkedin/callback');

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
    html: '<h2>You just got invited! �?�</h2>' // html body 
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
      if(!req.isAuthenticated()) {
          res.render('home');
      } else {
          res.render('newsfeed', { user: req.user});
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
           res.redirect('/newsfeed');
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
      passport.authenticate('local', { successRedirect: '/',
          failureRedirect: '/signin'}, function(err, user, info) {
          if(err) {
              return res.render('signin', {page:'login',title: 'Sign In', errorMessage: err.message});
          }

          if(!user) {
              return res.render('signin', {page:'login',title: 'Sign In', errorMessage: info.message});
          }
          return req.logIn(user, function(err) {
              if(err) {
                  return res.render('signin', {page:'login',title: 'Sign In', errorMessage: err.message});
              } else {
                  return res.redirect('/');
              }
          });
      })(req, res, next);

  });

/*******************************************
 *
 * SIGN OUT
 *
 ********************************************/

app.get('/signout', function (req, res, next) {
    if(!req.isAuthenticated()) {
        notFound404(req, res, next);
    } else {
        Parse.User.logOut();
        req.logout();
        res.redirect('/');
    }
});



/*******************************************
 *
 * THIRD PARTY OAUTH
 *
 ********************************************/
app.get('/oauth/linkedin', function(req, res) {
    // This will ask for permisssions etc and redirect to callback url.
    var scope = ['r_basicprofile', 'r_emailaddress'];
    Linkedin.auth.authorize(res, scope);
});
app.get('/auth/linkedin/callback',function(req,res){
    console.log("aa");
    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
        if ( err )
            return console.error(err);

        var token= results.access_token;
        var linkedin = Linkedin.init(token);
        linkedin.people.me(function(err, $in) {
            var linkedin_ID= $in.id;
            var email= $in.emailAddress;
            var name= $in.formattedName;
            var about=$in.headline;
            var pictureUrl=$in.pictureUrl;

            var companyObject= $in.positions.values[0].company;

            console.log($in);

            var query = new Parse.Query(Parse.User);
            query.equalTo("linkedin_id", linkedin_ID);
            query.find({
                success: function(results) {
                    //user with this linkedin ID exists
                    if(results.length > 0)
                    {
                        user=results[0];
                        Parse.User.logIn(user.username, user.password, {
                            success: function(user) {
                                req.session.user = user;
                                res.redirect('/newsfeed');
                            },
                            error: function(user, error) {
                                // Show the error message somewhere and let the user try again.
                                res.render('signin', {Error: error.message, path: req.path});
                            }
                        });

                    }
                    //no user with this linkedin id in db
                    else
                    {
                        //check to see if user with this email already exists
                        var query = new Parse.Query(Parse.User);
                        query.equalTo("email", email);
                        query.find({
                            success: function (results) {
                              if(results.length >0)
                              {   //TODO user exists so he should verify
                                  res.render('signin', {Error: "user with this email exists, is it you? verify", path: req.path});
                              }
                                else
                              {
                                  var user = new Parse.User();
                                  user.set("fullname", name);
                                  user.set("username",linkedin_ID);
                                  //TODO FIX THIS
                                  user.set("password","123456");
                                  user.set("linkedin_id",linkedin_ID);
                                  user.set("email", email);
                                  user.set("imgUrl", "/images/user.png");
                                  user.set("about",about)
                                  user.signUp(null,
                                      {
                                      success: function (user) {
                                          Parse.User.logIn(linkedin_ID, "123456", {
                                              success: function(user) {
                                                  req.session.user = user;
                                                  res.redirect('/newsfeed');
                                              },
                                              error: function(user, error) {
                                                  // Show the error message somewhere and let the user try again.
                                                  res.render('signin', {Error: error.message, path: req.path});
                                              }
                                          });
                                      },//signup sucess
                                      error: function (user, error) {
                                          // Show the error message somewhere and let the user try again.
                                          res.render('signin', {Error: error.message, path: req.path});
                                      }
                                  });
                              }

                            }
                        });

                    }
                },
                error: function (user, error) {
                    // Show the error message somewhere and let the user try again.
                    res.render('signin', {Error: error.message, path: req.path});
                }
            });
        });

    });
});

    /************************************
     * HELPER FUNCTIONS
     *************************************/
    function is_auth(req,res,next){
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    };
};