/**
 * Created by hroshandel on 2016-01-14.
 */
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
     * NEWS FEED
     *
     ********************************************/
app.get('/newsfeeddata', is_auth,function (req, res, next) {
          var NewsFeed = Parse.Object.extend("NewsFeed");
          // pub query
          var query = new Parse.Query(NewsFeed);
          query.include("pubId");
          query.include("modId");
          query.include("datId");
          query.include('from');
          query.descending("createdAt");
          query.limit(20);
          query.find({
              success: function(results) {
                  console.log("Successfully retrieved " + results.length + " feed.");
                  // Do something with the returned Parse.Object values
                  var feeds=[];
                  for (var i = 0; i < results.length; i++) {
                      var object = results[i];
                      var username = "N/A";
                      var fullname = "N/A"
                      var userImg = "";
                      if(object.attributes.from!=null) {
                           username = object.attributes.from.attributes.username;
                           fullname = object.attributes.from.attributes.fullname;
                           userImg = object.attributes.from.attributes.imgUrl;
                      }
                      var  type=object.attributes.type;
                      var  date=object.createdAt;
                      if(type == "pub") {
                          if(object.attributes.pubId!=null){
                              if (object.attributes.pubId.attributes != null) {
                                  var pubItem = object.attributes.pubId.attributes;
                                  var filename ="";
                                  var title ="";
                                  var hashtags ="";
                                  var year ="";
                                  var author ="";
                                  var description ="";
                                  var itemId = pubItem.objectId;
                                  var objectId = object.attributes.pubId;
                              if (pubItem.filename != null) {
                                  filename = pubItem.filename;
                              }
                              if (pubItem.title != null) {
                                  title = pubItem.title;
                              }
                              if (pubItem.hashtags != null) {
                                  hashtags = pubItem.hashtags;
                              }
                              if (pubItem.year != null) {
                                  year = pubItem.year;
                              }
                              if (pubItem.author != null) {
                                  author = pubItem.author;
                              }
                              if (pubItem.description != null) {
                                  description = pubItem.description;
                              }
                              feeds.push({
                                  itemId: itemId,
                                  fullname: fullname,
                                  username: username,
                                  userImg: userImg,
                                  type:type,
                                  date:date,
                                  filename: filename,
                                  description: description,
                                  author: author,
                                  year: year,
                                  hashtags: hashtags,
                                  title: title,
                                  objId: objectId
                              });
                              }
                          }
                      }
                      else if(type == "mod") {
                          if (object.attributes.modId != null && object.attributes.modId.attributes != null) {
                              var modItem = object.attributes.modId.attributes;
                              var filename ="";
                              var title ="";
                              var hashtags ="";
                              var year ="";
                              var author ="";
                              var description ="";
                              var objectId = object.attributes.modId;
                              var image_URL = modItem.image_URL;
                              if (modItem.filename != null) {
                                filename = modItem.filename;
                              }
                              if (modItem.title != null) {
                                  title = modItem.title;
                              }
                              if (modItem.hashtags != null) {
                                  hashtags = modItem.hashtags;
                              }
                              if (modItem.year != null) {
                                  year = modItem.year;
                              }
                              if (modItem.author != null) {
                                  author = modItem.author;
                              }
                              if (modItem.abstract != null) {
                                  description = modItem.abstract;
                              }
                              feeds.push({
                                  username: username,
                                  userImg: userImg,
                                  fullname: fullname,
                                  type:type,
                                  date:date,
                                  filename: filename,
                                  description: description,
                                  author: author,
                                  year: year,
                                  hashtags: hashtags,
                                  title: title,
                                  objId: objectId,
                                  image_URL: image_URL
                              });
                          }
                      }
                      else if (type == "dat") {
                          if (object.attributes.datId != null && object.attributes.datId.attributes != null) {
                              var datItem = object.attributes.datId.attributes;
                              var filename ="";
                              var title ="";
                              var hashtags ="";
                              var year ="";
                              var author ="";
                              var description ="";
                              var objectId = object.attributes.datId;
                              var image_URL = datItem.image_URL;
                              if (datItem.filename != null) {
                                  filename = datItem.filename;
                              }
                              if (datItem.title != null) {
                                  title = datItem.title;
                              }
                              if (datItem.hashtags != null) {
                                  hashtags = datItem.hashtags;
                              }
                              if (datItem.year != null) {
                                  year = datItem.year;
                              }
                              if (datItem.author != null) {
                                  author = datItem.author;
                              }
                              if (datItem.description != null) {
                                  description = datItem.description;
                              }
                              feeds.push({
                                  username: username,
                                  userImg: userImg,
                                  fullname: fullname,
                                  type:type,
                                  date:date,
                                  filename: filename,
                                  description: description,
                                  author: author,
                                  year: year,
                                  hashtags: hashtags,
                                  title: title,
                                  objId: objectId,
                                  image_URL: image_URL
                              });
                          }
                      }
                  }
                  res.send(feeds);
              },
              error: function(error) {
                  console.log("Error: " + error.code + " " + error.message);
              }
          });
    });

    app.get('/organizations', is_auth, function (req, res, next){
        var orgs =[];
        var query = new Parse.Query('Relationship');
        query.equalTo('userId',{ __type: "Pointer", className: "_User", objectId: req.user.id});
        query.include('orgId');
        query.each(function(result) {
            var verified = result.get('verified');
            var orgId = result.get('orgId').id;
            var orgName = result.get('orgId').get('name');
            //console.log("VERIFIED " +verified + " ORGID " + orgId + " ORGNAME " + orgName);
            if (verified) {
                var org = {
                    orgId: orgId,
                    orgName: orgName
                }
                orgs.push(org);
            }
        }).then(function(){
            console.log(JSON.stringify(orgs));
            res.json(orgs);
        })
    });

    app.post('/newsfeed', is_auth,function (req, res, next) {
        var NewsFeed = Parse.Object.extend("NewsFeed");
        var newsFeed = new NewsFeed();
        newsFeed.set('from', currentUser);
        newsFeed.set('content', req.body.content);
        newsFeed.save(null, {
            success: function (newsfeed) {
                // Execute any logic that should take place after the object is saved.
                res.render('newsfeed', {
                    title: 'NewsFeed', userId: currentUser.id,
                    username: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl
                });
            },
            error: function (newsfeed, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('Failed to create new object, with error code: ' + error.message);
                res.render('newsfeed', {title: 'NewsFeed', msg: 'Posting content failed!'});
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
};