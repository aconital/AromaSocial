/**
 * Created by hroshandel on 2016-01-14.
 */
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

module.exports=function(app,Parse,io) {


    /*******************************************
     *
     * DATA
     *
     ********************************************/
    app.get('/data', function (req, res, next) {
        res.render('data', {title: 'Data', path: req.path});
    });

    app.get('/data/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Data');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                console.log(result);
                var group = result.get('groupies');
                var allowed = false;
                if (group) {
                    for (var i = 0; i < group.length; i++) {
                        if (currentUser.username == group[i]) {
                            allowed = true;
                            break;
                        }
                    }
                } else {
                    allowed = true; // everyone allowed to access. No entry in groupies
                }
                if (allowed) {
                    var creator = JSON.parse(JSON.stringify(result.get('user')));

                    res.render('data', {
                        path: req.path,
                        currentUserId: currentUser.id,
                        currentUsername: currentUser.username,
                        currentUserImg: currentUser.imgUrl,
                        objectId: req.params.objectId,
                        creatorId: creator.objectId,
                        creatorName: creator.username,
                        creatorImg: creator.imgUrl,
                        access: result.get('author'),
                        collaborators: JSON.stringify(result.get('collaborators')),
                        description: result.get('description'),
                        title: result.get('title'),
                        license: result.get('license'),
                        filename: result.get('file').url(),
                        keywords: JSON.stringify(result.get('keywords')),
                        createdAt: result.get('createdAt'),
                        groupies: result.get('groupies'),
                        image_URL: result.get('picture').url(),
                        aws_path: result.get('path'),
                        url: result.get('url')
                    });
                }
                else {
                    res.render('error', {title: 'Not allowed to access this data', path: req.path});
                }
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.post('/profile/:username/data', is_auth, function(req,res,next){
        var currentUser = req.user;
        var Data = Parse.Object.extend("Data");
        var data = new Data();
        if (currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);
            var reqBody = req.body;
            // send to Parse
            data.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});  // TODO: takes pointer to user but getting map
            data.set('collaborators', JSON.parse(reqBody.collaborators));
            data.set('description', reqBody.description);
            data.set('title', reqBody.title);
            data.set('publication_date', new Date(reqBody.creationDate));
            data.set('keywords', JSON.parse(reqBody.keywords));
            data.set('license', reqBody.license);
            data.set('path', "TODO");
//			data.set('publication',reqBody.pubLink); // TODO takes pointer to Publication obj
            data.set('number_cited', 0);
            data.set('number_syncholar_factor', 0);
            //data.set('groupies', groupies);
            var promises = []
            var bucket = new aws.S3({params: {Bucket: 'syncholar'}});
            if (req.body.picture != null) {
                var pictureName = req.params.username + "_data_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                promises.push(pictureFile.save().then(function () {data.set('picture', pictureFile)}));
            }
            if (req.body.file != null) {
                var fileName = req.params.username + "_data_picture." + req.body.fileType;
                var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var fileFile = new Parse.File(fileName, {base64: fileBuff});
                promises.push(fileFile.save().then(function () {data.set('file', fileFile)}));
            }
            return Parse.Promise.when(promises).then(function (res1, res2) {
                data.save().then(function(){res.json({status: "Success in creating data"})})
            }, function (error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.status(500).json({status: "Creating data object failed. " + error.message});
            });
        }
    });

    app.post('/data/:objectId/update', is_auth, function(req,res,next){
        var query = new Parse.Query("Data");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    result.set("title", req.body.title);
                    result.set("description", req.body.description);
                    result.set("url", req.body.url);
                    result.set("license", req.body.license);
                    result.set("publication_date", req.body.publication_date);
                    // console.log(req.body.filename);
                }
                if (req.body.keywords) {
                    result.set("keywords",JSON.parse(req.body.keywords)); 
                }
                if (req.body.collaborators) {
                    result.set("collaborators",JSON.parse(req.body.collaborators)); 
                }
                result.save();
                res.status(200).json({status: "Data Updated Successfully!"});
            }
        });
    });

    app.post('/data/:objectId/picture', is_auth, function(req,res,next){
        var query = new Parse.Query("Data");
        query.get(req.params.objectId).then(function(result) {
            var bucket = new aws.S3({params: {Bucket: 'syncholar'}});
            if (req.body.picture != null && result != undefined) {
                var pictureName = req.params.objectId + "_data_picture." + req.body.pictureType;
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
