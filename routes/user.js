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
                query.equalTo("username",linkUser).limit(1);
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

    app.get('/profile/:objectId/connection-status', function (req, res, next) {
        var currentUser = Parse.User.current();
        var currentUserId = currentUser.id;
        var otherUserId = req.params.objectId;
        var status; console.log(otherUserId); console.log(currentUserId);

        var connectQuery1 = new Parse.Query("RelationshipUser");
        var connectQuery2 = new Parse.Query("RelationshipUser");
        connectQuery1.equalTo("userId0", {__type: "Pointer", className: "_User", objectId: otherUserId}).equalTo("userId1", {__type: "Pointer", className: "_User", objectId: currentUserId});
        connectQuery2.equalTo("userId0", {__type: "Pointer", className: "_User", objectId: currentUserId}).equalTo("userId1", {__type: "Pointer", className: "_User", objectId: otherUserId});
        var connectQuery = Parse.Query.or(connectQuery1, connectQuery2);
        connectQuery.find({
            success: function(result) {
                if (result.length == 0) { status = "not-connected"; }
                else if (result[0].attributes.verified == true) { status = "connected"; }
                else { status = "pending"; }
                res.json(status);
            }, error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
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
    app.get('/profile/:objectId/organizations', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("userId",innerQuery)
        query.include('orgId');
        query.find({
            success: function(result) {
                var orgs =[];
                for(var uo in result)
                {

                    var verified= result[uo].attributes.verified;

                    var connected_orgs= result[uo].attributes.orgId.attributes;

                    var orgId= result[uo].attributes.orgId.id;

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

    app.post('/profile/:username',function(req,res,next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var name;
            var email;

            //upload publication
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                name=fields.inputname;
                email=fields.inputemail;
            });
            form.on('end', function(fields, files) {
                if(name !=null)
                    currentUser.set("fullname",name);
                if(email !=null)
                    currentUser.set("email",email);
                currentUser.save();
                res.render('profile', {layout: 'home', title: 'Profile', username: currentUser.attributes.username, 'isMe': true, currentUserImg:currentUser.attributes.imgUrl,
                    userImg:currentUser.attributes.imgUrl, fullname:currentUser.attributes.fullname, email: currentUser.attributes.email});
            });
        }else {
            res.render('profile', {Error: 'Profile Update Failed!'});
        }
    });
    app.post("/uploadimage/:username", function (req, res, next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                filename=files.upload.name;
            });

            form.on('end', function(fields, files) {
                // Temporary location of our uploaded file
                var temp_path = this.openedFiles[0].path;
                // The file name of the uploaded file
                var file_name = this.openedFiles[0].name;
                // Location where we want to copy the uploaded file
                var new_location = 'public/profilepictures/'+req.params.username+'/';

                fs.copy(temp_path, new_location + file_name, function(err) {
                    if (err) {
                        console.error(err);
                    }else{
                        currentUser.set("imgUrl",'/profilepictures/'+req.params.username+'/'+file_name);

                        currentUser.save();
                        res.render('profile', {title: 'Profile', username: currentUser.attributes.username, 'isMe': true, currentUserImg:currentUser.attributes.imgUrl,
                            userImg:currentUser.attributes.imgUrl, fullname:currentUser.attributes.fullname, email: currentUser.attributes.email});
                    }
                });
            });
        } else {
            res.render('profile', {Error: 'Submit Publication Failed!'});
        }
    });

    app.post('/profile/:username/picture',function(req,res,next){
        var currentUser = Parse.User.current();
        var linkUser = req.params.username;
        if (currentUser) {
            if(currentUser.attributes.username == linkUser) {
                var bucket = new aws.S3();

                var s3KeyP = req.params.username + "_profile_picture_" + req.body.randomNumber + "." + req.body.pictureType;
                var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                var pictureParams = {
                    Bucket: 'syncholar',
                    Key: s3KeyP,
                    Body: pictureBuff,
                    ContentEncoding: 'base64',
                    ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                };

                bucket.putObject(pictureParams, function (err, data) {
                    if (err) { console.log("Profile Picture (Image) Upload Error:", err); }
                    else {
                        console.log('Uploaded Image to S3!');
                        currentUser.set("imgUrl",awsLink + s3KeyP);
                        currentUser.save();
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    }
                });
            }
        }
    });

    app.post('/profile/:username/update',function(req,res,next){
        var currentUser = Parse.User.current();
        var linkUser = req.params.username;
        if (currentUser) {
            if(currentUser.attributes.username == linkUser) {
                if (req.body.summary) {
                    console.log(req.body.summary);
                    currentUser.set("summary",req.body.summary);
                    currentUser.save();
                    res.status(200).json({status: "Info Uploaded Successfully!"});
                } else if (req.body.expertise || req.body.interests) {
                    console.log(req.body.expertise);
                    if (req.body.expertise) { currentUser.set("expertise",JSON.parse(req.body.expertise)); }
                    console.log(req.body.interests);
                    if (req.body.interests) { currentUser.set("interests",JSON.parse(req.body.interests)); }
                    currentUser.save();
                    res.status(200).json({status: "Info Uploaded Successfully!"});
                } else if (req.body.work_experiences && req.body.educations && req.body.projects) {
                    console.log(req.body.work_experiences);
                    currentUser.set("work_experiences",JSON.parse(req.body.work_experiences));
                    console.log(req.body.educations);
                    currentUser.set("educations",JSON.parse(req.body.educations));
                    console.log(req.body.projects);
                    currentUser.set("projects",JSON.parse(req.body.projects));
                    currentUser.save();
                    res.status(200).json({status: "Info Uploaded Successfully!"});
                } else if (req.body.action && req.body.type) {
                    if (req.body.action == "delete") {
                        console.log("Delete");
                        if (req.body.type == "work_experience") {
                            var work_experiencesTemp = currentUser.attributes.work_experiences;
                            for(var i = 0; i < work_experiencesTemp.length; i++) {
                                if (work_experiencesTemp[i].key = req.body.key) {
                                    delete work_experiencesTemp[i];
                                    work_experiencesTemp.splice(i,1);
                                } console.log(work_experiencesTemp);
                            } currentUser.set("work_experiences",work_experiencesTemp);
                            res.status(200).json({status: "Deleted Successfully!"});
                        } else if (req.body.type == "education") {
                            var educationsTemp = currentUser.attributes.educations;
                            for(var i = 0; i < educationsTemp.length; i++) {
                                if (educationsTemp[i].key = req.body.key) {
                                    delete educationsTemp[i];
                                    educationsTemp.splice(i,1);
                                } console.log(educationsTemp);
                            } currentUser.set("educations",educationsTemp);
                            res.status(200).json({status: "Deleted Successfully!"});
                        } else if (req.body.type == "project") {
                            var projectsTemp = currentUser.attributes.projects;
                            for(var i = 0; i < projectsTemp.length; i++) {
                                if (projectsTemp[i].key = req.body.key) {
                                    delete projectsTemp[i];
                                    projectsTemp.splice(i,1);
                                } console.log(projectsTemp);
                            } currentUser.set("projects",projectsTemp);
                            res.status(200).json({status: "Deleted Successfully!"});
                        }
                        currentUser.save();
                    } else if (req.body.action == "update") {
                        console.log("Update");
                        if (req.body.type == "work_experience") {
                            var work_experiencesTemp = currentUser.attributes.work_experiences;
                            for(var i = 0; i < work_experiencesTemp.length; i++) {
                                if (work_experiencesTemp[i].key = req.body.key) {
                                    var changedWE = {key: req.body.key,
                                        title: req.body.title,
                                        company: req.body.company,
                                        description: req.body.description,
                                        start: req.body.start,
                                        end: req.body.end};
                                    work_experiencesTemp[i] = changedWE;
                                } console.log(work_experiencesTemp);
                            } currentUser.set("work_experiences",work_experiencesTemp);
                            res.status(200).json({status: "Updated Successfully!"});
                        } else if (req.body.type == "education") {
                            var educationsTemp = currentUser.attributes.educations;
                            for(var i = 0; i < educationsTemp.length; i++) {
                                if (educationsTemp[i].key = req.body.key) {
                                    var changedWE = {key: req.body.key,
                                        title: req.body.title,
                                        company: req.body.company,
                                        description: req.body.description,
                                        start: req.body.start,
                                        end: req.body.end};
                                    educationsTemp[i] = changedWE;
                                } console.log(educationsTemp);
                            } currentUser.set("educations",educationsTemp);
                            res.status(200).json({status: "Updated Successfully!"});
                        } else if (req.body.type == "project") {
                            var projectsTemp = currentUser.attributes.projects;
                            for(var i = 0; i < projectsTemp.length; i++) {
                                if (projectsTemp[i].key = req.body.key) {
                                    var changedWE = {key: req.body.key,
                                        title: req.body.title,
                                        company: req.body.company,
                                        description: req.body.description,
                                        start: req.body.start,
                                        end: req.body.end};
                                    projectsTemp[i] = changedWE;
                                } console.log(projectsTemp);
                            } currentUser.set("projects",projectsTemp);
                            res.status(200).json({status: "Updated Successfully!"});
                        }
                        currentUser.save();
                    }
                }
            }
        }
    });

    app.get('/profile/:objectId/connect', function (req, res, next) {
        var userId= req.params.objectId;
        var currentUser = Parse.User.current();
        if(currentUser)
        {
            var Relationship = Parse.Object.extend("RelationshipUser");
            var relation = new Relationship();

            relation.set('userId0', { __type: "Pointer", className: "_User", objectId: currentUser.id });
            relation.set('userId1', { __type: "Pointer", className: "_User", objectId: userId });
            relation.set('verified', false);
            relation.save(null,{
                success:function(){
                    res.json({success: "Requested Successfully"});
                },
                error:function(error){
                    res.json({error:error});
                }
            });
        }
        else
        {
            res.json({error: "Please Sign In!"})
        }
    });

    app.get('/friendrequest',function(req,res,next){
        var user= Parse.User.current();
        if(user)
        {
            var query = new Parse.Query('RelationshipUser');
            query.equalTo("verified",false)
            query.include('userId1')
            query.equalTo("userId0",user)
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
                        if(!verified)
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
                    res.json(people);


                },
                error: function(error) {
                    console.log(error);
                    res.render('home', {title: error, path: req.path});
                }
            });

        }
        else
        {
            res.render('home', {title: 'Please Login!', path: req.path});
        }
    });

    app.post('/friendrequest/', function (req, res, next) {
        var person= req.body.person;
        var mode= req.body.mode;
        var friendusername= person.username;

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("username",friendusername);

        var query = new Parse.Query('RelationshipUser');
        query.equalTo("userId0",Parse.User.current())
        query.matchesQuery("userId1",innerQuery)
        query.equalTo('verified',false)
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

    app.get('/profile/:objectId/equipments_list', function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryEquipment = new Parse.Query('Equipment');
        queryEquipment.matchesQuery('user',innerQuery);
        queryEquipment.find({
            success: function(results) {
                var equipments = [];
                for (var i in results) {
                    var objectId = results[i].id;
                    var title = results[i].attributes.title;
                    var description = results[i].attributes.description;
                    var image_URL = results[i].attributes.image_URL;
                    var equipment = {
                        objectId: objectId,
                        title: title,
                        description: description,
                        image_URL: image_URL
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

    app.get('/profile/:objectId/projects_list', function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryProject = new Parse.Query('Project');
        queryProject.matchesQuery('user',innerQuery);
        queryProject.find({
            success: function(results) {
                var projects = [];
                for (var i in results) {
                    var objectId = results[i].id;
                    var title = results[i].attributes.title;
                    var description = results[i].attributes.description;
                    var image_URL = results[i].attributes.image_URL;
                    var project = {
                        objectId: objectId,
                        title: title,
                        description: description,
                        image_URL: image_URL
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

    app.get('/profile/:objectId/publications_list', function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryProject = new Parse.Query('Publication');
        queryProject.matchesQuery('user',innerQuery);
        queryProject.find({
            success: function(results) {
                var publications = [];
                for (var i in results) {
                    var objectId = results[i].id;
                    var title = "Untitled";
                    var description = results[i].attributes.description;
                    var authors = results[i].attributes.authors;
                    var publication_code = "N/A";
                    var type = "Other";

                    if (results[i].attributes.title) { title = results[i].attributes.title; }
                    if (results[i].attributes.type) { type = results[i].attributes.type; }
                    if (results[i].attributes.publication_code) { publication_code = results[i].attributes.publication_code; }

                    var publication = {
                        objectId: objectId,
                        title: title,
                        description: description,
                        authors: authors,
                        publication_code: publication_code,
                        type: type
                    }; publications.push(publication);
                }
                var filtered_publications=  _.groupBy(publications,'type');
                res.json(filtered_publications);
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.get('/profile/:objectId/data_list', function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryProject = new Parse.Query('Data');
        queryProject.matchesQuery('user',innerQuery);
        queryProject.find({
            success: function(results) {
                var data = [];
                for (var i in results) {
                    var objectId = results[i].id;
                    var title = "Untitled";
                    var description = results[i].attributes.description;
                    var authors = results[i].attributes.collaborators;
                    var image_URL = results[i].attributes.image_URL;
                    var type = "Other";

                    if (results[i].attributes.title) { title = results[i].attributes.title; }
                    if (results[i].attributes.type) { type = results[i].attributes.type; }
                    if (results[i].attributes.publication_code) { publication_code = results[i].attributes.publication_code; }

                    var datum = {
                        objectId: objectId,
                        title: title,
                        description: description,
                        authors: authors,
                        image_URL: image_URL,
                        type: type
                    }; data.push(datum);
                }
                var filtered_data=  _.groupBy(data,'type');
                res.json(filtered_data);
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.get('/profile/:objectId/models_list', function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryProject = new Parse.Query('Model');
        queryProject.matchesQuery('user',innerQuery);
        queryProject.find({
            success: function(results) {
                var models = [];
                for (var i in results) {
                    var objectId = results[i].id;
                    var title = "Untitled";
                    var description = results[i].attributes.abstract;
                    var authors = results[i].attributes.collaborators;
                    var image_URL = results[i].attributes.image_URL;
                    var type = "Other";

                    if (results[i].attributes.title) { title = results[i].attributes.title; }
                    if (results[i].attributes.type) { type = results[i].attributes.type; }

                    var model = {
                        objectId: objectId,
                        title: title,
                        description: description,
                        authors: authors,
                        image_URL: image_URL,
                        type: type
                    }; models.push(model);
                }
                var filtered_models=  _.groupBy(models,'type');
                res.json(filtered_models);
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
};
