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

    app.get('/allorganizations', function(req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Organization');
        query.find({
            success: function(items) {
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                console.log("RESULTS ARE: ");
                console.log(results);
                res.send(results);
            },
            error: function(error) {
                console.log("Error while getting all organizations");
            }
        });
    });


    /*******************************************
     *
     * ORGANIZATION
     *
     ********************************************/
    app.get('/organization/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Organization');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('organization', {title: 'Organization', path: req.path,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: req.params.objectId,
                    name: result.get('name'),
                    about: result.get('about'),
                    location: result.get('location'),
                    organization_imgURL: result.get('profile_imgURL'),
                    cover_imgURL: result.get('cover_imgURL')
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
                        var work_experience= user.work_experiences[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }
                    //only show people who are verified by admin
                    if(verified) {
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
    app.get('/organization/:objectId/pending_people', function (req, res, next) {
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
                for(var uo in result) {
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
                    if(!verified) {
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

    app.get('/organization/:objectId/pending_organizations', function (req, res, next) {
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('RelationshipOrg');
        query.matchesQuery("orgId1",innerQuery)
        query.equalTo('verified',false)
        query.include('orgId0');
        query.find({
            success: function(result) {
                var organizations =[];
                for(var i in result) {
                    var name= result[i].attributes.name;
                    var verified= result[i].attributes.verified;
                    var organization= result[i].attributes.orgId0.attributes;
                    var orgId= result[i].attributes.orgId0.id;
                    var name= organization.name;
                    var location= "N/A";
                    var profile_imgURL= "/images/organization.png";
                    if(organization.hasOwnProperty('location')){
                        location=organization.location;
                    }
                    if(organization.hasOwnProperty('profile_imgURL')){
                        profile_imgURL=organization.profile_imgURL;
                    }
                    if(!verified) {
                        var organization = {
                            id : orgId,
                            name: name,
                            location: location,
                            profile_imgURL: profile_imgURL
                        };
                        organizations.push(organization);
                    }
                }
                res.json(organizations);
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.post('/organization/:objectId/pending_person_action/', function (req, res, next) {
        var personId = req.body.personId;
        var orgId = req.params.objectId;
        var mode = req.body.mode;
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",orgId);
        var innerQuery2 = new Parse.Query(Parse.User);
        innerQuery2.equalTo("objectId",personId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.matchesQuery("userId",innerQuery2);
        query.first({
            success: function(result) {
                if(mode=="admin") {
                    result.set("verified",true);
                    result.set("isAdmin",true);
                    result.save(null, {
                        success:function(){
                            res.json("Accepted!");
                        },
                        error:function(error){
                            res.json({error:error});
                        }
                    });
                }
                else if(mode=="accept") {
                    result.set("verified",true);
                    result.save(null, {
                        success:function(){
                            res.json("Accepted!");
                        },
                        error:function(error){
                            res.json({error:error});
                        }
                    });
                }
                else if(mode=="reject") {
                    result.destroy({
                        success: function(model, response){
                            res.json("Rejected!");
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
    
    app.post('/organization/:objectId/pending_organization_action/', function (req, res, next) {
        var organizationId = req.body.organizationId;
        var orgId = req.params.objectId;
        var mode = req.body.mode;
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",orgId);
        var innerQuery2 = new Parse.Query("Organization");
        innerQuery2.equalTo("objectId",organizationId);
        var query = new Parse.Query('RelationshipOrg');
        query.matchesQuery("orgId1",innerQuery);
        query.matchesQuery("orgId0",innerQuery2);
        query.first({
            success: function(result) {
                if(mode=="accept") {
                    result.set("verified",true);
                    result.save(null, {
                        success:function(){
                            res.json("Accepted!");
                        },
                        error:function(error){
                            res.json({error:error});
                        }
                    });
                }
                else if(mode=="reject") {
                    result.destroy({
                        success: function(model, response){
                            res.json("Rejected!");
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

    app.post('/organization/:objectId/update',function(req,res,next){
        var query = new Parse.Query("Organization");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.name) {
                    result.set("name", req.body.name);
                    result.set("about", req.body.about);
                    result.set("location", req.body.location);
                } result.save();
            }
        });
    });

    app.get('/organization/:objectId/join-status', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var currentUserId = currentUser.id;
        var organizationId = req.params.objectId;
        var status; console.log(organizationId); console.log(currentUserId);
        var connectQuery = new Parse.Query("Relationship");
        connectQuery.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: organizationId}).equalTo("userId", {__type: "Pointer", className: "_User", objectId: currentUserId});
        connectQuery.find({
            success: function(result) {
                if (result.length == 0) { status = "not-joined"; }
                else if (result[0].attributes.verified == true) { status = "joined"; }
                else { status = "pending"; }
                res.json(status);
            }, error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.get('/organization/:objectId/connections', function (req, res, next) {
        var orgId = req.params.objectId;
        var orgs =[];
        console.log(orgId);
        var query = new Parse.Query("RelationshipOrg");
        query.equalTo('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId});
        query.include('orgId1');
        query.find().then(function(results) {
            for (var uo in results) {
                var verified = results[uo].attributes.verified;
                var connected_orgs = results[uo].attributes.orgId1.attributes;
                var orgId = results[uo].attributes.orgId1.id;
                var name = "N/A";
                var location = "N/A";
                var orgImgUrl = "/images/organization.png";
                if (connected_orgs.hasOwnProperty('name')) {
                    name = connected_orgs.name;
                }
                if (connected_orgs.hasOwnProperty('location')) {
                    location = connected_orgs.location;
                }
                if (connected_orgs.hasOwnProperty('profile_imgURL')) {
                    orgImgUrl = connected_orgs.profile_imgURL;
                }
                var org = {
                    orgId: orgId,
                    name: name,
                    location: location,
                    orgImgUrl: orgImgUrl,
                };
                //only orgs that are verified
                if (verified) {
                    var org = {
                        orgId: orgId,
                        name: name,
                        location: location,
                        orgImgUrl: orgImgUrl,
                    };
                    orgs.push(org);
                }
            }
        }).then(function(results){
            var query1 = new Parse.Query("RelationshipOrg");
            query1.equalTo('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId});
            query1.include('orgId0');
            query1.find().then(function(results) {
                for (var uo in results) {
                    var verified = results[uo].attributes.verified;
                    var connected_orgs = results[uo].attributes.orgId0.attributes;
                    var orgId = results[uo].attributes.orgId0.id;
                    var name = "N/A";
                    var location = "N/A";
                    var orgImgUrl = "/images/organization.png";
                    if (connected_orgs.hasOwnProperty('name')) {
                        name = connected_orgs.name;
                    }
                    if (connected_orgs.hasOwnProperty('location')) {
                        location = connected_orgs.location;
                    }
                    if (connected_orgs.hasOwnProperty('profile_imgURL')) {
                        orgImgUrl = connected_orgs.profile_imgURL;
                    }
                    //only orgs that are verified
                    if (verified) {
                        var org = {
                            orgId: orgId,
                            name: name,
                            location: location,
                            orgImgUrl: orgImgUrl,
                        };
                        console.log(org);
                        orgs.push(org);
                    }
                }
            }).then(function(results){
                console.log(orgs);
                res.json(orgs);
            })
        })
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
                if(result!=null){
                    for (var i = 0; i < result.length; i++) {
                        var object = result[i];
                        var admin = {
                            username: object.attributes.userId.attributes.username,
                            imgUrl: object.attributes.userId.attributes.imgUrl
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

    app.get('/create/organization', is_auth, function (req, res, next) {
        var currentUser = req.user;
        if (currentUser) {
            res.render('organization',
                {layout:'home', currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl, isCreate: true});
        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });
    app.post('/create/organization', is_auth, function (req, res, next) {
        var currentUser = req.user;
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

    app.get('/manage/organization', is_auth, function (req, res, next) {
        var currentUser = req.user;
        if (currentUser) {
            res.render('organization',
                {
                currentUsername: currentUser.username,
                currentUserImg: currentUser.imgUrl,
                isCreate: false,
                isManage: true}
            );
        }
        else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });

    app.get('/organization/:objectId/join', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = req.user;
        if(currentUser)
        {
            var Relationship = Parse.Object.extend("Relationship");
            var relation = new Relationship();

            relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: orgId });
            relation.set('userId', { __type: "Pointer", className: "_User", objectId: currentUser.id });
            relation.set('isAdmin', false);
            relation.set('verified', false);
            relation.set('title', 'TODO');
            relation.save(null,{
                success:function(){
                    res.json({success: "Joined Successfully"});
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
    app.get('/organization/:objectId/delete', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = req.user;
        if(currentUser) {
            var query = new Parse.Query('Relationship');
            query.equalTo("userId", currentUser);
            query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: orgId});
            query.equalTo('verified', true);
            query.equalTo('isAdmin', true);
            query.first().then(
                function (result) {
                    if (result==undefined) {
                        return Parse.Promise.error("Organization delete failed");
                    }
                    else {
                        var deleteOrg = new Parse.Query('Organization');
                        return deleteOrg.get(orgId);
                    }
                }).then(function (result) {
                    if (result==undefined){
                        console.log("Nothing to delete");
                    }
                    result.destroy({});
                    res.json({success: "Organization deleted"});
                    console.log("DELETED");
                }, function (error) {
                    res.json({error: error});
                });
        }
        else{
            res.json({error: "Please Sign In!"})
        }
    });
    app.get('/organization/:objectId/leave', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = req.user;
        if(currentUser) {
            var query1 = new Parse.Query('Relationship');
            query1.equalTo("userId", currentUser);
            query1.equalTo("orgId",{__type: "Pointer", className: "Organization", objectId: orgId});
            query1.equalTo('verified',true);
            query1.first({
                success: function(result) {

                   result.destroy({
                       success: function(model, response){
                           res.json({success: "Left Successfully"});
                       },
                       error: function(model, response){
                           res.json({error:error});
                       }
                   });
                },
                error: function(error) {
                    console.log(error);
                    res.render('index', {title: error, path: req.path});
                }
            });
        }
        else
        {
            res.json({error: "Please Sign In!"})
        }
    });

    app.post('/organization/:objectId/connect', is_auth, function (req, res, next) {
        var createConnection = Parse.Object.extend("RelationshipOrg");
        var orgId0= req.params.objectId;
        var orgId1= req.body.orgId;
        //check the connection one way
        var query = new Parse.Query("RelationshipOrg");
        query.equalTo(orgId0, { __type: "Pointer", className: "Organization", objectId: orgId0});
        query.equalTo(orgId1, { __type: "Pointer", className: "Organization", objectId: orgId1});
        //check the connection other way
        var query1 = new Parse.Query("RelationshipOrg");
        query1.equalTo(orgId1, { __type: "Pointer", className: "Organization", objectId: orgId0});
        query1.equalTo(orgId0, { __type: "Pointer", className: "Organization", objectId: orgId1});
        //combine both queries
        var orQuery =  new Parse.Query.or(query, query1)
        orQuery.first(function(result){
            //if a result is returned then skip connection creation
            if (result==undefined){
                //no connection, therefore add connection
                console.log("Couldnt find connection, adding connection");
                var connection = new createConnection();
                connection.set('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId0});
                connection.set('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId1});
                connection.set('type', req.body.type);
                connection.set('verified', false);
                return connection.save(null);
            }
            console.log("Connection Exists");
            return Parse.Promise.error("This connection already exists.");
        }).then(function(response) {
            console.log("Connection request created successfully.");
            res.status(200).json({status: "OK"});
        }, function(error) {
            console.log("Creating connection failed. " + error.message)
            res.status(500).json({status: "Creating connection failed. " + error.message});
        });
    });

     app.get('/organization/:objectId/equipments_list', is_auth, function (req, res, next) {
         var innerQuery = new Parse.Query("Organization");
         innerQuery.equalTo("objectId",req.params.objectId);
         var queryEquipment = new Parse.Query('Equipment');
         queryEquipment.matchesQuery('organization',innerQuery);
         queryEquipment.find({
             success: function(results) {
                 var equipments = [];
                 for (var i in results) {
                     var keywords = ["N/A"];
                     var objectId = results[i].id;
                     var title = results[i].attributes.title;
                     var description = results[i].attributes.description;
                     var image_URL = results[i].attributes.image_URL;
                     if (results[i].attributes.keywords !== undefined) { keywords = results[i].attributes.keywords; }
                     var equipment = {
                         objectId: objectId,
                         title: title,
                         description: description,
                         image_URL: image_URL,
                         keywords: keywords
                     }; equipments.push(equipment);
                 }
                 res.json(equipments);
             },
             error: function(error) {
                 console.log(error);
                 res.render('index', {title: error, path: req.path});
             }
         });
     });

     app.get('/organization/:objectId/projects_list', is_auth, function (req, res, next) {
         var innerQuery = new Parse.Query("Organization");
         innerQuery.equalTo("objectId",req.params.objectId);
         var queryProject = new Parse.Query('Project');
         queryProject.matchesQuery('organization',innerQuery);
         queryProject.find({
             success: function(results) {
                 var projects = [];
                 for (var i in results) {
                     var authors = ["N/A"];
                     var locations = ["N/A"];
                     var keywords = ["N/A"];
                     var objectId = results[i].id;
                     var title = results[i].attributes.title;
                     var description = results[i].attributes.description;
                     var image_URL = results[i].attributes.image_URL;
                     var start_date = "N/A";
                     var end_date = "N/A";
                     if (results[i].attributes.authors !== undefined) { authors = results[i].attributes.authors; }
                     if (results[i].attributes.locations !== undefined) { locations = results[i].attributes.locations; }
                     if (results[i].attributes.keywords !== undefined) { keywords = results[i].attributes.keywords; }
                     if (results[i].attributes.start_date !== undefined) { start_date = results[i].attributes.start_date; }
                     if (results[i].attributes.end_date !== undefined) { keywords = results[i].attributes.end_date; }
                     var project = {
                         objectId: objectId,
                         title: title,
                         description: description,
                         image_URL: image_URL,
                         authors: authors,
                         locations: locations,
                         keywords: keywords,
                         start_date: start_date,
                         end_date: end_date
                     }; projects.push(project);
                 }
                 res.json(projects);
             },
             error: function(error) {
                 console.log(error);
                 res.render('index', {title: error, path: req.path});
             }
         });
     });

    app.get('/organization/:objectId/isAdmin', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var adminQuery = new Parse.Query("Relationship");
        adminQuery.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        adminQuery.equalTo("userId", { __type: "Pointer", className: "_User", objectId: currentUser.id});
        adminQuery.first({
            success: function(result) {
                var isAdmin=true;
                if (result==undefined){
                    var isAdmin=false;
                }
                res.json({isAdmin: isAdmin});
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
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
