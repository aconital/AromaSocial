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
     * PROFILE
     *
     ********************************************/
    app.get('/profile/:username', function (req, res, next) {
        var currentUser = Parse.User.current();
        var linkUser = req.params.username;
        if (currentUser) {
            if(currentUser.attributes.username == linkUser) {
                res.render('profile', {layout: 'home', title: 'Profile', path: req.path,
                    currentUsername: currentUser.attributes.username,
                    objectId: currentUser.id,
                    currentUserImg: currentUser.attributes.imgUrl,
                    username: currentUser.attributes.username,
                    email: currentUser.attributes.email,
                    fullname: currentUser.attributes.fullname,
                    about: currentUser.attributes.about,
                    position: currentUser.attributes.position,
                    location: currentUser.attributes.location,
                    summary: currentUser.attributes.summary,
                    expertise: JSON.stringify(currentUser.attributes.expertise),
                    interests: JSON.stringify(currentUser.attributes.interests),
                    work_experiences: JSON.stringify(currentUser.attributes.work_experiences),
                    educations: JSON.stringify(currentUser.attributes.educations),
                    projects: JSON.stringify(currentUser.attributes.projects),
                    profile_imgURL: currentUser.attributes.imgUrl,
                    'isMe': true
                });
            }
            else {
                var query = new Parse.Query(Parse.User);
                query.equalTo("username",linkUser); query.limit(1);
                query.find({
                    success: function(result) {
                        res.render('profile', {layout: 'home', title: 'Profile', path: req.path,
                            currentUsername: currentUser.attributes.username,
                            currentUserImg: currentUser.attributes.imgUrl,
                            username: result[0].attributes.username,
                            objectId: result[0].id,
                            email: result[0].attributes.email,
                            fullname: result[0].attributes.fullname,
                            about: result[0].attributes.about,
                            position: result[0].attributes.position,
                            location: result[0].attributes.location,
                            summary: result[0].attributes.summary,
                            expertise: JSON.stringify(result[0].attributes.expertise),
                            interests: JSON.stringify(result[0].attributes.interests),
                            work_experiences: JSON.stringify(result[0].attributes.work_experiences),
                            educations: JSON.stringify(result[0].attributes.educations),
                            projects: JSON.stringify(result[0].attributes.projects),
                            profile_imgURL: result[0].attributes.imgUrl,
                            'isMe': false
                        });
                    },
                    error: function(error) {
                        res.redirect('/newsfeed');
                    }
                });
            }
        } else {
            res.render('index', {title: 'Please Login!', path: req.path});
        }
    });

    app.get('/profile/:objectId/connections', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('RelationshipUser');
        query.matchesQuery("userId0",innerQuery)
        query.include('userId1');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId1.attributes;

                    var username= user.username;
                    var fullname="N/A";
                    var company= "N/A";
                    var work_title= "N/A";
                    var userImgUrl= "/images/user.png";
                    var work_experience= [];

                    if(user.hasOwnProperty('fullname')){
                        fullname=user.fullname;
                    }
                    if(user.hasOwnProperty('imgUrl')){
                        userImgUrl=user.imgUrl;
                    }
                    //getting first work experience, since there is no date on these objects
                    if(user.hasOwnProperty('work_experiences')){
                        var work_experience= user.work_experiences[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }

                    //only show people who are verified by admin
                    if(verified)
                    {
                        var person = {
                            username:username,
                            title: title,
                            fullname: fullname,
                            userImgUrl: userImgUrl,
                            company: company,
                            workTitle: work_title
                        };
                        people.push(person);

                    }

                }
                var filtered_people=  _.groupBy(people,'title');
                res.json(filtered_people);


            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });



};
