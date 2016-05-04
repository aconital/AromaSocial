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
     * GROUP
     *
     ********************************************/
    app.get("/groups/:id", function (req, res, next) {
        var Group = Parse.Object.extend("Group");
        var query = new Parse.Query(Group);
        query.find({
            success: function (results) {
                console.log("Successfully retrieved " + results.length + " groups.");

                res.render('group');
            }
        });
    });

};