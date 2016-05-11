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
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
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
                    image_URL: result.get('picture').url(),
                    file_path: filename,
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
            project.set('client',req.body.client);
            project.set('link_to_resources',req.body.link_to_resources);
            project.set('URL',req.body.url);
            var promises = [];
            if (req.body.picture != null) {
                var pictureName = "project_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                promises.push(pictureFile.save().then(function () {
                    project.set('picture', pictureFile)
                }));
            }
            if (req.body.file != null) {
                var fileName = "project_file." + req.body.fileType;
                var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var fileFile = new Parse.File(fileName, {base64: fileBuff});
                promises.push(fileFile.save().then(function () {
                    project.set('file', fileFile)
                }));
            }
            return Parse.Promise.when(promises).then(function (res1, res2) {
                project.save().then(function () {
                    res.json({status: "Success in creating data"})
                })
            }, function (error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.status(500).json({status: "Creating project object failed. " + error.message});
            });
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
        query.get(req.params.objectId).then(function (result) {
            if (req.body.picture != null && result != undefined) {
                var pictureName = req.params.objectId + "_project_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                pictureFile.save().then(function () {
                    result.set('picture', pictureFile)
                    result.save().then(function () {
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    });
                });
            }
            else {
                res.status(500).json({status: "Picture Upload Failed!"});
            }
        });
    });
};

