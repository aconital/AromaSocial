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
var configs = require('../config/configs');
var awsLink = "https://s3-us-west-2.amazonaws.com/syncholar/";
var Linkedin = require('node-linkedin')('770zoik526zuxk', 'IAbJ2h0qBh2St1IZ', configs.linkedin_callback);

var helpers = require('../utils/helpers');
var sendMail = require('../utils/helpers').sendMail;
var is_auth = require('../utils/helpers').is_auth;
var randomString= require('../utils/helpers').randomString;
var hasBetaCode= require('../utils/helpers').hasBetaCode;
var include_user= require('../utils/helpers').include_user;
var processLinkedinImage=require('../utils/helpers').processLinkedinImage;
var formatParams=require('../utils/helpers').formatParams;
var pubAlreadyExists=require('../utils/helpers').pubAlreadyExists;
var findDuplicatePubs=require('../utils/helpers').findDuplicatePubs;
var namesToUsernames=require('../utils/helpers').namesToUsernames;

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

  app.post('/inviteBuddy', function(req, res, next){
    var inviteType = req.body.invType;
    var from = req.body.from;
    var addr = req.body.addr;
    var msg = req.body.msg;
    var emailBody = req.body.emailBody;
    var user = req.user.fullname;
    var orgName = req.body.orgName;
    var orgDisplayName = req.body.orgDisplayName;
    var imgUrl = req.body.imgUrl;
    console.log(inviteType);

    // TODO: spam prevention (using captcha (?))

    var addrIsUser = false;
    var addrAlreadySent = false;
    var toUser;
    var query = new Parse.Query(Parse.User);
    query.equalTo("email", addr);
    query.first({
      success: function(result) {
        if (result == undefined) {
          // user with this email doesn't exist - check invite class if email already sent to this address
          console.log("User with given email dne");
          addrIsUser = false;
        } else {
          // user exists
          console.log("User with given email exists");
          toUser = result;
          addrIsUser = true;
        }
      },
      error: function(err) {
        console.log("Error in checking user in inviteBuddy: ", err);
        res.send({reply: err});
      }
    }).then(function(){
      if (addrIsUser) {
        // don't send email
        console.log("So addr is user");
        if (inviteType === "org2people") {
          // invite user to join organization
          console.log("org is inviting people");
          console.log("User id is: ", toUser.id);
          console.log("Org id is: ", from);
          var userId = toUser.id;
          var Relationship = Parse.Object.extend("Relationship");
          // TODO: check if entry exists
          var rq = new Parse.Query(Relationship);
          rq.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: from});
          rq.equalTo("userId", {__type: "Pointer", className: "_User", objectId: userId});
          rq.first({
            success: function(result) {
              if (result === undefined) {
                var rel = new Relationship();
                rel.set("isAdmin", false);
                rel.set("verified", false);
                rel.set("orgRequest", true);
                rel.set("userId", {__type: "Pointer", className: "_User", objectId: userId});
                rel.set("orgId", {__type: "Pointer", className: "Organization", objectId: from});
                rel.save(null, {
                  success: function(relObj) {
                    var userFullName = req.user.fullname;
                    var notification = {
                      id: from,
                      type: "org2peoplerequest",
                      from: {
                          orgId: from,
                          orgName: orgName,
                          name: orgDisplayName,
                          imgUrl: imgUrl
                      },
                      msg: "has invited you to join their organization"
                    };
                    console.log("emitting io request");

                    io.to(userId).emit('org2peoplerequest',{data:notification});

                    console.log("emitted request");

                    res.send({reply: "User already exists with this email - sending notification..."});
                  },
                  error: function(obj, err) {
                    console.log("Error while storing in Relationship: ", err.message);
                    res.json({error: err});
                  }
                });
              } else {
                console.log("Already invited this user or user already part of org");
                res.send({reply: "User already invited/part of org"});
              }
            },
            error: function(obj, err) {
              console.log("Error while querying Relationship: ", err);
              res.json({error: err});
            }
          });
        } else {
          console.log("unexpected invite type");
        }
      } else {
        var Invite = Parse.Object.extend("Invite");
        var inviteQuery = new Parse.Query(Invite);
        inviteQuery.equalTo("email", addr);
        inviteQuery.first({
          success: function(result) {
            if (result == undefined) {
              // save in Invite and send email
              var inv = new Invite();
              inv.set("email", addr);
              inv.save(null, {
                success: function(i) {
                  console.log(i);
                },
                error: function(err) {
                  console.log("Error while storing new address in Invite Class: ", err);
                  res.send({reply: err});
                }
              }).then(function() {
                // send mail after we've stored in db
                sendMail(user + ' has invited you to join Syncholar',emailBody,addr);
                res.send({reply: "Invited"});
              }, function(err) {
                console.log(err);
              })
            } else {
              // don't (?)
              console.log("Invitation email has already been sent to this user");
              res.send({reply: "Invitation email has already been sent to this user"});
            }
          },
          error: function(obj, err) {
            console.log("Error while checking invite class: ", err.message);
            res.send({reply: err});
          }
        })
      }
    }, function(err) {
      console.log(err);
      res.send({reply: err});
    })
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
          // res.render('import', { user: req.user});
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
                            '<a href="'+configs.baseUrl+'/password-reset/'+userId+'/'+ activation_code +'">'+configs.baseUrl+'/password-reset/'+userId+'/'+ activation_code+ '</a>'
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
         user.set("last_seen_notification",new Date());
         user.set("about", "");
         user.set("projects", []);
         user.set("workExperience", []);
         user.set("emailVerified", false);
         user.set("email_token",email_code)

     user.signUp(null, {
        success: function (user) {
            var emailBody ='<h3><p>Welcome to Syncholar '+req.body.firstname+',</p> </h3>'+ '<p>Please click on the link below to verify your email address: </p>'+
                '<a href="'+configs.baseUrl+'/verify-email/'+email_code+'" >'+configs.baseUrl+'/verify-email/'+email_code+'</a></p><p><br>--------------------<br>Syncholar Team</p>';
            sendMail("Verify Email - Syncholar",emailBody,req.body.email);

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
            console.log(user);
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

                                  if (result.get("signup_steps") != -1) {
                                    return res.redirect('/gettingstarted');
                                  } else
                                    return res.redirect('/');
                              }
                          },
                          error: function ( error) {
                              console.log("Couldnt save cookie token")
                          }
                      });

                  }
                  else if (user["signup_steps"] != -1) {
                      return res.redirect('/gettingstarted');
                  } else
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
            var nameArr = name.split(" ");
            var firstName = nameArr[0];
            var lastName = "";
            for (var i = 1; i < nameArr.length; i++) {
              lastName += (i == nameArr.length-1) ? nameArr[i]:nameArr[i]+" ";
            }
            console.log("FirstName: ", firstName);
            console.log("lastName: ", lastName);
            var username = name.replace(/ /g, "_");

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
                                      '<a href="'+configs.baseUrl+'/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'">'+configs.baseUrl+'/auth/linkedin/verify/'+activation_code+'/'+linkedin_ID+'</a>'
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
                                  user.set("firstname", firstName);
                                  user.set("lastname", lastName);
                                  user.set("username", username);
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
                                  user.set("last_seen_notification",new Date());
                                  user.set("workExperience", []);
                                  user.signUp(null,
                                      {
                                      success: function (user) {
                                          Parse.User.logIn(username, randomPass, {
                                              success: function(u) {
                                                  //get image from linkedin
                                                  processLinkedinImage(email,$in);
                                                  var emailBody ='<h3><p>Welcome to Syncholar '+name+',</p> </h3>'+ '<p>We noticed you signed up using Linkedin. We have also created a username and a password for you:</p>'+
                                                      '<h4>Username: '+email+'</h4><p><h4>Password: '+randomPass+'</h4></p><p><br>-------------------<br>Syncholar Team</p>';
                                                  sendMail('Welcome To Syncholar',emailBody,email);

                                                  req.login(u.attributes.username,function (err) {
                                                      if (!err)
                                                          res.redirect('/import');
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
                        res.redirect('/import');
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

/*******************************************
 *
 * SIGN UP STEPS
 *
 ********************************************/
app.get("/gettingstarted",is_auth, function (req,res,next) {
  res.render("gettingstarted", {path: req.path, fullname: req.user.fullname});
});

app.post("/gettingstarted",is_auth, function(req,res,next) {
  var currentUser = req.user;
  var query = new Parse.Query(Parse.User);

  query.get(currentUser.id).then(function(result) {
    result.set("signup_steps", req.body.signup_steps);
    return result.save(null, { useMasterKey: true });
  }).then(function(result) {
    console.log('updated step');
    res.status(200).json({status: "OK"});
  }, function(error) {
    console.log('Failed to retrieve events, with error: ' + error);
    res.status(500).json({status: "Event retrieval failed. " + error.message});
  });

});

/*******************************************
 *
 * IMPORT WORKS
 *
 ********************************************/
app.get("/import",is_auth, function (req,res,next) {
  res.render("import", {standalone: true});
});

app.get("/fetchworks", function(req, res, next) {
    var params = {
      "expr": "Composite(AA.AuN=='" + req.query.name.toLowerCase() + "')",
      "model": "latest",
      "count": "20",
      "offset": "0",
      // "orderby": "{string}",
      "attributes": "Ti,Y,D,J.JN,C.CN,F.FN,AA.AuN,E",
    };
    var url = "https://api.projectoxford.ai/academic/v1.0/evaluate?" + formatParams(params);

    var options = {
      url: url,
      headers: {
        "Ocp-Apim-Subscription-Key": "f77cb8e7af0c4868875a7917b8bbaade"
      }
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body);

        // currently only supports importing journals/conferences. Will need to add another API if support for others needed
        var publications = data.entities.filter( function(entity) {
          return (entity.hasOwnProperty('J') || entity.hasOwnProperty('C')) && entity.hasOwnProperty('E');
        });

        var user = new Parse.Query(Parse.User);
        user.get(req.user.id).then(function(result) { 
          // see if DOIs already exist in database.
          findDuplicatePubs(publications, result).then(function(results) {
            var partitioned = results;
            console.log(partitioned);

            res.status(200).json({status:"OK", data: partitioned});
          });
          // TODO add fail case
        });
      } else {
        res.status(response.statusCode).json({status: "Searching for works has failed. " + error});
      }
    }

    request(options, callback);
});

app.post("/import", function(req, res, next) {
  var saveArray = [];

  //parse each imported work, and add to saveArray for bulk saving
  for (var i = 0; i < req.body.length; i++) {
      var work = req.body[i];

      if (work.hasOwnProperty('journal')) {
        var PubType = Parse.Object.extend("Pub_Journal_Article"); // TODO refactor into helper function(?)
        var pub = new PubType();

        pub.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
        pub.set('contributors', namesToUsernames(work.contributors, req.user)); // transform names to usernames
        pub.set('abstract', work.abstract);
        pub.set('keywords', work.keywords);
        pub.set('url', work.url);
        pub.set('other_urls', work.other_urls);
        pub.set('title', work.title);
        pub.set('doi', work.doi.replace(/^(doi:)/i, '')); // entries starting with 'doi:' must be stripped for proper duplicate detection
        pub.set('publication_date', new Date(work.publication_date));

        // journal article fields
        pub.set('journal', work.journal);
        pub.set('volume', work.volume);
        pub.set('issue', work.issue);
        pub.set('page', work.page);
        pub.set('type', "journal");
        saveArray.push(pub);
      } else if (work.hasOwnProperty('conference')) {
        var PubType = Parse.Object.extend("Pub_Conference");
        var pub = new PubType();

        pub.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
        pub.set('contributors', namesToUsernames(work.contributors, req.user));
        pub.set('abstract', work.abstract);
        pub.set('keywords', work.keywords);
        pub.set('url', work.url);
        pub.set('other_urls', work.other_urls);
        pub.set('title', work.title);
        pub.set('doi', work.doi.replace(/^(doi:)/i, ''));
        pub.set('publication_date', new Date(work.publication_date));

        // conference fields
        pub.set('conference', work.conference);
        pub.set('volume', work.volume);
        pub.set('location', work.location);
        pub.set('type', "conference");
        saveArray.push(pub);
      }
  };
  
  // return success if all works are imported without error
  Parse.Object.saveAll(saveArray, {
    success: function(list) {
      res.status(200).json({status:"All works imported"});
    },
    error: function(error) {
      console.log(JSON.stringify(error,null,2));
      res.status(500).json({status: "Importing works failed. " + error.message});
    },
  });

});

// 6f909740a9436d8a63ef7bea5cfb276ae5573f1a

};