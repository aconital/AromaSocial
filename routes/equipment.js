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

    app.get('/equipment', function (req, res, next) {
        res.render('equipment', {layout: 'home', title: 'Equipment', path: req.path});
    });

    app.get('/equipment/:objectId', function (req, res, next) {
        var currentUser = Parse.User.current();
        var query = new Parse.Query('Equipment');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('equipment', {layout: 'home', title: 'Equipment', path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl,
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

    app.post('/equipment/:objectId/update',function(req,res,next){
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

    app.post('/equipment/:objectId/picture',function(req,res,next){
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

};
