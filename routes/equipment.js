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
//                  EQUIPMENT                   //
//                                              //
//**********************************************//

module.exports=function(app,Parse,io) {

    app.get('/equipment', is_auth, function (req, res, next) {
        res.render('equipment', {title: 'Equipment', path: req.path});
    });

    app.get('/equipment/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Equipment');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('equipment', {
                    title: 'Equipment',
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: req.params.objectId,
                    creatorId: result.get("user").id,
                    title: result.get('title'),
                    description: result.get('description'),
                    instructions: result.get('instructions'),
                    image_URL: result.get('picture').url(),
                    file_path: result.get('file').url(),
                    keywords: result.get('keywords'),
                    model: result.get('model'),
                    model_year: result.get('model_year'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.post('/organization/:objectId/equipment', is_auth, function(req,res,next){
        var now = moment();
        var Equipment = Parse.Object.extend("Equipment");
        var equipment = new Equipment();
        equipment.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
        equipment.set('organization',{ __type: "Pointer", className: "Organization", objectId: req.body.organizationId});
        equipment.set('description', req.body.description);
        equipment.set('title',req.body.title);
        equipment.set('keywords',JSON.parse(req.body.keywords));
        equipment.set('instructions',req.body.instructions);
        equipment.set('model_year',req.body.model_year);
        equipment.set('model',req.body.model);
        var promises = [];
        if (req.body.picture != null) {
            var pictureName = req.params.username + "_equipment_picture." + req.body.pictureType;
            var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
            var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
            promises.push(pictureFile.save().then(function () {
                equipment.set('picture', pictureFile)
            }));
        }
        if (req.body.file != null) {
            var fileName = req.params.username + "_equipment_picture." + req.body.fileType;
            var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
            var fileFile = new Parse.File(fileName, {base64: fileBuff});
            promises.push(fileFile.save().then(function () {
                equipment.set('file', fileFile)
            }));
        }
        return Parse.Promise.when(promises).then(function (res1, res2) {
            equipment.save().then(function () {
                res.json({status: "Success in creating data"})
            })
        }, function (error) {
            console.log('Failed to create new object, with error code: ' + error.message);
            res.status(500).json({status: "Creating equipment object failed. " + error.message});
        });
    });

    app.post('/equipment/:objectId/update', is_auth, function(req,res,next){
        var query = new Parse.Query("Equipment");
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

    app.post('/equipment/:objectId/picture', is_auth, function(req,res,next) {
        var query = new Parse.Query("Equipment");
        query.get(req.params.objectId).then(function (result) {
            if (req.body.picture != null && result != undefined) {
                var pictureName = req.params.objectId + "_equipment_picture." + req.body.pictureType;
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
