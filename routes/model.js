
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
     * MODEL
     *
     ********************************************/
    app.get('/model', is_auth, function (req, res, next) {
        res.render('model', {title: 'Model', path: req.path});
    });
    app.get('/model/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Model');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('model', {
                    path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: req.params.objectId,
                    creatorId: result.get("user").id,
                    access: result.get('access'),
                    description: result.get('abstract'),
                    hashtags: result.get('hashtags'),
                    title: result.get('title'),
                    image: result.get('image'),
                    image_URL: result.get('image_URL'),
                    collaborators: JSON.stringify(result.get('collaborators')),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });


    app.post('/model/:objectId/update', is_auth, function(req,res,next){
        var query = new Parse.Query("Model");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    result.set("title", req.body.title);
                    result.set("abstract", req.body.description);
                    result.set("feature", req.body.feature);
                    result.set("other", req.body.other);
                    result.set("filename", req.body.filename);
                    result.set("license", req.body.license);
                    result.set("publication_date", req.body.publication_date);
                } else if (req.body.keywords) {result.set("keywords",JSON.parse(req.body.keywords)); }
                    result.save();
            }
        });
    });

    app.post('/model/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Model");
        query.get(req.params.objectId,{
            success: function(result) {
                var bucket = new aws.S3();
                var s3KeyP = req.params.objectId + "_model_picture_" + req.body.randomNumber + "." + req.body.pictureType;
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

    app.post('/profile/:username/model', is_auth, function(req,res,next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username) {
            console.log("1");
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;
            // send to Parse
            var Model = Parse.Object.extend("Model");
            var model= new Model();
            console.log("2");
            model.set('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
            model.set('abstract', reqBody.description);
            model.set('access', ["UBC"]);
            console.log("3");
            model.set('collaborators',JSON.parse(reqBody.collaborators));
            model.set('image','/images/data.png');
            model.set('image_URL','/images/data.png');
            model.set('title',reqBody.title);
            console.log("4");
            model.set('keywords',JSON.parse(reqBody.keywords));
            console.log("5");
            model.set('license',reqBody.license);
//			model.set('publication',reqBody.pubLink);
            model.set('number_cited',0);
            model.set('number_syncholar_factor',1);
            model.save(null, {
                success: function(response) {
                    console.log("6");
                    // Execute any logic that should take place after the object is saved.
                    objectId = response.id;
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    // encode file
                    if (reqBody.picture != null) {
                        var s3Key = req.params.username + "_" + objectId + "." + reqBody.pictureType;
                        var contentType = reqBody.picture.match(/^data:(\w+\/.+);base64,/);
                        var fileBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var fileParams = {
                            Key: s3Key,
                            Body: fileBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentType ? contentType[1] : 'text/plain')
                        };
                        console.log(contentType);
                        // upload files to S3
                        bucket.putObject(fileParams, function (err, data) {
                            if (err) { console.log("Model Upload Error:", err); }
                            else {
                                console.log('uploading to s3');
                                // update file name in parse object
                                model.set('image_URL', awsLink + s3Key);
                                model.save();
                            }
                        });
                        console.log("7");
                    }
                    console.log(objectId);
                    // encode picture NOTE: Parse object currently does not differentiate between image and file.
                    // Only file (saved in image_URL) is accessible on website
                    if (reqBody.file != null) {
                        var s3KeyP = req.params.username + "_" + objectId + "_pic." + reqBody.fileType;
                        var contentTypeP = reqBody.file.match(/^data:(\w+\/.+);base64,/);
                        var pictureBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var pictureParams = {
                            Key: s3KeyP,
                            Body: pictureBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                        };
                        console.log("8");
                        bucket.putObject(pictureParams, function (err, data) {
                            if (err) { console.log("Model image Upload Error:", err); }
                            else {
                                console.log('uploading to s3');

                                // update file name in parse object
                                model.set('image', awsLink + s3KeyP);
                                model.save();
                            }
                        });
                    }
                    res.status(200).json({status: "Model uploaded successfully!"});
                },
                error: function(response, error) {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    res.status(500).json({status: "Creating model object failed. " + error.message});
                }
            });
        } else {
            res.render('profile', {Error: 'Model Upload Failed!'});
            res.status(500).json({status: "Model Upload Failed! " + error.message});
        }
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
