
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
    app.get('/model', function (req, res, next) {
        res.render('model', {layout: 'home', title: 'Model', path: req.path});
    });
    app.get('/model/:objectId', function (req, res, next) {
        var currentUser = Parse.User.current();
        var query = new Parse.Query('Model');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('model', {layout: 'home', title: 'Model', path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl,
                    objectId: req.params.objectId,
                    creatorId: result.get("user").id,
                    access: result.get('access'),
                    description: result.get('abstract'),
                    feature: result.get('feature'),
                    other: result.get('other'),
                    hashtags: result.get('hashtags'),
                    title: result.get('title'),
                    image: result.get('image'),
                    image_URL: result.get('image_URL'),
                    collaborators: result.get('collaborators'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    publication_date: result.get('publication_date'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });


    app.post('/model/:objectId/update',function(req,res,next){
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

    app.post('/model/:objectId/picture',function(req,res,next){
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

    app.post('/profile/:username/model',function(req,res,next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;

            // send to Parse
            var keywords = reqBody.keywords.split(/\s*,\s*/g);
            var collaborators = reqBody.collaborators.split(/\s*,\s*/g);
            var Model = Parse.Object.extend("Model");
            var model= new Model();
            model.set('user',currentUser);
            model.set('abstract', reqBody.description);
            model.set('access', ["UBC"]);
            model.set('collaborators',collaborators);
            model.set('image','/images/model.png');
            model.set('image_URL','/images/model.png');
            model.set('title',reqBody.title);
            model.set('keywords',keywords);
            model.set('license',reqBody.license);
//			model.set('publication',reqBody.pubLink);
            model.set('number_cited',0);
            model.set('number_syncholar_factor',1);

            model.save(null, {
                success: function(response) {
                    // Execute any logic that should take place after the object is saved.
                    objectId = response.id;

                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });

                    // encode file
                    if (reqBody.file != null) {
                        var s3Key = req.params.username + "_" + objectId + "." + reqBody.fileType;
                        var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
                        var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
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
                    }
                    console.log(objectId);

                    // encode picture NOTE: Parse object currently does not differentiate between image and file.
                    // Only file (saved in image_URL) is accessible on website
                    if (reqBody.picture != null) {
                        var s3KeyP = req.params.username + "_" + objectId + "_pic." + reqBody.pictureType;
                        var contentTypeP = reqBody.picture.match(/^data:(\w+\/.+);base64,/);
                        var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                        var pictureParams = {
                            Key: s3KeyP,
                            Body: pictureBuff,
                            ContentEncoding: 'base64',
                            ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                        };

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


};
