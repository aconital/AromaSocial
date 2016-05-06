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
var is_auth = require('../utils/helpers').is_auth;

//**********************************************//
//                                              //
//                   PROJECT                    //
//                                              //
//**********************************************//

module.exports=function(app,Parse,io) {

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
                    file_path: result.get('file_path'),
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
        if (req.user.username == req.params.username) {
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var Project = Parse.Object.extend("Project");
            var project = new Project();
            project.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
            //project.set('organization',{ __type: "Pointer", className: "Organization", objectId: reqBody.organizationId});
            project.set('collaborators',JSON.parse(req.body.collaborators));
            project.set('description', req.body.description);
            project.set('title',req.body.title);
            project.set('start_date',req.body.startDate);
            project.set('end_date',req.body.endDate);
            project.set('keywords',JSON.parse(req.body.keywords));
            project.set('image_URL','/images/data.png');
            project.set('file_path','');
            project.set('client',req.body.client);
            project.set('link_to_resources',req.body.link_to_resources);
            project.set('URL',req.body.url);
            project.save(null, {
                success: function(response) {
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    if (req.body.picture != null) {
                        var s3Key = response.id + "_project_picture"+ "." + req.body.pictureType;
                        var contentType = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                        var fileBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
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
                    if (req.body.file != null) {
                        var s3KeyP = response.id + "_project_file" + "." + req.body.fileType;
                        var contentTypeP = req.body.file.match(/^data:(\w+\/.+);base64,/);
                        var pictureBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
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
        query.get(req.params.objectId).then(
            function(result) {
                if (req.body.picture != null) {
                    var s3Key = req.params.objectId + "_project_picture_" + req.body.randomNumber + "." + req.body.pictureType;
                    var contentType = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                    var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                    var pictureParams = {
                        Key: s3Key,
                        Body: pictureBuff,
                        ContentEncoding: 'base64',
                        ContentType: (contentType ? contentType[1] : 'text/plain')
                    };
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    bucket.putObject(pictureParams, function (err, data) {
                        if (err) { console.log("Project Image Upload Error:", err); }
                        else {
                            result.set('image_URL', awsLink + s3Key);
                            result.save().then(
                                function(){
                                    res.status(200).json({status: "Picture Uploaded Successfully!"});
                                },
                                function(errx){
                                    console.log(errx);
                                    res.status(500).json({status: "Picture uploading failed"});
                                }
                            );
                        }
                    });
                }
            }
        );
    });


};

