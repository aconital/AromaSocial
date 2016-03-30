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

var decodeHtmlEntity = function(str) {
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};

var encodeHtmlEntity = function(str) {
  var buf = [];
  for (var i=str.length-1;i>=0;i--) {
    buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
  }
  return buf.join('');
};

module.exports=function(app,Parse) {

    app.get('/allpublications', function(req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Publication');
        query.find({
            success: function(items) {
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                console.log("RESULTS ARE: ");
                console.log(results);
                res.send(results);
            },
            error: function(error) {
                console.log("Error while getting all publications");
            }
        });
    });


    /*******************************************
     *
     * PUBLICATION
     *
     ********************************************/
    app.get('/publication', function (req, res, next) {
        res.render('publication', {layout: 'home', title: 'Publication', path: req.path});
    });
    app.get('/publication/:objectId', function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Publication');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {layout: 'home', title: 'Publication', path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('description'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    publication_date: result.get('year'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.get('/profile/:username/publications',function(req,res,next){

        var User = Parse.Object.extend("User")
        var innerQuery = new Parse.Query(User);
        innerQuery.equalTo("username", req.params.username);

        var Publication = Parse.Object.extend("Publication");
        var query = new Parse.Query(Publication);
        query.matchesQuery("user", innerQuery);
        query.descending("createdAt");
        query.find({
            success: function(results) {
                console.log("Successfully retrieved " + results.length + " publications.");

                // Do something with the returned Parse.Object values
                var pubs=[];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    pubs.push({
                        filename: object.attributes.filename,
                        title: object.attributes.title,
                        hashtags: object.attributes.hashtags,
                        date: object.createdAt,
                        year: object.attributes.year,
                        author: object.attributes.author,
                        description: object.attributes.description,

                        id: object.id
                    });


                }
                res.send(pubs);
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    });

    app.post('/profile/:username/publication', function(req,res,next){
        var currentUser = req.user;
        if (currentUser && currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);

            var reqBody = req.body;

            // send to Parse
            var Publication = Parse.Object.extend("Publication");
            var pub = new Publication();

            pub.set('user',currentUser);
            pub.set('author',reqBody.author);
            pub.set('description',reqBody.description);
            pub.set('filename',"");
            pub.set('groups',reqBody.groups);
            pub.set('hashtags',reqBody.hashtags);
            pub.set('keywords',reqBody.keywords);
            pub.set('license',reqBody.license);
            pub.set('publication_link',reqBody.publication_link);
            pub.set('title',reqBody.title);
            pub.set('groupies', reqBody.groupies);
            pub.set('year',reqBody.publishDate.substring(0,4));

            pub.save(null, {
                success: function(response) {
                    objectId = response.id;
                    // encode file
                    var params = awsUtils.encodeFile(req.params.username, objectId, reqBody.file, reqBody.fileType, "_pub_");

                    // upload files to S3
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    bucket.putObject(params, function (err, response) {
                        if (err) { console.log("Data Upload Error:", err); }
                        else {
                            console.log('uploading to s3');

                            // update file name in parse object
                            pub.set('filename', awsLink + params.Key);

                            pub.save(null, {
                                success: function(data) {
                                    console.log("Path name updated successfully.");
                                    res.status(200).json({status:"OK", query: data});
                                },
                                error: function(data, error) {
                                    console.log('Failed to update new object path, with error code: ' + error.message);
                                    res.status(500).json({status:"Uploading file failed." + error.message});
                                }
                            });
                        }
                    });
                },
                error: function(response, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    res.status(500).json({status: "Creating pub object failed. " + error.message});
                }
            });

        } else {
            res.status(500).json({status: 'Publication upload failed!'});
        }
    });
    app.delete('/profile/:username/publications',function(req,res,next){
        var currentUser = req.user;
        if (currentUser && currentUser.username == req.params.username) {
            var pubId=req.body.id;
            console.log("ID is: "+pubId);
            var Publication = Parse.Object.extend("Publication");
            var query = new Parse.Query(Publication);
            query.equalTo("objectId", pubId);
            query.first({
                success: function(object) {
                    object.destroy().then(function() {
                        res.send(200);
                    });

                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                    res.render("profile", {Error: 'No publication found!'});
                }
            });
        }
        else {
            res.render('profile', {Error: 'Deleting Publication Failed!'});
        }

    });


    app.post('/publication/:objectId/update',function(req,res,next){
        var query = new Parse.Query("Publication");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    result.set("title", req.body.title);
                    result.set("description", req.body.description);
                    result.set("year", req.body.publication_date);
                    result.set("filename", req.body.filename);
                    result.set("license", req.body.license);
                    result.set("publication_code", req.body.publication_code);
                    console.log(req.body.title);
                }
                else if (req.body.keywords) {result.set("keywords",JSON.parse(req.body.keywords)); }
                result.save();
            }
        });
    });



};
