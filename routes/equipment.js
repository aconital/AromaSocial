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

    app.get('/equipment', is_auth, function (req, res, next) {
        res.render('equipment', {layout: 'home', title: 'Equipment', path: req.path});
    });

    app.get('/equipment/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Equipment');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('equipment', {layout: 'home', title: 'Equipment', path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: req.params.objectId,
                    creatorId: result.get("user").id,
                    title: result.get('title'),
                    description: result.get('description'),
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

    app.post('/organization/:objectId/equipment', is_auth, function(req,res,next){
        var currentUser = req.user;
        var objectId;
        var now = moment();
        var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
        var reqBody = req.body;
        var keywords = reqBody.keywords.split(/\s*,\s*/g);
        var Equipment = Parse.Object.extend("Equipment");
        var equipment = new Equipment();
        equipment.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
        equipment.set('organization',{ __type: "Pointer", className: "Organization", objectId: reqBody.organizationId});
        equipment.set('description', reqBody.description);
        equipment.set('title',reqBody.title);
        equipment.set('keywords',keywords);
        equipment.set('image_URL','/images/equipment.png');
        equipment.set('instructions',reqBody.instructions);
        equipment.set('model_year',reqBody.model_year);
        equipment.set('model',reqBody.model);
        equipment.save(null, {
            success: function(response) {
                objectId = response.id;
                var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                if (reqBody.picture != null) {
                    var s3Key = req.params.organizationId + "_equipment_picture_" + objectId + "." + reqBody.fileType;
                    var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
                    var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                    var fileParams = {
                        Key: s3Key,
                        Body: fileBuff,
                        ContentEncoding: 'base64',
                        ContentType: (contentType ? contentType[1] : 'text/plain')
                    };
                    bucket.putObject(fileParams, function (err, data) {
                        if (err) { console.log("Equipment Image Upload Error:", err); }
                        else {
                            equipment.set('image_URL', awsLink + s3Key);
                            equipment.save();
                        }
                    });
                }
                if (reqBody.file != null) {
                    var s3KeyP = req.params.organizationId + "_equipment_file_" + objectId + "." + reqBody.pictureType;
                    var contentTypeP = reqBody.picture.match(/^data:(\w+\/.+);base64,/);
                    var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                    var pictureParams = {
                        Key: s3KeyP,
                        Body: pictureBuff,
                        ContentEncoding: 'base64',
                        ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                    };

                    bucket.putObject(pictureParams, function (err, data) {
                        if (err) { console.log("Equipment File Upload Error:", err); }
                        else {
                            equipment.set('file_path', awsLink + s3KeyP);
                            equipment.save();
                        }
                    });
                }
                res.json({status: 'Equipment Uploaded!'});
            },
            error: function(response, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.json({status: "Creating equipment object failed. " + error.message});
            }
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

    app.post('/equipment/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Equipment");
        query.get(req.params.objectId,{
            success: function(result) {
                var bucket = new aws.S3();

                var s3KeyP = req.params.objectId + "_equipment_picture_" + req.body.randomNumber + "." + req.body.pictureType;
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
