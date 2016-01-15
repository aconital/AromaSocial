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
     * ORGANIZATION
     *
     ********************************************/
    app.get('/organization', function (req, res, next) {
        res.render('organization', {layout: 'home', title: 'Organization', path: req.path});
    });
    app.get('/organization/:objectId', function (req, res, next) {
        var currentUser = Parse.User.current();
        var query = new Parse.Query('Organization');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('organization', {layout: 'home', title: 'Organization', path: req.path,
                    currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl,
                    objectId: req.params.objectId,
                    name: result.get('name'),
                    about: result.get('about'),
                    location: result.get('location'),
                    organization_imgURL: result.get('profile_imgURL')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    //Done by Hirad
    //not doing it in REACT
    //getting People of org here and pass it to view
    app.get('/organization/:objectId/people', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.include('userId');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId.attributes;

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
                        var work_experience= user.work_experience[0];
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
    //Done by Hirad
    //not doing it in REACT
    //getting pending requests for People of org here and pass it to view
    app.get('/organization/:objectId/pending', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.equalTo('verified',false)
        query.include('userId');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId.attributes;

                    var username= user.username;
                    var fullname="N/A";
                    var company= "N/A";
                    var work_title= "N/A";
                    var userImgUrl= "/images/user.png";
                    var work_experience= [];
                    var id = result[uo].attributes.userId.id;
                    if(user.hasOwnProperty('fullname')){
                        fullname=user.fullname;
                    }
                    if(user.hasOwnProperty('imgUrl')){
                        userImgUrl=user.imgUrl;
                    }
                    //getting first work experience, since there is no date on these objects
                    if(user.hasOwnProperty('work_experience')){
                        var work_experience= user.work_experience[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }

                    //only show people who are verified by admin
                    if(!verified)
                    {
                        var person = {
                            id : id,
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
                res.json(people);

            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.post('/organization/:objectId/pending', function (req, res, next) {
        var person= req.body.person;
        var orgId= req.params.objectId;
        var mode= req.body.mode;


        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",orgId);

        var innerQuery2 = new Parse.Query(Parse.User);
        innerQuery2.equalTo("objectId",person.id);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.matchesQuery("userId",innerQuery2)
        query.equalTo('verified',false)
        query.include('userId');
        query.first({
            success: function(result) {
                if(mode=="approve")
                {
                    result.set("verified",true);
                    result.save(null, {
                        success:function(){
                            res.json({scucess:"approved"});
                        },
                        error:function(error){
                            res.json({error:error});
                        }
                    });
                }
                else if(mode=="deny")
                {
                    result.destroy({
                        success: function(model, response){
                            res.json({scucess:"denied"});
                        },
                        error: function(model, response){
                            res.json({error:error});
                        }
                    });
                }
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });


    });
    app.get('/organization/:objectId/connections', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('RelationshipOrg');
        query.matchesQuery("orgId0",innerQuery)
        query.include('orgId1');
        query.find({
            success: function(result) {
                var orgs =[];
                for(var uo in result)
                {

                    var verified= result[uo].attributes.verified;

                    var connected_orgs= result[uo].attributes.orgId1.attributes;

                    var orgId= result[uo].attributes.orgId1.id;

                    var name= "N/A";
                    var location= "N/A";
                    var orgImgUrl= "/images/organization.png";

                    if(connected_orgs.hasOwnProperty('name')){
                        name=connected_orgs.name;
                    }
                    if(connected_orgs.hasOwnProperty('location')){
                        location=connected_orgs.location;
                    }
                    if(connected_orgs.hasOwnProperty('profile_imgURL')){
                        orgImgUrl=connected_orgs.profile_imgURL;
                    }

                    //only show people who are verified by admin
                    if(verified)
                    {
                        var org = {
                            orgId:orgId,
                            name:name,
                            location: location,
                            orgImgUrl: orgImgUrl,
                        };
                        orgs.push(org);

                    }

                }

                res.json(orgs);

            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.get('/organization/:objectId/publications', function (req, res, next) {
        var count = 0;
        var userResults =[];
        var publicationResults =[];
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.include("userId");
        query.find().then(function(users) {
            _.each(users, function(user) {
                var userId = user.get("userId").id;
                userResults.push(userId);
                console.log(userId);
            });
        }).then(function() {
            _.each(userResults, function(userId, i) {
                var queryPublications = new Parse.Query('Publication');
                queryPublications.equalTo("user", {__type: "Pointer",
                                                  className: "_User",
                                                  objectId: userId });
                queryPublications.find().then(function(publications) {
                    _.each(publications, function(publication) {
                        publicationResults.push(publication);
                    });
                }).then(function(){
                    count++;
                    if (userResults.length == count) {
                        console.log(publicationResults);
                        res.json(publicationResults);
                    }
                });
            });
        });
    });
    
    app.get('/organization/:objectId/datas', function (req, res, next) {
        var count = 0;
        var userResults =[];
        var dataResults =[];
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.include("userId");
        query.find().then(function(users) {
            _.each(users, function(user) {
                var userId = user.get("userId").id;
                userResults.push(userId);
                console.log(userId);
            });
        }).then(function() {
            _.each(userResults, function(userId, i) {
                var queryDatas = new Parse.Query('Data');
                queryDatas.equalTo("user", {__type: "Pointer",
                                                  className: "_User",
                                                  objectId: userId });
                queryDatas.find().then(function(datas) {
                    _.each(datas, function(data) {
                        dataResults.push(data);
                    });
                }).then(function(){
                    count++;
                    if (userResults.length == count) {
                        console.log(dataResults);
                        res.json(dataResults);
                    }
                });
            });
        });
    });
    
    app.get('/organization/:objectId/models', function (req, res, next) {
        var count = 0;
        var userResults =[];
        var modelResults =[];
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.include("userId");
        query.find().then(function(users) {
            _.each(users, function(user) {
                var userId = user.get("userId").id;
                userResults.push(userId);
                console.log(userId);
            });
        }).then(function() {
            _.each(userResults, function(userId, i) {
                var queryModels = new Parse.Query('Model');
                queryModels.equalTo("user", {__type: "Pointer",
                                                  className: "_User",
                                                  objectId: userId });
                queryModels.find().then(function(models) {
                    _.each(models, function(model) {
                        modelResults.push(model);
                    });
                }).then(function(){
                    count++;
                    if (userResults.length == count) {
                        console.log(modelResults);
                        res.json(modelResults);
                    }
                });
            });
        });
    });

    app.get('/organization/:objectId/admins', function (req, res, next) {

        var admins=[];
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.equalTo("isAdmin",true)
        query.include('userId');
        query.find({
            success: function (result) {
                if(result!=null)
                {
                    for (var i = 0; i < result.length; i++) {
                        var object = result[i];
                        var admin = {
                            username: object.attributes.userId.attributes.username
                        };
                        admins.push(admin);
                    }
                }
                res.json(admins);
            },
            error: function (error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.get('/create/organization', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            console.log(currentUser);
            res.render('organization',
                {layout:'home', currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl, isCreate: true});
        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });
    app.post('/create/organization', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            var Organization = Parse.Object.extend("Organization");
            var org = new Organization();
            org.set('cover_imgURL', '/images/banner.png'); // default. replace later
            org.set('profile_imgURL', '/images/organization.png');
            org.set('name', req.body.name);
            org.set('location', req.body.location ? req.body.location : 'Unknown');
            org.set('about', req.body.description ? req.body.description : 'About Organization');

            org.save(null).then(function(response) {
                // Organization object created; pass the object id to the rest of the promise chain. Upload profile image
                // if provided. FOR LATER: also support cover image.
                var objectId = response.id;

                if (req.body.file) {
                    // encode file
                    var params = awsUtils.encodeFile(req.body.name, objectId, req.body.picture, req.body.pictureType, "_org_");

                    // upload files to S3
                    var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
                    bucket.putObject(params, function (err, response) {
                        if (err) { console.log("S3 Upload Error:", err); }
                        else {
                            // update file path in parse object
                            org.set('profile_imgURL', awsLink + params.Key);
                            console.log("S3 uploaded successfully.");
                            return {objectId: objectId, data: org.save(null)};
                        }
                    });
                }
                return {objectId: objectId};
            }).then(function(response) {
                // create new Relationship object between organization and admin
                console.log('Object ID retrieved/path name updated successfully');
                var Relationship = Parse.Object.extend("Relationship");
                var relation = new Relationship();

                relation.set('userId', currentUser);
                relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: response.objectId });
                relation.set('isAdmin', true);
                relation.set('verified', true);
                relation.set('title', 'TODO');

                return {objectId: response.objectId, data: relation.save(null)};
            }).then(function(response) {
                console.log("Organization created successfully.");
                res.status(200).json({status:"OK", location: response.objectId});
            }, function(error) {
                console.log('Failed to create new organization, with error code: ' + error.message);
                res.status(500).json({status: "Creating organization failed. " + error.message});
            });

        } else {
            res.status(403).json({status:"Please login!"});
        }
    });

    app.get('/join/organization/:objectId', function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = Parse.User.current();
        if(currentUser)
        {
            var Relationship = Parse.Object.extend("Relationship");
            var relation = new Relationship();

            relation.set('userId', currentUser);
            relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: orgId });
            relation.set('isAdmin', false);
            relation.set('verified', false);
            relation.set('title', 'TODO');
            relation.save(null,{
                success:function(){
                    res.json({success: "joined successfully"});
                },
                error:function(error){
                    res.json({error:error});
                }
            });
        }
        else
        {
            res.json({error: "Please sign in!"})
        }

    });


};
