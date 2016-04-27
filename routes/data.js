/**
 * Created by hroshandel on 2016-01-14.
 */
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
     * DATA
     *
     ********************************************/
    app.get('/data', function (req, res, next) {
        res.render('data', {title: 'Data', path: req.path});
    });

    app.get('/data/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Data');
        query.get(req.params.objectId,{
            success: function(result) {
                var group = result.get('groupies');
                var allowed = false;
                if (group) {
                    for (var i = 0; i < group.length; i++) {
                        if (currentUser.username == group[i]) {
                            allowed = true;
                            break;
                        }
                    }
                } else {
                    allowed = true; // everyone allowed to access. No entry in groupies
                }
                if (allowed) {
                    res.render('data', {
                        path: req.path,
                        currentUserId: currentUser.id,
                        currentUsername: currentUser.username,
                        currentUserImg: currentUser.imgUrl,
                        objectId: req.params.objectId,
                        creatorId: result.get("user").id,
                        access: result.get('author'),
                        collaborators: JSON.stringify(result.get('collaborators')),
                        description: result.get('description'),
                        hashtags: result.get('hashtags'),
                        title: result.get('title'),
                        license: result.get('license'),
                        filename: result.get('filename'),
                        keywords: JSON.stringify(result.get('keywords')),
                        createdAt: result.get('createdAt'),
                        groupies: result.get('groupies'),
                        image_URL: result.get('image_URL'),
                        aws_path: result.get('path'),
                        url: result.get('url')
                    });
                }
                else {
                    res.render('error', {title: 'Not allowed to access this data', path: req.path});
                }
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.post('/profile/:username/data', is_auth, function(req,res,next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);
            var reqBody = req.body;
            // send to Parse
            var Data = Parse.Object.extend("Data");
            var data= new Data();
            data.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});  // TODO: takes pointer to user but getting map
            data.set('collaborators', JSON.parse(reqBody.collaborators));
            data.set('description', reqBody.description);
            data.set('title',reqBody.title);
            data.set('keywords',JSON.parse(reqBody.keywords));
            data.set('image_URL','/images/data.png');
            data.set('license',reqBody.license);
            data.set('path',"TODO");
//			data.set('publication',reqBody.pubLink); // TODO takes pointer to Publication obj
            data.set('number_cited',0);
            data.set('number_syncholar_factor',0);
            //data.set('groupies', groupies);
            data.save(null, {
                success: function(response) {
                    objectId = response.id;;
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });;
                    if (req.body.picture != null) {
                        var s3Key = req.params.username + "_project_picture_" + objectId + "." + req.body.pictureType;
                        var contentType = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                        var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var pictureParams = {
                            Key: s3Key,
                            Body: pictureBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentType ? contentType[1] : 'text/plain')
                        };
                        bucket.putObject(pictureParams, function (err, response) {
                            if (err) { console.log("Project Image Upload Error:", err); }
                            else {
                                data.set('image_URL', awsLink + s3Key);
                                data.save();
                            }
                        });
                    }
                    if (req.body.file != null) {
                        var s3KeyP = req.params.username + "_project_file_" + objectId + "." + req.body.fileType;
                        var contentTypeP = req.body.file.match(/^data:(\w+\/.+);base64,/);
                        var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var fileParams = {
                            Key: s3KeyP,
                            Body: fileBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                        };
                        bucket.putObject(fileParams, function (err, response) {
                            if (err) { console.log("Project File Upload Error:", err); }
                            else {
                                data.set('file_path', awsLink + s3KeyP);
                                data.save();
                            }
                        });
                    }
                    res.json({status: 'Project Uploaded!'});
                },
                error: function(response, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    res.status(500).json({status: "Creating data object failed. " + error.message});
                }
            });

        } else {
            res.status(500).json({status: 'Data upload failed!'});
        }
    });

    app.post('/data/:objectId/update', is_auth, function(req,res,next){
        var query = new Parse.Query("Data");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    result.set("title", req.body.title);
                    result.set("description", req.body.description);
                    result.set("filename", req.body.filename);
                    result.set("license", req.body.license);
                    result.set("publication_date", req.body.publication_date);
                    console.log(req.body.filename);
                }
                if (req.body.keywords) {
                    result.set("keywords",JSON.parse(req.body.keywords)); 
                }
                if (req.body.collaborators) {
                    result.set("collaborators",JSON.parse(req.body.collaborators)); 
                }
                result.save();
            }
        });
    });

    app.post('/data/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Data");
        query.get(req.params.objectId,{
            success: function(result) {
                var bucket = new aws.S3();
                var s3KeyP = req.params.objectId + "_data_picture_" + req.body.randomNumber + "." + req.body.pictureType;
                var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                var pictureParams = {
                    Bucket: 'syncholar',
                    Key: s3KeyP,
                    Body: pictureBuff,
                    ContentEncoding: 'base64',
                    ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                };
                bucket.putObject(pictureParams, function (err, data) {
                    if (err) { console.log("Profile Picture (Image) Upload Error:", err); }
                    else {
                        console.log('Uploaded Image to S3!');
                        result.set("image_URL",awsLink + s3KeyP);
                        result.save();
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    }
                });
            }
        });
    });

    /************************************
     * HELPER FUNCTIONS
     *************************************/
    function is_auth(req,res,next){

        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else { res.locals.user = req.user;
            res.locals.user = req.user;
            next();
        }
    };
};
