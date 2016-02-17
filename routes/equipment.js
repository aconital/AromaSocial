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
};
