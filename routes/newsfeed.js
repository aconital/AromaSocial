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
app.get('/newsfeeddata', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          var NewsFeed = Parse.Object.extend("NewsFeed");
          // pub query
          var query = new Parse.Query(NewsFeed);
          query.include("pubId");
          query.include("modId");
          query.include("dataId");
          query.include('from');
          query.descending("createdAt");
          query.find({
              success: function(results) {
                  console.log("Successfully retrieved " + results.length + " feed.");
                  // Do something with the returned Parse.Object values
                  var feeds=[];
                  for (var i = 0; i < results.length; i++) {
                      var object = results[i];
                      var username = "N/A";
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
                      else if (type == "data") {
                          if (object.attributes.dataId != null && object.attributes.dataId.attributes != null) {
                              var dataItem = object.attributes.dataId.attributes;
                              var filename ="";
                              var title ="";
                              var hashtags ="";
                              var year ="";
                              var author ="";
                              var description ="";
                              var objectId = object.attributes.dataId;
                              var image_URL = dataItem.image_URL;
                              if (dataItem.filename != null) {
                                  filename = modItem.filename;
                              }
                              if (dataItem.title != null) {
                                  title = modItem.title;
                              }
                              if (dataItem.hashtags != null) {
                                  hashtags = modItem.hashtags;
                              }
                              if (dataItem.year != null) {
                                  year = modItem.year;
                              }
                              if (dataItem.author != null) {
                                  author = modItem.author;
                              }
                              if (dataItem.description != null) {
                                  description = modItem.description;
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
      }
      else {
          res.render('index', {title: 'Login failed', path: req.path});
      }
    });

    app.get('/newsfeed', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            console.log(currentUser);
            res.render('newsfeed', {
                layout: 'home',
                title: 'Website',
                currentUserId: currentUser.id,
                currentUsername: currentUser.attributes.username,
                currentUserImg: currentUser.attributes.imgUrl
            });
        }
        else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });

    app.post('/newsfeed', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
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
        }
        else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });
};