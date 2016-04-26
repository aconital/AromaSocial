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
    to: 'hiradroshandel@yahoo.com', // list of receivers
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
      if (!req.isAuthenticated()) {
          res.render('signup', {title: 'Sign Up', path: req.path, Error: ""});
      }
      else {
          res.redirect('/');
      }
   });

    app.post('/signup', function (req, res, next) {
        if(req.body.code!='Fom2016'){
            return res.redirect('/');
        }
        console.log("is this fireing");
     var user = new Parse.User();
     user.set("username", req.body.username);
     user.set("password", req.body.password);
     user.set("fullname", req.body.fullname);
     user.set("email", req.body.email);
     user.set("imgUrl", "/images/user.png");
        user.set("interestsTag", []);
     console.log(req.body.username);
     user.signUp(null, {
        success: function (user) {
           console.log("sucessful signup");
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
	if (!req.isAuthenticated()) {
    	res.render('signin', {title: 'Login', path: req.path});
	} else {
		res.redirect('/');
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

    if(req.isAuthenticated()) {
        req.session.destroy(function (err) {
            res.redirect('/'); //Inside a callback� bulletproof!
        });
    }
    else
        res.redirect('/');
});

/*******************************************
 *
 * TERMS AND CONDITIONS PAGE
 *
 ********************************************/

app.get('/terms', function (req, res, next) {
    res.render('terms', {title: 'Terms', path: req.path});
});

    /*******************************************
 *
 * THIRD PARTY OAUTH
 *
 ********************************************/
app.get('/oauth/linkedin', function(req, res) {
    if(!req.isAuthenticated()) {
        // This will ask for permisssions etc and redirect to callback url.
        var scope = ['r_basicprofile', 'r_emailaddress'];
        Linkedin.auth.authorize(res, scope,'state');
    }
    else
    {
        res.redirect('/');
    }
});
app.get('/auth/linkedin/callback',function(req,res){

    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function(err, results) {
        if ( err )
            res.render('signin', {Error: err.message, path: req.path})


        var token= results.access_token;
        var linkedin = Linkedin.init(token);
        linkedin.people.me(function(err, $in) {
            var linkedin_ID= $in.id;
            var email= $in.emailAddress;
            var name= $in.formattedName;

            var about=null
            if($in.headline !=null)
             about=$in.headline;

            var pictureUrl="/images/user.png";
            if($in.pictureUrls.values !=null)
                pictureUrl=$in.pictureUrls.values[0];

            var companyObject=null;
            if($in.positions.values != null)
                companyObject= $in.positions.values[0].company;

            var query = new Parse.Query(Parse.User);
            query.equalTo("linkedin_id", linkedin_ID);
            query.first({
                success: function(user) {
                    //user with this linkedin ID exists
                    if(user)
                    {   //login the user

                        req.login(user.attributes.username, function(err){
                            if(err) res.redirect('/');
                            res.redirect('/');
                        });
                    }
                    //no user with this linkedin id in db
                    else
                    {
                        //check to see if user with this email already exists
                        var query = new Parse.Query(Parse.User);
                        query.equalTo("email", email);
                        query.first({
                            success: function (result) {
                              if(result)
                              {

                                  var activation_code= randomString(3)+result.id+randomString(3);
                                  result.set("activation_code",activation_code);
                                  result.save(null, { useMasterKey: true }).then(function() {
                                          //TODO REFACTOR THIS
                                          var mailOptions = {
                                              from: 'Syncholar <no-reply@syncholar.com>', // sender address
                                              to: result.attributes.email, // list of receivers
                                              subject: 'Connecting Linkedin to your account', // Subject line
                                              text: '', // plaintext body
                                              html: '<h2><p>Hi '+result.attributes.fullname+',</p> Please click on the following link to connect your linkedin to your account:</h2>' +
                                                    '<a href="http://syncholar/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'">http://syncholar/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'</a>' // html body
                                          };
                                          transporter.sendMail(mailOptions, function(error, info){
                                              if(error){
                                                  res.render('signin', {Error: error.message, path: req.path})
                                              }
                                              res.redirect('/auth/linkedin/verify');
                                          });

                                      },function(error) {

                                          res.render('signin', {Error: error.message, path: req.path})
                                      });

                              }
                                else
                              {

                                  var user = new Parse.User();
                                  //TODO EMAIL THIS TO USER
                                  var randomPass= randomString(5);

                                  user.set("fullname", name);
                                  user.set("username",linkedin_ID);
                                  user.set("password",randomPass);
                                  user.set("linkedin_id",linkedin_ID);
                                  user.set("email", email);
                                  user.set("imgUrl", pictureUrl);
                                  user.set("about",about);
                                  user.set("interestsTag", []);
                                  user.signUp(null,
                                      {
                                      success: function (user) {
                                          Parse.User.logIn(linkedin_ID, randomPass, {
                                              success: function(u) {

                                                  req.login(u.attributes.username,function (err) {
                                                      if (!err)
                                                          res.redirect('/');
                                                      else
                                                          res.render('signin', {Error: err.message, path: req.path})
                                                  });

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
    app.get("/auth/linkedin/verify",function(req,res,next){
        res.render("verify");
    });
    app.get("/auth/linkedin/verify/:activation/:linkedin",function(req,res,next){
        var code= req.params.activation;
        var linkedin_id=req.params.linkedin;
        var query = new Parse.Query(Parse.User);
        query.equalTo("activation_code", code);
        query.first({
            success: function (user) {
               if(user)
               {
                   user.set("linkedin_id",linkedin_id);
                   user.save(null,{ useMasterKey: true }).then(function() {
                       res.redirect("/oauth/linkedin");
                   },function(error)
                   {
                       res.render('signin', {Error: error.message, path: req.path});
                   });

               }
            },
            error: function (error) {
                res.render('signin', {Error: error.message, path: req.path});
            }
        });

    });
    /************************************
     * HELPER FUNCTIONS
     *************************************/
    function is_auth(req,res,next){
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.locals.user = req.user;
            next();
        }
    };
    function randomString(len, charSet) {
        charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz,randomPoz+1);
        }
        return randomString;
    };
};