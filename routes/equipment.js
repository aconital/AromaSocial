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
//                  EQUIPMENT                   //
//                                              //
//**********************************************//

module.exports=function(app,Parse) {

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
                    image_URL: result.get('image_URL'),
                    file_path: result.get('file_path'),
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
        equipment.set('image_URL','/images/testtube.png');
        equipment.set('instructions',req.body.instructions);
        equipment.set('model_year',req.body.model_year);
        equipment.set('model',req.body.model);
        equipment.save(null).then(
            function(response) {
                var objectId = response.id;
                var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                if (req.body.picture!=null) {
                    var s3Key = req.params.organizationId + "_equipment_picture_" + objectId + "." + req.body.pictureType;
                    var contentType = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                    var fileBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
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
                if (req.body.file!=null) {
                    var s3KeyP = req.params.organizationId + "_equipment_file_" + objectId + "." + req.body.fileType;
                    var contentTypeP = req.body.file.match(/^data:(\w+\/.+);base64,/);
                    var pictureBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
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
            function(response, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.json({status: "Creating equipment object failed. " + error.message});
            }
        );
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
