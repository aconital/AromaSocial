
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
var is_auth = require('../utils/helpers').is_auth;

module.exports=function(app,Parse,io) {
    /*******************************************
     *
     * MODEL
     *
     ********************************************/
    app.post('/allmodels', function(req, res, next) {
        var str = req.body.substr;

        var q = new Parse.Query("Model");
        q.limit(1000);
        q.contains("title", str);
        q.find({
            success: function(items) {
                console.log("ALL MODELS: ");
                console.log(items);
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                res.send(results);
            },
            error: function(error) {
                console.log("Error while getting all models");
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.get('/model', is_auth, function (req, res, next) {
        res.render('model', {title: 'Model', path: req.path});
    });
    app.get('/model/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Model');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var creator = JSON.parse(JSON.stringify(result.get('user')));
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('model', {
                    path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    objectId: req.params.objectId,
                    creatorId: creator.objectId,
                    creatorName: creator.username,
                    creatorImg: creator.picture.url,
                    access: result.get('access'),
                    description: result.get('abstract'),
                    title: result.get('title'),
                    image: filename, // TODO fix this shitty naming
                    image_URL: result.get('picture').url(),
                    collaborators: JSON.stringify(result.get('collaborators')),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt'),
                    url: result.get('url')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.delete('/model/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        if (currentUser) {
            var Model = Parse.Object.extend("Model");
            var query = new Parse.Query(Model);
            query.get(req.params.objectId, {
                success: function(result) {
                    result.destroy({});
                    res.status(200).json({status:"OK"});
                },
                error: function(error) {
                    console.log(error);
                    res.status(500).json({status:"Query failed "+error.message});
                }
            });
        } else {
            res.status(403).json({status:"Couldn't delete model"});
        }
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
                    result.set("url", req.body.url);
                    result.set("license", req.body.license);
                    result.set("publication_date", req.body.publication_date);
                }
                if (req.body.keywords) {
                    result.set("keywords",JSON.parse(req.body.keywords)); 
                }
                if (req.body.collaborators) {
                    result.set("collaborators",JSON.parse(req.body.collaborators)); 
                }
                result.save();
                res.status(200).json({status: "Model Updated Successfully!"});
            }
        });
    });

    app.post('/model/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Model");
        query.get(req.params.objectId).then(function(result) {
            if (req.body.picture != null && result != undefined) {
                var pictureName = req.params.objectId + "_model_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                pictureFile.save().then(function() {
                    result.set('picture', pictureFile)
                    result.save().then(function(){
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    });
                });
            }
            else{
                res.status(500).json({status: "Picture Upload Failed!"});
            }
        });
    });

    app.post('/model/:objectId/upload', function(req,res,next) {
        var query = new Parse.Query("Model");
        query.get(req.params.objectId).then(function(result) {
            if (req.body.file != null && result != undefined) {
                var name = req.params.objectId + "_project_file." + req.body.fileType;
                var fileBuffer = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var newFile = new Parse.File(name, {base64: fileBuffer});
                newFile.save().then(function() {
                    result.set('file', newFile)
                    result.save().then(function(){
                        res.status(200).json({status: "File Uploaded Successfully!"});
                    });
                });
            }
            else{
                res.status(500).json({status: "File Upload Failed!"});
            }
        });
    });

    app.post('/profile/:username/model', is_auth, function(req,res,next) {
        var currentUser = req.user;
        var Model = Parse.Object.extend("Model");
        var model = new Model();
        if (currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;
            // send to Parse
            model.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
            model.set('abstract', reqBody.description);
            model.set('access', ["UBC"]);
            model.set('collaborators', JSON.parse(reqBody.collaborators));
            model.set('publication_date', new Date(reqBody.creationDate));
            model.set('title', reqBody.title);
            model.set('keywords', JSON.parse(reqBody.keywords));
            model.set('license', reqBody.license);
//			model.set('publication',reqBody.pubLink);
            model.set('number_cited', 0);
            model.set('number_syncholar_factor', 1);
            var promises = [];
            if (req.body.picture != null) {
                var pictureName = "model_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                promises.push(pictureFile.save().then(function () {
                    model.set('picture', pictureFile)
                }));
            }
            if (req.body.file != null) {
                var fileName = "model_file." + req.body.fileType;
                var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var fileFile = new Parse.File(fileName, {base64: fileBuff});
                promises.push(fileFile.save().then(function () {
                    model.set('file', fileFile)
                }));
            }
            return Parse.Promise.when(promises).then(function (res1, res2) {
                model.save().then(function () {
                    res.json({status: "Success in creating data"})
                })
            }, function (error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.status(500).json({status: "Creating data object failed. " + error.message});
            });
        }
    });
};
