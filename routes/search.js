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
     * Search
     *
     ********************************************/
    app.post('/search', function (req, res, next) {

        var tags = req.body.tags;
        //   console.log(tags);
        var Publication = Parse.Object.extend("Publication");
        var query = new Parse.Query(Publication);
        query.include('user');
        query.containedIn("hashtags", tags.match(/#.+?\b/g));
        query.find({
            success: function (results) {
                console.log("Successfully retrieved " + results.length + " publications.");
                // Do something with the returned Parse.Object values

                var pubs = [];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];

                    var username = object.attributes.user.attributes.username;
                    var userImg = object.attributes.user.attributes.imgUrl;
                    pubs.push({
                        username: username,
                        userImg: userImg,
                        filename: object.attributes.filename,
                        title: object.attributes.title,
                        hashtags: object.attributes.hashtags,
                        author: object.attributes.author,
                        description: object.attributes.description,
                        year: object.attributes.year
                    });


                }
                res.setHeader('Content-Type', 'application/json');
                console.log(JSON.stringify(pubs))
                res.send(JSON.stringify(pubs));
                //res.render("search", {title:'Search', results: JSON.stringify(pubs)});
            },
            error: function (error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    });
    app.get('/searchpage', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            res.render('search', {
                title: 'Search',
                username: currentUser.attributes.username,
                currentUserImg: currentUser.attributes.imgUrl
            });
        } else {
            res.render('index', {title: 'Please Login', path: req.path});
        }

    });

    app.post('/searchpage', function (req, res, next) {

        var currentUser = Parse.User.current();
        if (currentUser) {
            var tagString = req.body.tags;
            console.log("TAGS:" + tagString);
            res.render("search", {
                title: 'Search',
                tags: tagString,
                username: currentUser.attributes.username,
                currentUserImg: currentUser.attributes.imgUrl
            });
        } else {
            res.render('index', {title: 'Please Login', path: req.path});
        }
    });
};