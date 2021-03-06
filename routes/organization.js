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
var is_auth = require('../utils/helpers').is_auth;

module.exports=function(app,Parse,io) {

    app.post('/allorganizations', function(req, res, next) {
        var currentUser = req.user;
        var str = req.body.substr;
        var lcStr = str.toLowerCase();
        var qLimit;
        if (req.body.limit != undefined) {
            qLimit = parseInt(req.body.limit);
        } else {
            qLimit = 1000;
        }

        var query0 = new Parse.Query('Organization');
        query0.contains("displayName", str);

        var query1 = new Parse.Query('Organization');
        query1.contains("search", lcStr);

        var query = Parse.Query.or(query0, query1);
        query.limit(qLimit);

        query.find({
            success: function(items) {
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                // console.log("RESULTS ARE: ");
                // console.log(results);
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
    app.get('/organization/:name', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Organization');
        query.equalTo("name", req.params.name);
        query.first({
            success: function(result) {
                if(result)
                res.render('organization', {
                    title: 'Organization',
                    path: '/organization/' + result.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    objectId: result.id,
                    name: result.get('name'),
                    displayName: result.get('displayName'),
                    about: result.get('about'),
                    location: result.get('location'),
                    country: result.get('country'),
                    prov: result.get('prov'),
                    city: result.get('city'),
                    street: result.get('street'),
                    postalcode: result.get('postalcode'),
                    tel: result.get('tel'),
                    fax: result.get('fax'),
                    email: result.get('email'),
                    website: result.get('website'),
                    picture: result.get('picture'),
                    carousel_1_img: result.get('carousel_1_img'),
                    carousel_1_head: result.get('carousel_1_head'),
                    carousel_1_body: result.get('carousel_1_body'),
                    carousel_2_img: result.get('carousel_2_img'),
                    carousel_2_head: result.get('carousel_2_head'),
                    carousel_2_body: result.get('carousel_2_body'),
                    carousel_3_img: result.get('carousel_3_img'),
                    carousel_3_head: result.get('carousel_3_head'),
                    carousel_3_body: result.get('carousel_3_body'),
                    organization_imgURL: result.get('picture').url()
                });
                else
                res.render('notfound',{isOrg:true,isUser:false});
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
        var people =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: req.params.objectId})
        query.include('userId');
        query.each(function(result) {
            var title= result.get('title');
            var verified= result.get('verified');
            var user= result.get('userId');
            console.log(user);
            var username= user.get('username');
            var fullname=user.get('fullname');
            var about= user.get('about');
            var isAdmin = result.get('isAdmin');
            //var company= "";
            //var work_title= "";
            var userImgUrl=user.get('picture').url();
            var work_experience= [];
            if(verified) {
                var person = {
                    id: user.id,
                    username:username,
                    title: title,
                    fullname: fullname,
                    about: about,
                    userImgUrl: userImgUrl,
                    isAdmin:isAdmin
                };
                people.push(person);
            }
        }).then(function(){
            console.log("PEOPLE: ");
            console.log(JSON.stringify(people));
            var filtered_people=  _.groupBy(people,'title');
            res.json(filtered_people);
        }, function(err) {
            console.log("ERROR THROWN: ");
            console.log(err);
        });
    });
    //promote or demote someone admin
    app.post('/organization/:objectId/admin',is_auth,function(req,res,next){
        var userId= req.body.userId;

        var orgId= req.params.objectId;
        var adminStatus = (req.body.makeAdmin == "true") ? true:false;
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",orgId);
        var innerQuery2 = new Parse.Query(Parse.User);
        innerQuery2.equalTo("objectId",userId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.matchesQuery("userId",innerQuery2);
        query.first({
            success: function(result) {
                    result.set("isAdmin",adminStatus);
                    result.save(null, {
                        success:function(){
                            res.json("Accepted!");
                        },
                        error:function(error){
                            res.json({error:error});
                        }
                    });
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
                    var fullname="";
                    var company= "";
                    var work_title= "";
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
        query.matchesQuery("orgId0",innerQuery)
        query.equalTo('verified',false)
        query.include('orgId1');
        query.find({
            success: function(result) {
                var organizations =[];
                for(var i in result) {
                    var name= result[i].attributes.name;
                    var verified= result[i].attributes.verified;
                    var organization= result[i].attributes.orgId1.attributes;
                    var orgId= result[i].attributes.orgId1.id;
                    var name= organization.name;
                    var location= organization.location;
                    var profile_imgURL= "/images/organization.png";

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
        innerQuery.equalTo("name",orgId);
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

    app.post('/organization/:objectId/pending_orgpeople_action/', function (req, res, next) {
        var orgId = req.params.objectId;
        var mode = req.body.mode;
        var userId = req.user.id;
        var query = new Parse.Query("Relationship");
        query.equalTo("verified", false);
        query.equalTo("orgRequest", true);
        query.equalTo("userId", {__type: "Pointer", className: "_User", objectId: userId});
        query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: orgId});
        query.first({
            success: function (result) {
                if (result === undefined) {
                    console.log("No result for pending org to people request");
                    res.json("No entry in Relationship db");
                } else {
                    if (mode === "accept") {
                        result.set("verified", true);
                        result.save(null, {
                            success: function() {
                                console.log("Person accepted org invitation");
                                res.json("Successfully accepted");
                            },
                            error: function(err) {
                                console.log(err);
                                res.json({error: err});
                            }
                        })
                    } else if (mode === "reject") {
                        result.destroy({
                            success: function(model, response) {
                                console.log("Org to person entry deleted - person rejected invitation");
                                res.json("Successfully rejected");
                            },  
                            error: function(model, response) {
                                console.log("Error while destroying entry: ", response);
                                res.json({error: response});
                            }   
                        });
                    }
                }
            },
            error: function (obj, err) {
                console.log(err.message);
                res.json({error: err});
            }
        });
    });

    app.post('/organization/:objectId/pending_organization_action/', function (req, res, next) {
        var organizationId = req.body.organizationId;
        var orgId = req.params.objectId;
        var mode = req.body.mode;
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("name",orgId);
        var innerQuery2 = new Parse.Query("Organization");
        innerQuery2.equalTo("name",organizationId);
        var query = new Parse.Query('RelationshipOrg');
        query.matchesQuery("orgId0",innerQuery);
        query.matchesQuery("orgId1",innerQuery2);
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

    app.post('/organization/:objectId/update',function(req,res,next) {
        query = new Parse.Query("Organization");
        query.get(req.params.objectId).then(function (result) {
            result.set("name", req.body.name);
            result.set("about", req.body.about);
            result.set("street", req.body.street);
            result.set("city", req.body.city);
            result.set("prov", req.body.prov);
            result.set("country", req.body.country);
            result.set("postalcode", req.body.postalcode);
            result.set("tel", req.body.tel);
            result.set("fax", req.body.fax);
            result.set("email", req.body.email);
            if (req.body.website != "" && !req.body.website.startsWith("http://"))
                result.set("website", "http://"+req.body.website);
            else
                result.set("website", req.body.website);
            var location= '';
            if (req.body.city ) {
                location = req.body.city;
            } if (req.body.prov) {
                if(location!='')
                    location = location +', ' +req.body.prov;
                else
                    location = req.body.prov;
            } if (req.body.country) {
                if(location!='')
                    location = location +', ' +req.body.country;
                else
                    location = req.body.country;
            }
            result.set('location', location);
            result.set("carousel_1_head", req.body.carousel_1_head);
            result.set("carousel_1_body", req.body.carousel_1_body);
            result.set("carousel_2_head", req.body.carousel_2_head);
            result.set("carousel_2_body", req.body.carousel_2_body);
            result.set("carousel_3_head", req.body.carousel_3_head);
            result.set("carousel_3_body", req.body.carousel_3_body);
            result.save();
            res.status(200).json({status: "Updated Successfully!"});
        });
    });

    app.post('/organization/:objectId/updateCarouselPicture_1', function(req,res,next){
        if(req.body.picture && req.body.pictureType){
            console.log(1);
            query = new Parse.Query("Organization");
            query.get(req.params.objectId).then(function (result) {
                var params = awsUtils.encodeFile("", req.params.objectId, req.body.picture, req.body.pictureType, "org_carousel1");
                var bucket = new aws.S3({params: {Bucket: 'syncholar'}});

                bucket.putObject(params, function (err, response) {
                    if (err) {
                        console.log("S3 Upload Error:", err);
                    }
                    else {
                        result.set("carousel_1_img", awsLink + params.Key);
                        result.save();
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    }
                });
            });
        }
        else{
            res.status(200).json({status: "No picture suplied!"})
        }
    });
    app.post('/organization/:objectId/updateCarouselPicture_2', function(req,res,next){
        if(req.body.picture && req.body.pictureType){
            console.log(2);
            query = new Parse.Query("Organization");
            query.get(req.params.objectId).then(function (result) {
                var params = awsUtils.encodeFile("", req.params.objectId, req.body.picture, req.body.pictureType, "org_carousel2");
                var bucket = new aws.S3({params: {Bucket: 'syncholar'}});

                bucket.putObject(params, function (err, response) {
                    if (err) {
                        console.log("S3 Upload Error:", err);
                    }
                    else {
                        result.set("carousel_2_img", awsLink + params.Key);

                        result.save();
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    }
                });
            });
        }
        else{
            res.status(200).json({status: "No picture suplied!"})
        }
    });
    app.post('/organization/:objectId/updateCarouselPicture_3', function(req,res,next){
        if(req.body.picture && req.body.pictureType){
            console.log(3);
            query = new Parse.Query("Organization");
            query.get(req.params.objectId).then(function (result) {
                var params = awsUtils.encodeFile("", req.params.objectId, req.body.picture, req.body.pictureType, "org_carousel3");
                var bucket = new aws.S3({params: {Bucket: 'syncholar'}});

                bucket.putObject(params, function (err, response) {
                    if (err) {
                        console.log("S3 Upload Error:", err);
                    }
                    else {
                        result.set("carousel_3_img", awsLink + params.Key);

                        result.save();
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    }
                });
            });
        }
        else{
            res.status(200).json({status: "No picture suplied!"})
        }
    });
    app.post('/organization/:objectId/updatePicture', function(req,res,next){
        var query = new Parse.Query("Organization");
        query.get(req.params.objectId).then(function (result) {
            if (req.body.picture != null && result != undefined) {
                var pictureName = "org_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                pictureFile.save().then(function () {
                    result.set('picture', pictureFile)
                    result.save().then(function () {
                        res.status(200).json({status: "Picture Uploaded Successfully!"});
                    });
                });
            }
            else {
                res.status(500).json({status: "Picture Upload Failed!"});
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
        var query = new Parse.Query("RelationshipOrg");
        query.equalTo('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId});
        query.include('orgId1');
        query.each(function(results) {
            var verified = results.attributes.verified;
            var connected_orgs = results.attributes.orgId1.attributes;
            var orgId = results.attributes.orgId1.id;
            var name = connected_orgs.name;
            var displayName = connected_orgs.displayName;
            var location = connected_orgs.location;
            var orgImgUrl = connected_orgs.picture.url()
            //only orgs that are verified
            if (verified) {
                var org = {
                    orgId: orgId,
                    name: name,
                    displayName: displayName,
                    location: location,
                    orgImgUrl: orgImgUrl
                };
                orgs.push(org);
            }
        }).then(function(results){
            var query1 = new Parse.Query("RelationshipOrg");
            query1.equalTo('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId});
            query1.include('orgId0');
            query1.each(function(results) {
                var verified = results.attributes.verified;
                var connected_orgs = results.attributes.orgId0.attributes;
                var orgId = results.attributes.orgId0.id;
                var name = connected_orgs.name;
                var displayName = connected_orgs.displayName;
                var location = connected_orgs.location;
                var orgImgUrl = connected_orgs.picture.url();
                //only orgs that are verified
                if (verified) {
                    var org = {
                        orgId: orgId,
                        name: name,
                        displayName: displayName,
                        location: location,
                        orgImgUrl: orgImgUrl
                    };
                    orgs.push(org);
                }
            }).then(function(results){
                console.log(orgs);
                res.json(orgs);
            })
        })
    });

    app.get('/organization/:objectId/publications', function (req, res, next) {
        var pubs =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: req.params.objectId})
        query.each(function(relationships) {
            var promises = [];
            var queryBooks = new Parse.Query('Pub_Book');
            queryBooks.equalTo("user", relationships.get("userId"));
            promises.push(queryBooks.each(function (book){
                //var book = JSON.stringify(books);
                pubs.push({
                    type: "book",
                    title: book.attributes.title,
                    keywords: book.attributes.keywords,
                    date: book.attributes.publication_date,
                    year: book.attributes.year,
                    contributors: book.attributes.contributors,
                    description: book.attributes.abstract,
                    id: book.id
                });
            }));
            var queryConference = new Parse.Query('Pub_Conference');
            queryConference.equalTo("user", relationships.get("userId"));
            promises.push(queryConference.each(function (conferences){
                pubs.push({
                    type: "conference",
                    title: conferences.attributes.title,
                    keywords: conferences.attributes.keywords,
                    date: conferences.attributes.publication_date,
                    year: conferences.attributes.year,
                    contributors: conferences.attributes.contributors,
                    description: conferences.attributes.abstract,
                    id: conferences.id
                });
            }));
            var queryJournal = new Parse.Query('Pub_Journal_Article');
            queryJournal.equalTo("user", relationships.get("userId"));
            promises.push(queryJournal.each(function (journals){
                pubs.push({
                    type: "journal",
                    title: journals.attributes.title,
                    keywords: journals.attributes.keywords,
                    date: journals.attributes.publication_date,
                    year: journals.attributes.year,
                    contributors: journals.attributes.contributors,
                    description: journals.attributes.abstract,
                    id: journals.id
                });
            }));
            var queryPatent = new Parse.Query('Pub_Patent');
            queryPatent.equalTo("user", relationships.get("userId"));
            promises.push(queryPatent.each(function (patent){
                pubs.push({
                    type: "patent",
                    title: patent.attributes.title,
                    keywords: patent.attributes.keywords,
                    date: patent.attributes.publication_date,
                    year: patent.attributes.year,
                    contributors: patent.attributes.contributors,
                    description: patent.attributes.abstract,
                    id: patent.id
                });
            }));
            var queryReport = new Parse.Query('Pub_Report');
            queryReport.equalTo("user", relationships.get("userId"));
            promises.push(queryReport.each(function (report){
                pubs.push({
                    type: "report",
                    title: report.attributes.title,
                    keywords: report.attributes.keywords,
                    date: report.attributes.publication_date,
                    year: report.attributes.year,
                    contributors: report.attributes.contributors,
                    description: report.attributes.abstract,
                    id: report.id
                });
            }));
            var queryThesis = new Parse.Query('Pub_Thesis');
            queryThesis.equalTo("user", relationships.get("userId"));
            promises.push(queryThesis.each(function (thesis){
                pubs.push({
                    type: "thesis",
                    title: thesis.attributes.title,
                    keywords: thesis.attributes.keywords,
                    date: thesis.attributes.publication_date,
                    year: thesis.attributes.year,
                    contributors: thesis.attributes.contributors,
                    description: thesis.attributes.abstract,
                    id: thesis.id
                });
            }));
            var queryUnpublished = new Parse.Query('Pub_Unpublished');
            queryUnpublished.equalTo("user", relationships.get("userId"));
            promises.push(queryUnpublished.each(function (unpublished){
                pubs.push({
                    type: "unpublished",
                    title: unpublished.attributes.title,
                    keywords: unpublished.attributes.keywords,
                    date: unpublished.attributes.publication_date,
                    year: unpublished.attributes.year,
                    contributors: unpublished.attributes.contributors,
                    description: unpublished.attributes.abstract,
                    id: unpublished.id
                });
            }));
            return Parse.Promise.when(promises);
        }).then(function(){
            var filteredPubs= _.groupBy(pubs,'type');
            console.log(filteredPubs);
            res.json(filteredPubs);
        }, function(error){
            console.log('Failed to retrive publications, with error code: ' + error.message);
            res.status(500).json({status: "Publication retrieval failed. " + error.message});
        });
    });

    app.get('/organization/:objectId/datas', function (req, res, next) {
        var datas =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.include("userId");
        query.each(function(relationship) {
            var promise = Parse.Promise.as();
            promise = promise.then(function() {
                var dataQuery = new Parse.Query("Data");
                dataQuery.equalTo("user", relationship.get('userId'));
                return dataQuery.each(function (data) {
                    datas.push(data);
                });
            });
            return promise;
        }).then(function(){
            //var filtered_models=  _.groupBy(models,'type');
            console.log(datas);
            res.json(datas);
        }, function(error) {
            console.log(error);
        });
    });

    app.get('/organization/:objectId/models', function (req, res, next) {
        var models =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.include("userId");
        query.each(function(relationship) {
            var promise = Parse.Promise.as();
            promise = promise.then(function() {
                var modelsQuery = new Parse.Query("Model");
                modelsQuery.equalTo("user", relationship.get('userId'));
                return modelsQuery.each(function (model) {
                    models.push(model);
                });
            });
            return promise;
        }).then(function(){
            //var filtered_models=  _.groupBy(models,'type');
            console.log(models);
            res.json(models);
        }, function(error) {
            console.log(error);
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
                if (req.query.getCount === 'true') {
                    res.json(admins.length);
                } else {
                    res.json(admins);
                }
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
                {currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl, isCreate: true});
        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });

    app.post('/create/organization', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var dName = req.body.name;
        var orgName = req.body.name.toLowerCase().replace(/'/g, "_").replace(/ /g, "_");
        // check if name already exists in db
        var Organization = Parse.Object.extend("Organization");
        var maxIndexSoFar = -1;
        var query = new Parse.Query(Organization);
        query.startsWith("displayName", req.body.name.toLowerCase());
        query.each(function(result) {
            var str = result.get("name");
            var strArr = str.split(".");
            if (strArr.length == 0 || strArr[1] == undefined) {
                if (str == orgName) {
                    orgName += ".0";
                }
                return;
            }
            var index = parseInt(strArr[1]);
            if (maxIndexSoFar < index) {
                maxIndexSoFar = index;
            }
        }).then(function() {
            if (maxIndexSoFar == -1) {
                // no match in db, all good - keeping this just in case we need to hand such a case (e.g if we dont want to include a seq num for the very first organization)
            } else {
                // update orgName to use next index
                var newIndex = maxIndexSoFar + 1;
                orgName = req.body.name.toLowerCase() + "." + newIndex;
            }
        }).then(function() {
            //var Organization = Parse.Object.extend("Organization");
            var org = new Organization();
            org.set('name', orgName);
            org.set('displayName', dName);
            org.set('about', req.body.description ? req.body.description : 'About Organization');
            org.set('country', req.body.country ? req.body.country : '');
            org.set('prov', req.body.prov ? req.body.prov : '');
            org.set('city', req.body.city ? req.body.city : '');
            org.set('street', req.body.street ? req.body.street : '');
            org.set('postalcode', req.body.postalcode ? req.body.postalcode : '');
            org.set('website', req.body.website ? req.body.website : '');
            org.set('carousel_1_img','/images/carousel.png');
            org.set('carousel_1_head',req.body.carousel_1_head ? req.body.carousel_1_head : '');
            org.set('carousel_1_body',req.body.carousel_1_body ? req.body.carousel_1_body : '');
            org.set('carousel_2_img','/images/carousel.png');
            org.set('carousel_2_head',req.body.carousel_2_head ? req.body.carousel_2_head : '');
            org.set('carousel_2_body',req.body.carousel_2_body ? req.body.carousel_2_body : '');
            org.set('carousel_3_img','/images/carousel.png');
            org.set('carousel_3_head',req.body.carousel_3_head ? req.body.carousel_3_head : '');
            org.set('carousel_3_body',req.body.carousel_3_body ? req.body.carousel_3_body : '');
            var location= '';
            if (req.body.city ) {
                location = req.body.city;
            } if (req.body.prov) {
                if(location!='')
                    location = location +', ' +req.body.prov;
                else
                    location = req.body.prov;
            } if (req.body.country) {
                if(location!='')
                    location = location +', ' +req.body.country;
                else
                    location = req.body.country;
            }
            org.set('location', location);
            var promises = [];
            if (req.body.picture != null) {
                var pictureName = "org_picture." + req.body.pictureType;
                var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var pictureFile = new Parse.File(pictureName, {base64: pictureBuff});
                promises.push(pictureFile.save().then(function () {
                    org.set('picture', pictureFile)
                }));
            }
            return Parse.Promise.when(promises).then(function () {
                org.save(null).then(function (response) {
                    objectId = response.id;
                    // create new Relationship object between organization and admin
                    console.log('Object ID retrieved/path name updated successfully');
                    var Relationship = Parse.Object.extend("Relationship");
                    var relation = new Relationship();
                    relation.set('userId', {__type: "Pointer", className: "_User", objectId: currentUser.id});
                    relation.set('orgId', {__type: "Pointer", className: "Organization", objectId: objectId});
                    relation.set('isAdmin', true);
                    relation.set('verified', true);
                    relation.set('title', 'Members');
                    relation.save(null);
                }).then(function (response) {
                    res.status(200).json({status: "OK", org_url: orgName});
                });
            });
        }, function (error) {
            console.log('Failed to create new organization, with error code: ' + error.message);
            return res.status(500).json({status: "Creating organization failed. " + error.message});
        });
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

    //invite other users to an org
    app.get('/organization/:objectId/invite/:userId',function(req,res,next){
        var orgId= req.params.objectId;

        var orgquery = new Parse.Query("Organization");
        orgquery.equalTo("objectId",orgId);
        orgquery.first(function(org) {
            if(org!=undefined)
            {
                var userquery = new Parse.Query(Parse.User);
                userquery.equalTo("objectId",req.params.userId);
                userquery.first(function(user) {
                    if(user!=undefined)
                    {
                        var Relationship = Parse.Object.extend("Relationship");
                        var relation = new Relationship();
                        relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: orgId });
                        relation.set('userId', { __type: "Pointer", className: "_User", objectId: req.params.userId });
                        relation.set('isAdmin', false);
                        relation.set('verified', false);
                        relation.set('orgRequest', true);
                        relation.set('title', 'Members');
                        relation.save(null,{
                            success:function(result){
                                var invite_notification = {
                                    id: "org_"+orgId+"_"+req.params.userId+"_inv",
                                    type:"org2pplrequest",
                                    from: {
                                        userId:req.user.id,
                                        username: req.user.username,
                                        name:req.user.fullname,
                                        userImgUrl: req.user.imgUrl,
                                    },
                                    msg: "has invited you to join",
                                    extra: {
                                        id:org.get("name"),
                                        name: org.get("displayName"),
                                        imgUrl: org.get("profile_imgURL")
                                    }
                                };
                                io.to(user.id).emit('org2pplrequest',{data:invite_notification});

                                res.json({success: "invited successfully"});
                            },
                            error:function(error){
                                res.json({error:error});
                            }
                        });
                    }
                    else
                        res.json({error:"invalid user"})

                });
            }
            else
                res.json({error:"invalid org"})

        });



    });
    //accept or deny the invite to join an org
    app.post('/organization/:objectId/invite',is_auth,function(req,res,next){

        var orgId = req.params.objectId;
        var mode = req.body.mode;

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("name",orgId);
        var innerQuery2 = new Parse.Query(Parse.User);
        innerQuery2.equalTo("objectId",req.user.id);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery);
        query.matchesQuery("userId",innerQuery2);
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
    app.get('/organization/:objectId/join', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = req.user;

            var Relationship = Parse.Object.extend("Relationship");
            var relation = new Relationship();

            relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: orgId });
            relation.set('userId', { __type: "Pointer", className: "_User", objectId: currentUser.id });
            relation.set('isAdmin', false);
            relation.set('verified', false);
            relation.set('orgRequest', false);
            relation.set('title', 'Members');
            relation.save(null,{
                success:function(){
                    notifyadmins(req.params.objectId,currentUser)

                    res.json({success: "Joined Successfully"});
                },
                error:function(error){
                    res.json({error:error});
                }
            });

    });
    app.get('/organization/:objectId/delete', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var currentUser = req.user;
        if(currentUser) {
            var query = new Parse.Query("Relationship");
            query.equalTo("userId", {__type: "Pointer", className: "_User", objectId: currentUser.id});
            query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: orgId});
            query.equalTo('verified', true);
            query.equalTo('isAdmin', true);
            query.first().then(function (result) {
                if (result==undefined) {
                    console.log("Cant find user relationship");
                    return Parse.Promise.error("Organization delete failed");
                }
                else {
                    console.log("Finding organization to delete");
                    var deleteOrg = new Parse.Query("Organization");
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
            var query = new Parse.Query('Relationship');
            query.equalTo("userId",{__type: "Pointer", className: "_User", objectId: currentUser.id} );
            query.equalTo("orgId",{__type: "Pointer", className: "Organization", objectId: orgId});
            query.equalTo('verified',true);
            query.first(function(result) {
                if(result!=undefined)
                {
                    result.destroy();
                };
            }).then(function(){
                res.status(200).json({status: "Successfully left organization!"});
            }, function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            });

    });
    app.post('/organization/:objectId/kick', is_auth, function (req, res, next) {
        var orgId= req.params.objectId;
        var userId = req.body.userId;
        if(userId) {
            var query = new Parse.Query('Relationship');
            query.equalTo("userId",{__type: "Pointer", className: "_User", objectId: userId} );
            query.equalTo("orgId",{__type: "Pointer", className: "Organization", objectId: orgId});
            query.equalTo('verified',true);
            query.first(function(result) {
                if(result!=undefined)
                    result.destroy();

            }).then(function(){
                res.status(200).json({status: "Successfully left organization!"});
            }, function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            });
        }
    });
    app.post('/organization/:objectId/connect', is_auth, function (req, res, next) {
        var createConnection = Parse.Object.extend("RelationshipOrg");
        var orgId0= req.body.orgId;
        var orgId1= req.params.objectId;
        if(orgId0==orgId1){
            res.status(200).json({status: "Organization should not have itself as a connection!"});
            return;
        }
        //check the connection one way
        var query = new Parse.Query("RelationshipOrg");
        query.equalTo('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId0});
        query.equalTo('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId1});
        //check the connection other way
        var query1 = new Parse.Query("RelationshipOrg");
        query1.equalTo('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId0});
        query1.equalTo('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId1});
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

                notifyOrgAdmins(orgId0,orgId1);
                return connection.save(null);
            }
            return Parse.Promise.error({message: "This connection already exists."});
        }).then(function(response) {
            console.log("Connection request created successfully.");
            res.status(200).json({status: "OK"});
        }, function(error) {
            console.log("Creating connection failed. " + error.message)
            res.status(500).json({status: "Creating connection failed. " + error.message});
        });
    });

    app.get('/organization/:objectId/equipments_list', is_auth, function (req, res, next) {
        var equipments =[];
        var query = new Parse.Query('Equipment');
        query.equalTo("organization", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.each(function(equipment) {
            equipments.push(equipment);
        }).then(function(){
            //var filtered_models=  _.groupBy(models,'type');
            console.log(equipments);
            res.json(equipments);
        }, function(error) {
            console.log(error);
        });
    });

    app.get('/organization/:objectId/projects_list', is_auth, function (req, res, next) {
        var projects = [];
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: req.params.objectId})
        query.each(function(relationships) {
            var queryProjects = new Parse.Query('Project');
            queryProjects.equalTo("user", relationships.get("userId"));
            queryProjects.each(function (project) {
                projects.push(project);
            }).then(function () {
                console.log(projects);
                res.json(projects);
            }, function (error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            });
        });
    });

    app.get('/organization/:objectId/isAdmin', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var adminQuery = new Parse.Query("Relationship");
        adminQuery.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        adminQuery.equalTo("userId", { __type: "Pointer", className: "_User", objectId: currentUser.id});
        adminQuery.first({
            success: function(result) {
                if (result==undefined){
                    var isAdmin=false;
                }
                else {
                    var isAdmin = result.get('isAdmin');
                }
                res.json({isAdmin: isAdmin});
            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.get('/orgrequest', is_auth, function(req,res,next){

        var currentUser= req.user;
        var requests =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("isAdmin",true)
        query.include('orgId')
        query.equalTo("userId",{__type: "Pointer", className: "_User", objectId: currentUser.id})
        query.each(function(result) {
            var promise = Parse.Promise.as();

            promise = promise.then(function() {
            var query = new Parse.Query('Relationship');
            query.equalTo("verified",false)
            query.equalTo("orgRequest",false)
            query.include('userId')
            query.equalTo("orgId",{__type: "Pointer", className: "Organization", objectId: result.get("orgId").id});
            return query.each(function(r) {
                var org_notification = {
                    id: "org_"+result.get("orgId").id+"_"+r.get("userId").id+"_inv",
                    type:"orgrequest",
                    from: {
                        userId:r.get("userId").id,
                        username: r.get("userId").get("username"),
                        name: r.get("userId").get("fullname"),
                        userImgUrl: r.get("userId").get("picture").url(),
                    },
                    msg: "wants to join",
                    extra: {
                        id: result.get("orgId").get("name"),
                        name: result.get("orgId").get("displayName"),
                        imgUrl: result.get("orgId").get("profile_imgURL")
                    }
                };

                requests.push(org_notification);
            });
            });
            return promise;
        }).then(function(){
            res.json(requests);
        }, function(err) {
            console.log(err);
        });
    });
    app.get('/org2orgrequest', is_auth, function(req,res,next){

        var currentUser= req.user;
        var requests =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("isAdmin",true)
        query.include('orgId')
        query.equalTo("userId",{__type: "Pointer", className: "_User", objectId: currentUser.id})
        query.each(function(result) {

            var promise = Parse.Promise.as();

            promise = promise.then(function() {
                var query = new Parse.Query('RelationshipOrg');
                query.equalTo("verified", false)
                query.include('orgId1')
                query.include('orgId0')
                query.equalTo("orgId0", {
                    __type: "Pointer",
                    className: "Organization",
                    objectId: result.get("orgId").id
                });
                return query.each(function (r) {

                    var org_notification = {
                        id: "org_" + r.get("orgId1").id + "_" + r.get("orgId0").id + "_inv",
                        type: "org2orgrequest",
                        from: {
                            userId: r.get("orgId1").get("name"),
                            username: r.get("orgId1").get("name"),
                            name: r.get("orgId1").get("displayName"),
                            userImgUrl: r.get("orgId1").get("picture").url(),
                        },
                        msg: "wants to connect with ",
                        extra: {
                            id: r.get("orgId0").get("name"),
                            name: r.get("orgId0").get("displayName"),
                            imgUrl: r.get("orgId0").get("picture").url()
                        }
                    };
                    requests.push(org_notification);
                });
            });
            return promise;
        }).then(function(){
            res.json(requests);
        }, function(err) {
            console.log(err);
        });
    });

    app.get('/org2peoplerequest', function(req, res, next){
        var currentUser= req.user;
        var requests =[];
        var query = new Parse.Query('Relationship');
        query.equalTo("isAdmin", false);
        query.equalTo("orgRequest", true);
        query.equalTo("verified", false);
        query.include('orgId');
        query.include('userId');

        query.each(function(result){
            var usr = result.get("userId");
            var org = result.get("orgId");
            var notification = {
              id: org.id,
              type: "org2peoplerequest",
              from: {
                  orgId: org.id,
                  orgName: org.get("name"),
                  name: org.get("displayName"),
                  imgUrl: org.get("picture")
              },
              msg: "has invited you to join their organization"
            };
            requests.push(notification);
        }).then(function() {
            res.send(requests);
        }, function(err){
            console.log(err);
        })
    });

    //this is for the side bar that shows only 5 users of the org
    app.get("/organization/:objectId/partialMembers",function(req,res,next){
        var people =[];
        var counter=0;
        var query = new Parse.Query('Relationship');
        query.equalTo("orgId", {__type: "Pointer", className: "Organization", objectId: req.params.objectId})
        query.include('userId');
        query.each(function(result) {


            var verified= result.get('verified');
            var user= result.get('userId');
            var username= user.get('username');
            var fullname=user.get('fullname');
            var userImgUrl=user.get('picture').url();

            if(verified) {
                counter++;
                //we only need 4 members to show
                if(counter <5)
                {
                    var person = {
                        id: user.id,
                        username:username,
                        fullname: fullname,
                        userImgUrl: userImgUrl,
                    };
                    people.push(person);
                }
            }
        }).then(function(){
            res.json({total:counter,people:people});
        }, function(err) {
           res.json({err:err});
        });
    });
    // showing maximum 5 other networks
    app.get("/organization/:objectId/partialNetworks",function(req,res,next){
        var orgId = req.params.objectId;
        var orgs =[];
        var counter=0;
        var query = new Parse.Query("RelationshipOrg");
        query.equalTo('orgId0', { __type: "Pointer", className: "Organization", objectId: orgId});
        query.include('orgId1');
        query.each(function(results) {
            var verified = results.attributes.verified;
            var connected_orgs = results.attributes.orgId1.attributes;
            var orgId = results.attributes.orgId1.id;
            var name = connected_orgs.name;
            var displayName = connected_orgs.displayName;
            var orgImgUrl = connected_orgs.picture.url()
            //only orgs that are verified
            if (verified) {
                counter++;
                if(counter<5) {
                    var org = {
                        orgId: orgId,
                        name: name,
                        displayName: displayName,
                        orgImgUrl: orgImgUrl
                    };
                    orgs.push(org);
                }
            }
        }).then(function(results){
            var query1 = new Parse.Query("RelationshipOrg");
            query1.equalTo('orgId1', { __type: "Pointer", className: "Organization", objectId: orgId});
            query1.include('orgId0');
            query1.each(function(results) {
                var verified = results.attributes.verified;
                var connected_orgs = results.attributes.orgId0.attributes;
                var orgId = results.attributes.orgId0.id;
                var name = connected_orgs.name;
                var displayName = connected_orgs.displayName;
                var orgImgUrl = connected_orgs.picture.url();
                //only orgs that are verified
                if (verified) {
                    counter++;
                    if(counter<5)
                    {
                        var org = {
                            orgId: orgId,
                            name: name,
                            displayName: displayName,
                            orgImgUrl: orgImgUrl
                        };
                        orgs.push(org);
                    }
                }
            }).then(function(results){
                res.json({total:counter,orgs:orgs});
            })
        })
    });

    app.post('/organization/:objectId/events',is_auth,function(req,res,next){
        var Event = Parse.Object.extend("Event");
        var event = new Event();
        console.log(req.params.objectId);
        console.log(req.body);

        event.set("title", req.body.title);
        event.set("date", new Date(req.body.date));
        event.set("time", req.body.time);
        event.set("location", req.body.location);
        event.set("description", req.body.description);
        event.set("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});

        event.save(null, {
            success: function (obj) {
                console.log('event success!');
                res.status(200).json({status:"OK", query: obj});
            },
            error: function (error) {
                console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                res.status(500).json({error: error});
            }
        });
    });

    app.get("/organization/:objectId/events",function(req,res,next){
        var events = [],
            yesterday = moment().startOf('day').subtract(1, 'days').toDate(); // start of current day

        var query = new Parse.Query("Event");
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.ascending('date');

        if (req.query.upcoming === 'true') { // restricted query for homepage sidebar contents
            query.greaterThanOrEqualTo('date', yesterday); // only want to get upcoming events
            query.limit(4);
        }

        query.find().then(function(results) {
            console.log("retrieved events:", results.length);
            for (var i = 0; i < results.length; i++) {
                var object = results[i];
                var time = object.attributes.time;
                if (time != null) { // format time to 12 hour format
                    var timeFragments = time.split(':');
                    var formattedTime = moment().hour(timeFragments[0]).minute(timeFragments[1]).format("h:mm A");
                    time = formattedTime;
                }

                events.push({
                    title: object.attributes.title,
                    date: object.attributes.date,
                    time: time,
                    location: object.attributes.location,
                    description: object.attributes.description,
                });
            }
            return events;
        }).then(function(events) {
            console.log('sending shit over');
            res.json(events);
        }, function(error) {
            console.log('Failed to retrieve events, with error: ' + error);
            res.status(500).json({status: "Event retrieval failed. " + error.message});
        });
    });



    /*
     *     HELPER METHODS
     */
    function notifyadmins(orgId,user)
    {
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",orgId);
        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.equalTo("isAdmin",true)
        query.include('orgId')
        query.find({
            success: function(results) {

              if(results !=null)
              {
                  for(var i=0;i<results.length;i++)
                  {
                      var adminId= results[i].get("userId").id;
                      var org_notification = {
                          id: "org_"+results[i].get("orgId").id+"_"+user.id+"_inv",
                          type:"orgrequest",
                          from: {
                              userId:user.id,
                              username: user.username,
                              name:user.fullname,
                              userImgUrl: user.imgUrl,
                          },
                          msg: "wants to join ",
                          extra: {
                              id: results[i].get("orgId").get("name"),
                              name: results[i].get("orgId").get("displayName"),
                              imgUrl: results[i].get("orgId").get("profile_imgURL")
                          }
                      };
                      io.to(adminId).emit('orgrequest',{data:org_notification});
                  }
              }
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
    function notifyOrgAdmins(toOrg,fromOrg)
    {
        var q = new Parse.Query('Organization');
        q.equalTo("objectId",fromOrg)
        q.find({
            success: function (r) {
                if(r != null)
                {
                    var fromOrg = r[0];
                    var innerQuery = new Parse.Query("Organization");
                    innerQuery.equalTo("objectId", toOrg);
                    var query = new Parse.Query('Relationship');
                    query.matchesQuery("orgId", innerQuery)
                    query.equalTo("isAdmin", true)
                    query.include('orgId')
                    query.find({
                        success: function (results) {

                            if (results != null) {
                                for (var i = 0; i < results.length; i++) {
                                    var adminId = results[i].get("userId").id;
                                    var org_notification = {
                                        id: "org_" + results[i].get("orgId").id + "_" + fromOrg.id + "_inv",
                                        type: "org2orgrequest",
                                        from: {
                                            userId: fromOrg.id,
                                            username: fromOrg.get("name"),
                                            name: fromOrg.get("displayName"),
                                            userImgUrl: fromOrg.get("picture").url(),
                                        },
                                        msg: "wants to join ",
                                        extra: {
                                            id: results[i].get("orgId").get("name"),
                                            name: results[i].get("orgId").get("displayName"),
                                            imgUrl: results[i].get("orgId").get("profile_imgURL")
                                        }
                                    };
                                    io.to(adminId).emit('org2orgrequest', {data: org_notification});
                                }
                            }
                        },
                        error: function (error) {
                            console.log(error);
                        }
                    });
                }

            },
            error: function (error) {
                console.log(error);
            }});
    }

};