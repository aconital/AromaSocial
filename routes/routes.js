var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var request = require('request').defaults({ encoding: null });
var aws = require('aws-sdk');
var passport = require('passport');
var s3 = new aws.S3();
var awsUtils = require('../utils/awsUtils');
var mandrill = require('node-mandrill')('UEomAbdaxFGITwF43ZsO6g');
var nodemailer = require('nodemailer');
var awsLink = "https://s3-us-west-2.amazonaws.com/syncholar/";
//var Linkedin = require('node-linkedin')('770zoik526zuxk', 'IAbJ2h0qBh2St1IZ', 'http://localhost:3000/auth/linkedin/callback');
var Linkedin = require('node-linkedin')('770zoik526zuxk', 'IAbJ2h0qBh2St1IZ', 'https://syncholar.com/auth/linkedin/callback');

var sendMail = require('../utils/helpers').sendMail;
var is_auth = require('../utils/helpers').is_auth;
var randomString= require('../utils/helpers').randomString;
var hasBetaCode= require('../utils/helpers').hasBetaCode;
var include_user= require('../utils/helpers').include_user;
var processLinkedinImage=require('../utils/helpers').processLinkedinImage;

module.exports=function(app,Parse,io) {

  app.get('/beta', function (req, res, next) {
    var rl = req.query.redLink;
    res.render('beta', {title: 'Syncholar Beta', redLink: rl, path: req.path, Error: ""});
  });

  app.post('/beta', function (req, res, next) {
      var code = req.body.code;
      var redLink = req.body.redLink;
      if(code === "summer2016") {
          req.session.code=code;
          // res.redirect("/signin");
          res.redirect(redLink);
      }
      else
       res.render('beta', {title: 'Syncholar Beta', path: req.path, Error: "Wrong code!"});
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
          //maybe there is cookie for remember me
          if(req.cookies.syncholar_cookie != null)
          {
              var cookie_token= req.cookies.syncholar_cookie;
              var query = new Parse.Query(Parse.User);
              query.equalTo("cookie_token", cookie_token);
              query.first({
                  success: function (result) {
                      if (result) {
                          var username=result.get("username");
                          req.login(username, function(err){
                              if(err) res.redirect('/');
                              res.redirect(req.originalUrl);
                          });
                      }
                  },
                  error: function ( error) {
                      console.log("Couldnt save cookie token")
                  }
              });
          }
          else
              res.render('home');
      }else if(req.user.emailVerified != true )
      {
          res.redirect('/verify-email');
      }
      else {
          res.render('newsfeed', { user: req.user});
      }
  });
    /********
     * PRIVACY & term
     */
    app.get('/privacy',include_user, function(req, res, next) {
        res.render("privacy");
    });
    /*****************************************
     *
     * RECOVER PASSWORD
     *
     */
    app.get('/password-reset', function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.render('password-reset', {sent:false,title: 'Password Reset', path: req.path, Error: ""});
        }
        else {
            res.redirect('/');
        }
    });
    app.get('/password-reset/verify', function (req, res, next) {
        if (!req.isAuthenticated()) {
            res.render('password-reset', {sent:true,title: 'Password Reset', path: req.path, Error: ""});
        }
        else {
            res.redirect('/');
        }
    });
    app.get('/password-reset/:userId/:code', function (req, res, next) {
       var userId= req.params.userId;
       var code = req.params.code;
        var query = new Parse.Query(Parse.User);
        query.equalTo("objectId", userId);
        query.first({
            success: function (result) {
                if (result) {
                    var dbCode= result.get("password_reset_code");
                    if(code === dbCode)
                    {
                        res.render('change-password', {userId:userId,title: 'Password Reset', path: req.path, Error: ""});
                    }
                    else
                    {
                        res.render('password-reset', {Error: "The link is not valid or has been expired!", path: req.path});
                    }

                }
                else
                {
                    res.render('password-reset', {Error: "Something has went wrong! Please contact our support team.", path: req.path});
                }
            }, error: function (err) {
                res.render('password-reset', {Error: error.message, path: req.path});
            }
        });
    });
    app.post('/password-reset-verification', function (req, res, next) {
        var email = req.body.email;
        var query = new Parse.Query(Parse.User);
        query.equalTo("email", email);
        query.first({
            success: function (result) {
                if (result) {
                    var userId= result.id;
                    var activation_code = randomString(3) + randomString(5) + randomString(3);
                    result.set("password_reset_code", activation_code);
                    result.save(null, {useMasterKey: true}).then(function () {

                        var emailBody = '<h3></h3><p>Hi ' + result.attributes.fullname + ',</h3></p> <p>Please click on the following link to reset your password:' +
                            '<a href="https://syncholar.com/password-reset/'+userId+'/'+ activation_code +'">https://syncholar/password-reset/'+userId+'/'+ activation_code+ '</a>'
                            + ' ,</p><p> <br>--------------------<br> Syncholar Team</p>';
                        sendMail('Password Reset - Syncholar', emailBody, result.attributes.email);

                        res.redirect('/password-reset/verify');

                    }, function (error) {

                        res.render('password-reset', {Error: error.message, path: req.path});
                    });
                }
                else
                {
                    res.render('password-reset', {Error: "Email is not valid!", path: req.path});
                }
            }, error: function (err) {
                res.render('password-reset', {Error: error.message, path: req.path});
            }
        });
    });
    app.post('/password-reset', function (req, res, next) {
        var password = req.body.password;
        var confirmpassword = req.body.confirmpassword;
        if(confirmpassword != password)
         res.render("change-password",{Error:"Passwords don't match!",path:req.path});
        else {
            var userId = req.body.userId;
            var query = new Parse.Query(Parse.User);
            query.equalTo("objectId", userId);
            query.first({
                success: function (result) {
                    if (result) {

                        result.set("password", password);
                        result.save(null, {useMasterKey: true}).then(function () {

                            Parse.User.logIn(result.get("username"), password, {
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

                        }, function (error) {

                            res.render('signin', {Error: error.message, path: req.path})
                        });
                    }
                }, error: function (err) {
                    res.render('password-reset', {Error: error.message, path: req.path});
                }
            });
        }
    });
  /*******************************************
   *
   * SIGN UP
   *
   ********************************************/
  app.get('/signup',hasBetaCode, function (req, res, next) {
      if (!req.isAuthenticated()) {
          res.render('signup', {title: 'Sign Up', path: req.path, Error: ""});
      }
      else {
          res.redirect('/');
      }
   });

// <<<<<<< HEAD
  app.post('/signup', function (req, res, next) {
    // if (req.body.firstname == undefined || req.body.lastname == undefined || req.body.email == undefined || req.body.password == undefined || req.body.verification == undefined) {
    //   return false;
    // }

    var fullname = req.body.firstname + " " + req.body.lastname;
    var username = req.body.firstname + "_" + req.body.lastname;

    // check if username already exists in db
    var maxIndexSoFar = -1;
    var query = new Parse.Query(Parse.User);
    query.startsWith("username", username);
    query.each(function(result) {

        var str = result.get("username");
        var strArr = str.split(".");
        if (strArr.length == 0 || strArr[1] == undefined) {
            if (str == username) {
                username += ".0";
            }
            return;
        }
        var index = parseInt(strArr[1]);

        if (maxIndexSoFar < index) {
            maxIndexSoFar = index;
        }
    }).then(function() {
          if (maxIndexSoFar == -1) {
              // no match in db, all good - keeping this just in case we need to hand such a case (e.g if we dont want to include a seq num for the very first user)
          } else {
              // update username to use next index
              var newIndex = maxIndexSoFar + 1;
              username = req.body.firstname + "_" + req.body.lastname + "." + newIndex;
          }
      }, function(error) {
          console.log("ERROR THROWN: ");
          console.log(error);
    }).then(function() {
         var email_code= randomString(3)+req.body.email.split("@")[0]+randomString(3);
         var user = new Parse.User();
         user.set("username", username);
         user.set("password", req.body.password);
         user.set("firstname", req.body.firstname);
         user.set("lastname", req.body.lastname);
         user.set("fullname", fullname);
         user.set("email", req.body.email);
         user.set("imgUrl", "/images/user.png");
         user.set("interestsTag", []);
         user.set("interests", []);
         user.set("summary", "");
         user.set("educations", []);
         user.set("about", "");
         user.set("projects", []);
         user.set("workExperience", []);
         user.set("emailVerified", false);
         user.set("email_token",email_code)

     user.signUp(null, {
        success: function (user) {
            var emailBody ='<h3><p>Welcome to Syncholar '+req.body.fullname+',</p> </h3>'+ '<p>Please click on the link below to verify your email address:</p>'+
                '<a href="https://syncholar.com/verify-email/'+email_code+'" >https://syncholar.com/verify-email/'+email_code+'</a></p><p><br>--------------------<br>Syncholar Team</p>';
            sendMail("verify Email - Syncholar",emailBody,req.body.email);

           passport.authenticate('local', { successRedirect: '/',
               failureRedirect: '/signin'}, function(err, user, info) {

               if(err) {
                   return res.render('signin', {page:'login',title: 'Sign In', Error: err.message});
               }

               if(!user) {
                   return res.render('signin', {page:'login',title: 'Sign In', Error: info.message});
               }
               return req.logIn(user, function(err) {
                       if(err) {
                           return res.render('signin', {page:'login',title: 'Sign In', Error: err.message});
                       } else {
                           return res.redirect('/');
                       }
                   });
               })(req, res, next)
           },
           error: function (user, error) {
             // Show the error message somewhere and let the user try again.
             console.log(error);
             res.render('signup', {Error: error.message, path: req.path});
           }
         })
      })
   });

  /*******************************************
   *
   * SIGN IN
   *
   ********************************************/
  app.get('/signin',hasBetaCode, function (req, res, next) {
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
              return res.render('signin', {page:'login',title: 'Sign In', Error: err.message});
          }

          if(!user) {
              return res.render('signin', {page:'login',title: 'Sign In', Error: info.message});
          }
          return req.logIn(user, function(err) {
              if(err) {
                  return res.render('signin', {page:'login',title: 'Sign In', Error: err.message});
              } else {
                  //remember me option is checked, create a token for this user and save in db and res
                  if(req.body.remember)
                  {
                      var timestamp= Date.now() / 1000 | 0;
                      var cookie_token= randomString(5)+timestamp+randomString(5);
                      var query = new Parse.Query(Parse.User);
                      query.equalTo("username", user);
                      query.first({
                          success: function (result) {
                              if (result) {
                                  result.set("cookie_token",cookie_token);
                                  result.save(null, { useMasterKey: true });
                                  var cookie_age=  30*24*60*1000; //30 days
                                  res.cookie('syncholar_cookie', cookie_token, { maxAge: cookie_age });
                                  return res.redirect('/');
                              }
                          },
                          error: function ( error) {
                              console.log("Couldnt save cookie token")
                          }
                      });

                  }
                  else
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
            res.clearCookie("syncholar_cookie");
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

app.get('/terms',include_user, function (req, res, next) {
    res.render('terms', {title: 'Terms', path: req.path});
});
    /*******************************************
     *
     * About
     *
     ********************************************/

    app.get('/about',include_user, function (req, res, next) {
        res.render('about', {title: 'About Us', path: req.path});
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

                                      var emailBody ='<h3></h3><p>Hi '+result.attributes.fullname+',</h3></p> <p>Please click on the following link to connect your linkedin to your account:' +
                                      '<a href="https://syncholar.com/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'">https://syncholar/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'</a>'
                                      +' ,</p><p> <br>--------------------<br> Syncholar Team</p>';
                                          sendMail('Connecting Linkedin to your account',emailBody,result.attributes.email);

                                         res.redirect('/auth/linkedin/verify');

                                      },function(error) {

                                          res.render('signin', {Error: error.message, path: req.path})
                                      });
                              }
                                else {

                                  var user = new Parse.User();
                                  var randomPass = randomString(5);

                                  user.set("fullname", name);
                                  user.set("username", linkedin_ID);
                                  user.set("password", randomPass);
                                  user.set("linkedin_id", linkedin_ID);
                                  user.set("email", email);
                                  user.set("about",about);
                                  user.set("interestsTag", []);
                                  user.set("emailVerified",true);
                                  user.set("interests", []);
                                  user.set("summary", "");
                                  user.set("educations", []);
                                  user.set("projects", []);
                                  user.set("workExperience", []);
                                  user.signUp(null,
                                      {
                                      success: function (user) {
                                          Parse.User.logIn(linkedin_ID, randomPass, {
                                              success: function(u) {
                                                  //get image from linkedin
                                                  processLinkedinImage(email,$in);
                                                  var emailBody ='<h3><p>Welcome to Syncholar '+name+',</p> </h3>'+ '<p>We noticed you signed up using Linkedin. We have also created an username and a password for you:</p>'+
                                                      '<h4>Username:'+email+'</h4><p><h4>Password:'+randomPass+'</h4></p><p><br>-------------------<br>Syncholar Team</p>';
                                                  sendMail('Welcome To Syncholar',emailBody,email);

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
    app.get("/verify-email", function (req,res,next) {

        res.render("verify-email");
    });
    app.get("/verify-email/:activation",function(req,res,next){
        var code= req.params.activation;
        var query = new Parse.Query(Parse.User);
        query.equalTo("email_token", code);
        query.first({
            success: function (user) {
                if(user)
                {
                    user.set("emailVerified",true);
                    user.save(null,{ useMasterKey: true }).then(function() {
                        res.redirect("/");
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



};