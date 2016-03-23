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

//**********************************************//
//                                              //
//                   PROJECT                    //
//                                              //
//**********************************************//

module.exports=function(app,Parse) {

    app.get('/project', is_auth, function (req, res, next) {
        res.render('project', {layout: 'home', title: 'Project', path: req.path});
    });

    app.get('/project/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Project');
        query.get(req.params.objectId,{
            success: function(result) {
                console.log("PASSED!");
                res.render('project', {
                    title: 'Project',
                    path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: req.params.objectId,
                    creatorId: result.get("user").id,
                    title: result.get('title'),
                    description: result.get('description'),
                    authors: result.get('authors'),
                    locations: result.get('locations'),
                    keywords: result.get('keywords'),
                    image_URL: result.get('image_URL'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.post('/profile/:username/project', is_auth, function(req,res,next){
        var currentUser = req.user;
        if (currentUser && currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;
            var keywords = reqBody.keywords.split(/\s*,\s*/g);
            var collaborators = reqBody.collaborators.split(/\s*,\s*/g);
            var Project = Parse.Object.extend("Project");
            var project = new Project();
            project.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
            project.set('organization',{ __type: "Pointer", className: "Organization", objectId: reqBody.organizationId});
            project.set('collaborators',collaborators);
            project.set('description', reqBody.description);
            project.set('title',reqBody.title);
            project.set('start_date',reqBody.startDate);
            project.set('end_date',reqBody.endDate);
            project.set('keywords',keywords);
            project.set('image_URL','/images/project.png');
            project.set('client',reqBody.client);
            project.set('link_to_resources',reqBody.link_to_resources);
            project.set('URL',reqBody.url);
            project.save(null, {
                success: function(response) {
                    objectId = response.id;
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    if (reqBody.picture != null) {
                        var s3Key = req.params.username + "_project_picture_" + objectId + "." + reqBody.fileType;
                        var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
                        var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var fileParams = {
                            Key: s3Key,
                            Body: fileBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentType ? contentType[1] : 'text/plain')
                        };
                        bucket.putObject(fileParams, function (err, data) {
                            if (err) { console.log("Project Image Upload Error:", err); }
                            else {
                                project.set('image_URL', awsLink + s3Key);
                                project.save();
                            }
                        });
                    }
                    if (reqBody.file != null) {
                        var s3KeyP = req.params.username + "_project_file_" + objectId + "." + reqBody.pictureType;
                        var contentTypeP = reqBody.picture.match(/^data:(\w+\/.+);base64,/);
                        var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var pictureParams = {
                            Key: s3KeyP,
                            Body: pictureBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                        };

                        bucket.putObject(pictureParams, function (err, data) {
                            if (err) { console.log("Project File Upload Error:", err); }
                            else {
                                project.set('file_path', awsLink + s3KeyP);
                                project.save();
                            }
                        });
                    }
                    res.json({status: 'Project Uploaded!'});
                },
                error: function(response, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    res.status(500).json({status: "Creating project object failed. " + error.message});
                }
            });
        } else {
            res.status(500).json({status: 'Project upload failed!'});
        }
    });

    app.post('/project/:objectId/update', is_auth, function(req,res,next){
        var query = new Parse.Query("Project");
        query.get(req.params.objectId,{
            success: function(result) {
                result.set("title", req.body.title);
                result.set("description", req.body.description);
                console.log(req.body.title);
                console.log(req.body.description);
                result.save();
            }
        });
    });

    app.post('/project/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Project");
        query.get(req.params.objectId,{
            success: function(result) {
                var bucket = new aws.S3();

                var s3KeyP = req.params.objectId + "_project_picture_" + req.body.randomNumber + "." + req.body.pictureType;
                var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                var pictureParams = {
                    Bucket: 'syncholar',
                    Key: s3KeyP,
                    Body: pictureBuff,
                    ContentEncoding: 'base64',
                    ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                };

                bucket.putObject(pictureParams, is_auth, function (err, data) {
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

