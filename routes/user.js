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
    app.get('/allusers', function(req, res, next) {
        var q = new Parse.Query("User");
        q.find({
            success: function(items) {
                console.log("ALL USERS: ")
                console.log(items)
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                res.send(results);
            },
            error: function(error) {
                console.log("Error while getting all users");
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    /*******************************************
     *
     * PROFILE
     *
     ********************************************/
    app.get('/profile/:username', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var linkUser = req.params.username;
        //if (!linkUser) return;
        console.log("LINK USER IS ====>>")
        console.log(req.params)
        if(currentUser.username == linkUser) {
            var obj={
                title: 'Profile',
                path: req.path,
                currentUsername: currentUser.username,
                objectId: currentUser.id,
                currentUserImg: currentUser.imgUrl,
                username: currentUser.username,
                email: currentUser.email,
                fullname: currentUser.fullname,
                about: currentUser.about,
                position: currentUser.position,
                location: currentUser.location,
                summary: currentUser.summary,
                expertise: JSON.stringify(currentUser.expertise),
                interests: JSON.stringify(currentUser.interests),
                work_experiences: JSON.stringify(currentUser.work_experiences),
                educations: JSON.stringify(currentUser.educations),
                projects: JSON.stringify(currentUser.projects),
                profile_imgURL: currentUser.imgUrl,
                isMe: true
            };
            res.render('profile', {
                title: 'Profile',
                path: req.path,
                currentUsername: currentUser.username,
                objectId: currentUser.id,
                currentUserImg: currentUser.imgUrl,
                username: currentUser.username,
                email: currentUser.email,
                fullname: currentUser.fullname,
                about: currentUser.about,
                position: currentUser.position,
                location: currentUser.location,
                summary: currentUser.summary,
                expertise: JSON.stringify(currentUser.expertise),
                interests: JSON.stringify(currentUser.interests),
                work_experiences: JSON.stringify(currentUser.work_experiences),
                educations: JSON.stringify(currentUser.educations),
                projects: JSON.stringify(currentUser.projects),
                profile_imgURL: currentUser.imgUrl,
                isMe: true
            });
        }
        else {
            var query = new Parse.Query("User");
            query.equalTo("username",linkUser);
            query.first({
                success: function(result) {
                    res.render('profile', { title: 'Profile', path: req.path,
                        currentUsername: currentUser.username,
                        currentUserImg: currentUser.imgUrl,
                        username: result.get('username'),
                        objectId: result.id,
                        email: result.get('email'),
                        fullname: result.get('fullname'),
                        about: result.get('about'),
                        position: result.get('position'),
                        location: result.get('location'),
                        summary: result.get('summary'),
                        expertise: JSON.stringify(result.get('expertise')),
                        interests: JSON.stringify(result.get('interests')),
                        work_experiences: JSON.stringify(result.get('work_experiences')),
                        educations: JSON.stringify(result.get('educations')),
                        projects: JSON.stringify(result.get('projects')),
                        profile_imgURL: result.get('imgUrl'),
                        isMe: false
                    });
                },
                error: function(error) {
                    res.redirect('/');
                }
            });
        }
    });

    app.get('/profile/:objectId/connection-status', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var currentUserId = currentUser.id;
        var otherUserId = req.params.objectId;
        var status;
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

    app.get('/profile/:objectId/connections', is_auth, function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);
        var query = new Parse.Query('RelationshipUser');
        query.matchesQuery("userId0",innerQuery)
        query.include('userId1');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result) {
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

    app.get('/profile/:objectId/organizations', is_auth, function (req, res, next) {
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
                    if(verified) {
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

    app.post('/profile/:username', is_auth,function(req,res,next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username) {
            var name;
            var email;
            //upload publication
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                name=fields.inputname;
                email=fields.inputemail;
            });
            form.on('end', function(fields, files) {
                var query = new Parse.Query(Parse.User);
                query.equalTo("email", currentUser.email);
                query.first({
                    success: function (user) {
                        if(name !=null)
                            user.set("fullname",name);
                        if(email !=null)
                            user.set("email",email);
                        user.save();
                        res.render('profile', {title: 'Profile', username: currentUser.username, isMe: true, currentUserImg:currentUser.imgUrl,
                            userImg:currentUser.imgUrl, fullname:name, email: email});
                    }
                });
            });
        }
        else {
            res.render('profile', {Error: 'Profile Update Failed!'});
        }
    });

    app.post("/uploadimage/:username", is_auth, function (req, res, next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username){
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
                    }
                    else{
                        var query = new Parse.Query(Parse.User);
                        query.equalTo("email", currentUser.email);
                        query.first({
                            success: function (user) {
                                var imgUrl='/profilepictures/'+req.params.username+'/'+file_name;
                                user.set("imgUrl",imgUrl);
                                user.save();
                                res.render('profile', {title: 'Profile', username: currentUser.username, isMe: true, currentUserImg:imgUrl,
                                    userImg: imgUrl, fullname:currentUser.fullname, email: currentUser.email});
                            }
                        });
                    }
                });
            });
        }
        else {
            res.render('profile', {Error: 'Submit Publication Failed!'});
        }
    });

    app.post('/profile/:username/picture', is_auth,function(req,res,next){
        var currentUser = req.user;
        var linkUser = req.params.username;
        if(currentUser.username == linkUser) {
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
                if (err) {
                    console.log("Profile Picture (Image) Upload Error:", err);
                }
                else {
                    var query = new Parse.Query(Parse.User);
                    query.equalTo("email", currentUser.email);
                    query.first({
                        success: function (result) {
                            result.set("imgUrl",awsLink + s3KeyP);
                            result.save();
                            res.status(200).json({status: "Picture Uploaded Successfully!"});
                        }
                    });
                }
            });
        }
    });

    app.post('/profile/:username/update', is_auth, function(req,res,next){
        var currentUser = req.user;
        var linkUser = req.params.username;
        if(currentUser.username == linkUser) {
            var query = new Parse.Query(Parse.User);
            query.equalTo("email", currentUser.email);
            query.first({
                success: function(result) {
                    if (req.body.summary) {
                        result.set("summary", req.body.summary);
                        result.save();
                        res.status(200).json({status: "Info Uploaded Successfully!"});
                    }
                    else if (req.body.expertise || req.body.interests) {
                        if (req.body.expertise) {
                            result.set("expertise", JSON.parse(req.body.expertise));
                        } if (req.body.interests) {
                            result.set("interests", JSON.parse(req.body.interests));
                        }
                        result.save();
                        res.status(200).json({status: "Info Uploaded Successfully!"});
                    }
                    else if (req.body.work_experiences && req.body.educations && req.body.projects) {
                        result.set("work_experiences", JSON.parse(req.body.work_experiences));
                        result.set("educations", JSON.parse(req.body.educations));
                        result.save();
                        res.status(200).json({status: "Info Uploaded Successfully!"});
                    }
                    else if (req.body.action && req.body.type) {
                        if (req.body.action == "delete") {
                            console.log("Delete");
                            if (req.body.type == "work_experience") {
                                var work_experiencesTemp = currentUser.attributes.work_experiences;
                                for (var i = 0; i < work_experiencesTemp.length; i++) {
                                    if (work_experiencesTemp[i].key = req.body.key) {
                                        delete work_experiencesTemp[i];
                                        work_experiencesTemp.splice(i, 1);
                                    }
                                    console.log(work_experiencesTemp);
                                }
                                currentUser.set("work_experiences", work_experiencesTemp);
                                res.status(200).json({status: "Deleted Successfully!"});
                            }
                            else if (req.body.type == "education") {
                                var educationsTemp = currentUser.attributes.educations;
                                for (var i = 0; i < educationsTemp.length; i++) {
                                    if (educationsTemp[i].key = req.body.key) {
                                        delete educationsTemp[i];
                                        educationsTemp.splice(i, 1);
                                    }
                                    console.log(educationsTemp);
                                }
                                currentUser.set("educations", educationsTemp);
                                res.status(200).json({status: "Deleted Successfully!"});
                            }
                            currentUser.save();
                        }
                        else if (req.body.action == "update") {
                            if (req.body.type == "work_experience") {
                                var work_experiencesTemp = currentUser.work_experiences;
                                for (var i = 0; i < work_experiencesTemp.length; i++) {
                                    if (work_experiencesTemp[i].key = req.body.key) {
                                        var changedWE = {
                                            key: req.body.key,
                                            title: req.body.title,
                                            company: req.body.company,
                                            description: req.body.description,
                                            start: req.body.start,
                                            end: req.body.end
                                        };
                                        work_experiencesTemp[i] = changedWE;
                                    }
                                }
                                result.set("work_experiences", work_experiencesTemp);
                                res.status(200).json({status: "Updated Successfully!"});
                            }
                            else if (req.body.type == "education") {
                                var educationsTemp = currentUser.educations;
                                for (var i = 0; i < educationsTemp.length; i++) {
                                    if (educationsTemp[i].key = req.body.key) {
                                        var changedWE = {
                                            key: req.body.key,
                                            title: req.body.title,
                                            company: req.body.company,
                                            description: req.body.description,
                                            start: req.body.start,
                                            end: req.body.end
                                        };
                                        educationsTemp[i] = changedWE;
                                    }
                                }
                                result.set("educations", educationsTemp);
                                res.status(200).json({status: "Updated Successfully!"});
                            }
                            result.save();
                        }
                    }
                }//end of success
            });//end of query
        }
    });

    app.get('/profile/:objectId/connect', is_auth, function (req, res, next) {
        var userId= req.params.objectId;
        var currentUser = req.user
        var Relationship = Parse.Object.extend("RelationshipUser");
        var relation = new Relationship();
        relation.set('userId1', { __type: "Pointer", className: "_User", objectId: currentUser.id });
        relation.set('userId0', { __type: "Pointer", className: "_User", objectId: userId });
        relation.set('verified', false);
        relation.save(null,{
            success:function(){
                res.json({success: "Requested Successfully"});
            },
            error:function(error){
                res.json({error:error});
            }
        });
    });

    app.get('/profile/:objectId/disconnect', is_auth, function (req, res, next) {
        var friendId= req.params.objectId;
        var currentUser = req.user;
        var query1 = new Parse.Query('RelationshipUser');
        query1.equalTo("userId1",{__type: "Pointer", className: "_User", objectId: currentUser.id});
        query1.equalTo("userId0",{__type: "Pointer", className: "_User", objectId: friendId});
        query1.equalTo('verified',true);
        var query2 = new Parse.Query('RelationshipUser');
        query2.equalTo("userId0",{__type: "Pointer", className: "_User", objectId: currentUser.id});
        query2.equalTo("userId1",{__type: "Pointer", className: "_User", objectId: friendId});
        query2.equalTo('verified',true);
        var mainQuery= Parse.Query.or(query1,query2);
        mainQuery.find({
            success: function(results) {
                Parse.Object.destroyAll(results).then(function(success) {
                    res.json({success: "Requested Successfully"});
                }, function(error) {
                    res.json({error:error});
                });
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.get('/friendrequest', is_auth, function(req,res,next){
        var currentUser= req.user;

            var query = new Parse.Query('RelationshipUser');
            query.equalTo("verified",false)
            query.include('userId1')
            query.equalTo("userId0",{__type: "Pointer", className: "_User", objectId: currentUser.id})
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
                                work_title: work_title
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
    });

    app.post('/friendrequest/', is_auth, function (req, res, next) {
        var person= req.body.person;
        var mode= req.body.mode;
        var friendusername= person.username;

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("username",friendusername);

        var query = new Parse.Query('RelationshipUser');
        query.equalTo("userId0",{__type: "Pointer", className: "_User", objectId: req.user.id})
        query.matchesQuery("userId1",innerQuery)
        query.equalTo('verified',false)
        query.first({
            success: function(result) {
                if(mode=="approve")
                {
                    result.set("verified",true);
                    result.save(null, {
                        success:function(){
                            var Relationship = Parse.Object.extend("RelationshipUser");
                            var relation = new Relationship();

                            relation.set('userId0',result.get("userId1"));
                            relation.set('userId1', {__type: "Pointer", className: "_User", objectId: req.user.id});
                            relation.set('verified', true);
                            relation.save(null,{
                                success:function(){
                                    res.json({scucess:"approved"});
                                },
                                error:function(error){
                                    res.json({error:error});
                                }
                            });

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

    app.get('/profile/:objectId/equipments_list', is_auth, function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryEquipment = new Parse.Query('Equipment');
        queryEquipment.matchesQuery('user',innerQuery);
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

    app.get('/profile/:objectId/projects_list', is_auth, function (req, res, next) {
        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var queryProject = new Parse.Query('Project');
        queryProject.matchesQuery('user',innerQuery);
        queryProject.find({
            success: function(results) {
                var projects = [];
                for (var i in results) {
                    var authors = ["N/A"];
                    var locations = ["N/A"];
                    var keywords = ["N/A"];
                    var objectId = results[i].id;
                    var title = results[i].get('title');
                    var description = results[i].get('description');
                    var image_URL = results[i].get('image_URL');
                    var start_date = "N/A";
                    var end_date = "N/A";
                    if (results[i].get('authors') !== undefined) { authors = results[i].get('authors'); }
                    if (results[i].get('locations') !== undefined) { locations = results[i].get('locations'); }
                    if (results[i].get('keywords') !== undefined) { keywords = results[i].get('keywords'); }
                    console.log(results[i].get('keywords'));
                    if (results[i].get('start_date') !== undefined) { start_date = results[i].get('start_date'); }
                    if (results[i].get('end_date') !== undefined) { end_date = results[i].get('end_date'); }
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

    app.get('/profile/:objectId/publications_list', is_auth, function (req, res, next) {
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
                    var description = results[i].get('description');
                    var authors = results[i].get('authors');
                    var publication_code = "N/A";
                    var type = "Other";

                    if (results[i].get('title')) { title = results[i].get('title'); }
                    if (results[i].get('type')) { type = results[i].get('type'); }
                    if (results[i].get('publication_code')) { publication_code = results[i].get('publication_code'); }

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

    app.get('/profile/:objectId/data_list', is_auth, function (req, res, next) {
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
                    var description = results[i].get('description');
                    var authors = results[i].get('collaborators');
                    var image_URL = results[i].get('image_URL');
                    var type = "Other";

                    if (results[i].get('title')) { title = results[i].get('title'); }
                    if (results[i].get('type')) { type = results[i].get('type'); }
                    if (results[i].get('publication_code')) { publication_code = results[i].get('publication_code'); }

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

    app.get('/profile/:objectId/models_list', is_auth, function (req, res, next) {
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
                    var description = results[i].get('abstract');
                    var authors = results[i].get('collaborators');
                    var image_URL = results[i].get('image_URL');
                    var type = "Other";

                    if (results[i].title) { title = results[i].get('title'); }
                    if (results[i].type) { type = results[i].get('type'); }

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


}
