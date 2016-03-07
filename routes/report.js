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
    app.get('/report', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            console.log(currentUser);
            res.render('report',
                {
                    layout: 'home', currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl
                });
        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });

    app.post('/report', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            var Report = Parse.Object.extend("BugReport");
            var report = new Report();
            report.set('user', currentUser);
            report.set('location', req.body.location);
            report.set('assignedTo', req.body.assignTo);
            report.set('description', req.body.description);
            report.save(null).then(function(response) {
                console.log("Report created successfully.");
                res.status(200).json({status:"OK", location: response.objectId});
            }, function(error) {
                console.log('Failed to create new report, with error code: ' + error.message);
                res.status(500).json({status: "Creating report failed. " + error.message});
            });

        } else {
            res.status(403).json({status:"Please login!"});
        }
    });

}