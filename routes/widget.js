/**
 * Created by hroshandel on 9/22/2016.
 */
var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var aws = require('aws-sdk');
var request = require('request');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var convertEducationWorkHistory = require('../utils/helpers').convertEducationWorkHistory;

var is_auth = require('../utils/helpers').is_auth;

module.exports=function(app,Parse,io) {
    /*
    proper of widget should be in the format of jsonp
    but due to time constraint reasons we have resorted to using iframe
    app.get("/jsonp",function(req,res,next) {
        var element = React.createElement('div', null, 'Hello World!');
        res.jsonp({html: ReactDOMServer.renderToString(element)});
    });*/

    app.get("/share/profile/:username",function (req, res, next) {

        var linkUser = req.params.username;
        //if (!linkUser) return;
        var education, workExp;
        // temorary fix for broken profile. grab education and work experience from respective tables if pointer
                    var query = new Parse.Query("User");
                    query.equalTo("username",linkUser);
                    query.first({
                        success: function(result) {
                            if(result) {

                               var promise = convertEducationWorkHistory(result.get("educations"), 'Education', result)
                                    .then(function(e) {
                                        education = e;
                                       console.log(education);
                                        return convertEducationWorkHistory(result.get("workExperience"), 'Work_experience', result);
                                    }).then(function(w) {
                                        workExp = w;

                                res.render('widget-profile', {

                                    layout: 'widget-layout',
                                    title: "Profile", path: req.path,
                                    username: result.get('username'),
                                    objectId: result.id,
                                    email: result.get('email'),
                                    about: result.get("about"),
                                    fullname: result.get('fullname'),
                                    summary: result.get('summary'),
                                    interestsTag: JSON.stringify(result.get('interestsTag')),
                                    interests: JSON.stringify(result.get('interests')),
                                    workExperience: JSON.stringify(workExp),//JSON.stringify(currentUser.workExperience),
                                    educations: JSON.stringify(education), //JSON.stringify(currentUser.educations),
                                    projects: JSON.stringify(result.get('projects')),
                                    profile_imgURL: result.get('picture').url(),
                                    isMe: false
                                });
                                   });
                            }
                            else
                                res.render('notfound',{isOrg:false,isUser:true});
                        },
                        error: function(error) {
                            res.redirect('/');
                        }
                    });

    });
    app.get('/share/profile/:objectId/organizations', function (req, res, next) {

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("userId",innerQuery)
        query.include('orgId');
        query.find({
            success: function(result) {
                var orgs =[];
                for(var uo in result) {
                    var verified= result[uo].attributes.verified;
                    var connected_orgs= result[uo].attributes.orgId.attributes;
                    var orgId= result[uo].attributes.orgId.id;
                    var name= "";
                    var location= connected_orgs.location;
                    var orgImgUrl= connected_orgs.picture.url();
                    var displayName = connected_orgs.displayName;
                    if(connected_orgs.hasOwnProperty('name')){
                        name=connected_orgs.name;
                    }
                    location=connected_orgs.location;
                    //only show people who are verified by admin
                    if(verified) {
                        var org = {
                            orgId:orgId,
                            name:name,
                            location: location,
                            orgImgUrl: orgImgUrl,
                            displayName: displayName
                        };
                        orgs.push(org);
                    }
                }
                    res.json({orgs:orgs,myOrgs:[],isMe:true});
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

}