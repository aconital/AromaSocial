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

    /*******************************************
     *
     * NEWS FEED
     *
     ********************************************/
    app.get('/newsfeeddata', is_auth,function (req, res, next) {
        var NewsFeed = Parse.Object.extend("NewsFeed");
        // pub query
        var query = new Parse.Query(NewsFeed);
        query.include("pubBookId");
        query.include("pubReportId");
        query.include("pubConferenceId");
        query.include("pubJournalId");
        query.include("pubThesisId");
        query.include("pubUnpublishedId");
        query.include("pubPatentId");
        query.include("equipmentId");
        query.include("projectId");
        query.include("modId");
        query.include("datId");
        query.include('from');
        query.descending("createdAt");
        //query.limit(20);
        query.find({
            success: function(results) {
                console.log("Successfully retrieved " + results.length + " feed.");
                // Do something with the returned Parse.Object values
                var feeds=[];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    var username = "N/A";
                    var fullname ="";
                    var userImg = "";
                    if(object.attributes.from!=null) {
                        username = object.attributes.from.attributes.username;
                        fullname = object.attributes.from.attributes.fullname;
                        userImg = object.attributes.from.attributes.picture.url();
                    }
                    var  type=object.attributes.type;
                    var  date=object.createdAt;
                    if (type == "equipment") {
                        if(object.attributes.equipmentId!=null && object.attributes.equipmentId.attributes !=null) {
                            var equip = object.get("equipmentId");
                            var objectId = equip.id;
                            var title = equip.get("title");
                            // var imgUrl = equip.get("image_URL");
                            var picture = equip.get("picture").url();
                            //var file = equip.get("file").url();
                            var type = "equipment";
                            var filePath = equip.get("file_path");
                            var creationDate = equip.get("createdAt");
                            var updateDate = equip.get("updatedAt");
                            var description = equip.get("description");
                            var keywords = equip.get("keywords");
                            var instructions = equip.get("instructions");
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                date: creationDate,
                                description: description,
                                type:type,
                                keywords:keywords,
                                title: title,
                                picture: picture
                            });
                        }
                    }
                    else if (type == "project") {
                        if(object.attributes.projectId!=null && object.attributes.projectId.attributes !=null) {
                            var proj = object.get("projectId");
                            var objectId = proj.id;
                            var title = proj.get("title");
                            //var imgUrl = proj.get("image_URL");
                            var picture = proj.get("picture").url();
                            //var file = proj.get("file").url();
                            var type = "project";
                            var filePath = proj.get("file_path");
                            var creationDate = proj.get("createdAt");
                            var startDate = proj.get("start_date");
                            var endDate = proj.get("end_date");
                            var updateDate = proj.get("updatedAt");
                            var description = proj.get("description");
                            var url = proj.get("URL");
                            var keywords = proj.get("keywords");
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                date: creationDate,
                                description: description,
                                url: url,
                                type:type,
                                keywords:keywords,
                                title: title,
                                picture: picture
                            });
                        }
                    }
                    else if(type =="pub_book")
                    { if(object.attributes.pubBookId!=null && object.attributes.pubBookId.attributes !=null)
                    {
                        var objectId = object.get("pubBookId").id;
                        var publication_date = object.get("pubBookId").get("publication_date") != null? object.get("pubBookId").get("publication_date"):"";
                        var abstract = object.get("pubBookId").get("abstract") != null? object.get("pubBookId").get("abstract"):"";
                        var author = object.get("pubBookId").get("author") != null? object.get("pubBookId").get("author"):"";
                        var keywords = object.get("pubBookId").get("keywords") != null? object.get("pubBookId").get("keywords"):[];
                        var filename = object.get("pubBookId").get("filename") != null? object.get("pubBookId").get("filename"):"";
                        var chapter = object.get("pubBookId").get("chapter") != null? object.get("pubBookId").get("chapter"):"";
                        var url = object.get("pubBookId").get("url") != null? object.get("pubBookId").get("url"):"#";
                        var page = object.get("pubBookId").get("page") != null? object.get("pubBookId").get("page"):"";
                        var isbn = object.get("pubBookId").get("isbn") != null? object.get("pubBookId").get("isbn"):"";
                        var title = object.get("pubBookId").get("title") != null? object.get("pubBookId").get("title"):"";
                        var contributors = object.get("pubBookId").get("contributors") != null? object.get("pubBookId").get("contributors"):[];
                        var publisher = object.get("pubBookId").get("publisher") != null? object.get("pubBookId").get("publisher"):"";
                        var doi = object.get("pubBookId").get("doi") != null? object.get("pubBookId").get("doi"):"";
                        var edition = object.get("pubBookId").get("edition") != null? object.get("pubBookId").get("edition"):"";
                        var type = "book";
                        feeds.push({
                            objId: objectId,
                            fullname: fullname,
                            username: username,
                            userImg: userImg,
                            publication_date:publication_date,
                            description:abstract,
                            author: author,
                            chapter: chapter,
                            filename:filename,
                            url: url,
                            type:type,
                            page: page,
                            keywords:keywords,
                            isbn: isbn,
                            doi:doi,
                            title: title,
                            edition: edition
                        });
                    }
                    }
                    else if(type == "pub_conference")
                    {   if(object.attributes.pubConferenceId!=null && object.attributes.pubConferenceId.attributes !=null)
                    {   var objectId = object.get("pubConferenceId").id;
                        var publication_date = object.get("pubConferenceId").get("publication_date") != null? object.get("pubConferenceId").get("publication_date"):"";
                        var abstract = object.get("pubConferenceId").get("abstract") != null? object.get("pubConferenceId").get("abstract"):"";
                        var filename = object.get("pubConferenceId").get("filename") != null? object.get("pubConferenceId").get("filename"):"";
                        var keywords = object.get("pubConferenceId").get("keywords") != null? object.get("pubConferenceId").get("keywords"):[];
                        var collaborators = object.get("pubConferenceId").get("collaborators") != null? object.get("pubConferenceId").get("collaborators"):[];
                        var url = object.get("pubConferenceId").get("url") != null? object.get("pubConferenceId").get("url"):"#";
                        var conference_date = object.get("pubConferenceId").get("conference_date") != null? object.get("pubConferenceId").get("conference_date"):"";
                        var location = object.get("pubConferenceId").get("location") != null? object.get("pubConferenceId").get("location"):"";
                        var title = object.get("pubConferenceId").get("title") != null? object.get("pubConferenceId").get("title"):"";
                        var contributors = object.get("pubConferenceId").get("contributors") != null? object.get("pubConferenceId").get("contributors"):[];
                        var conference_location = object.get("pubConferenceId").get("conference_location") != null? object.get("pubConferenceId").get("conference_location"):"";
                        var volume = object.get("pubConferenceId").get("volume") != null? object.get("pubConferenceId").get("volume"):"";
                        var type = "conference";
                        var conference = object.get("pubConferenceId").get("conference") != null? object.get("pubConferenceId").get("conference"):"";
                        var conference_volume = object.get("pubConferenceId").get("conference_volume") != null? object.get("pubConferenceId").get("conference_volume"):"";
                        var doi = object.get("pubConferenceId").get("doi") != null? object.get("pubConferenceId").get("doi"):"";

                        feeds.push({
                            objId: objectId,
                            fullname: fullname,
                            username: username,
                            userImg: userImg,
                            publication_date:publication_date,
                            conference_date:conference_date,
                            location:location,
                            collaborators:collaborators,
                            filename:filename,
                            description:abstract,
                            author: author,
                            contributors: contributors,
                            volume:volume,
                            url: url,
                            type:type,
                            conference_location: conference_location,
                            keywords:keywords,
                            conference: conference,
                            doi:doi,
                            title: title,
                            conference_volume: conference_volume,

                        });
                    }
                    }
                    else if (type =="pub_journal")
                    {
                        if(object.attributes.pubJournalId!=null && object.attributes.pubJournalId.attributes !=null)
                        {
                            var objectId = object.get("pubJournalId").id;
                            var publication_date = object.get("pubJournalId").get("publication_date") != null? object.get("pubJournalId").get("publication_date"):"";
                            var abstract = object.get("pubJournalId").get("abstract") != null? object.get("pubJournalId").get("abstracts"):"";
                            var journal_volume = object.get("pubJournalId").get("journal_volume") != null? object.get("pubJournalId").get("journal_volume"):"";
                            var filename = object.get("pubJournalId").get("filename") != null? object.get("pubJournalId").get("filename"):"";
                            var keywords = object.get("pubJournalId").get("keywords") != null? object.get("pubJournalId").get("keywords"):[];
                            var page = object.get("pubJournalId").get("page") != null? object.get("pubJournalId").get("page"):"";
                            var url = object.get("pubJournalId").get("url") != null? object.get("pubJournalId").get("url"):"#";
                            var journal_issue = object.get("pubJournalId").get("journal_issue") != null? object.get("pubJournalId").get("journal_issue"):"";
                            var journal_page = object.get("pubJournalId").get("journal_page") != null? object.get("pubJournalId").get("journal_page"):"";
                            var journal = object.get("pubJournalId").get("journal") != null? object.get("pubJournalId").get("journal"):"";
                            var title = object.get("pubJournalId").get("title") != null? object.get("pubJournalId").get("title"):"";
                            var contributors = object.get("pubJournalId").get("contributors") != null? object.get("pubJournalId").get("contributors"):[];
                            var issue = object.get("pubJournalId").get("issue") != null? object.get("pubJournalId").get("issue"):"";
                            var volume = object.get("pubJournalId").get("volume") != null? object.get("pubJournalId").get("volume"):"";
                            var type = "journal";
                            var doi = object.get("pubJournalId").get("doi") != null? object.get("pubJournalId").get("doi"):"";

                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                publication_date:publication_date,
                                description:abstract,
                                journal_volume:journal_volume,
                                filename:filename,
                                keywords:keywords,
                                page:page,
                                url:url,
                                journal_issue:journal_issue,
                                journal_page:journal_page,
                                journal:journal,
                                title:title,
                                contributors:contributors,
                                issue:issue,
                                volume:volume,
                                type:type,
                                doi:doi
                            });
                        }
                    }
                    else if (type =="pub_patent")
                    {
                        if(object.attributes.pubPatentId!=null && object.attributes.pubPatentId.attributes !=null)
                        {
                            var objectId = object.get("pubPatentId").id;
                            var publication_date = object.get("pubPatentId").get("publication_date") != null? object.get("pubPatentId").get("publication_date"):"";
                            var abstract = object.get("pubPatentId").get("abstract") != null? object.get("pubPatentId").get("abstracts"):"";
                            var patent_date = object.get("pubPatentId").get("patent_date") != null? object.get("pubPatentId").get("patent_date"):"";
                            var filename = object.get("pubPatentId").get("filename") != null? object.get("pubPatentId").get("filename"):"";
                            var keywords = object.get("pubPatentId").get("keywords") != null? object.get("pubPatentId").get("keywords"):[];
                            var patent_location = object.get("pubPatentId").get("patent_location") != null? object.get("pubPatentId").get("patent_location"):[];
                            var collaborators = object.get("pubPatentId").get("collaborators") != null? object.get("pubPatentId").get("collaborators"):[];
                            var url = object.get("pubPatentId").get("url") != null? object.get("pubPatentId").get("url"):"#";
                            var location = object.get("pubPatentId").get("location") != null? object.get("pubPatentId").get("location"):"";
                            var title = object.get("pubPatentId").get("title") != null? object.get("pubPatentId").get("title"):"";
                            var location = object.get("pubPatentId").get("location") != null? object.get("pubPatentId").get("location"):"";
                            var contributors = object.get("pubPatentId").get("contributors") != null? object.get("pubPatentId").get("contributors"):[];
                            var type = "patent";
                            var reference_number = object.get("pubPatentId").get("reference_number") != null? object.get("pubPatentId").get("reference_number"):"";
                            var doi = object.get("pubPatentId").get("doi") != null? object.get("pubPatentId").get("doi"):"";
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                publication_date:publication_date,
                                description:abstract,
                                filename:filename,
                                keywords:keywords,
                                url:url,
                                title:title,
                                contributors:contributors,
                                collaborators:collaborators,
                                location:location,
                                reference_number:reference_number,
                                patent_location:patent_location,
                                patent_date:patent_date,
                                type:type,
                                doi:doi
                            });
                        }
                    }
                    else if(type =="pub_thesis")
                    {
                        if(object.attributes.pubThesisId!=null && object.attributes.pubThesisId.attributes !=null)
                        {
                            var objectId = object.get("pubThesisId").id;
                            var publication_date = object.get("pubThesisId").get("publication_date") != null? object.get("pubThesisId").get("publication_date"):"";
                            var abstract = object.get("pubThesisId").get("abstract") != null? object.get("pubThesisId").get("abstracts"):"";
                            var filename = object.get("pubThesisId").get("filename") != null? object.get("pubThesisId").get("filename"):"";
                            var keywords = object.get("pubThesisId").get("keywords") != null? object.get("pubThesisId").get("keywords"):[];
                            var supervisors = object.get("pubThesisId").get("supervisors") != null? object.get("pubThesisId").get("supervisors"):[];
                            var degree = object.get("pubThesisId").get("degree") != null? object.get("pubThesisId").get("degree"):"";
                            var collaborators = object.get("pubThesisId").get("collaborators") != null? object.get("pubThesisId").get("collaborators"):[];
                            var url = object.get("pubThesisId").get("url") != null? object.get("pubThesisId").get("url"):"#";
                            var page = object.get("pubThesisId").get("page") != null? object.get("pubThesisId").get("page"):"";
                            var department = object.get("pubThesisId").get("department") != null? object.get("pubThesisId").get("department"):"";
                            var title = object.get("pubThesisId").get("title") != null? object.get("pubThesisId").get("title"):"";
                            var page = object.get("pubThesisId").get("page") != null? object.get("pubThesisId").get("page"):"";
                            var contributors = object.get("pubThesisId").get("contributors") != null? object.get("pubThesisId").get("contributors"):[];
                            var type = "thesis";
                            var doi = object.get("pubThesisId").get("doi") != null? object.get("pubThesisId").get("doi"):"";
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                publication_date:publication_date,
                                description:abstract,
                                filename:filename,
                                keywords:keywords,
                                url:url,
                                title:title,
                                contributors:contributors,
                                collaborators:collaborators,
                                department:department,
                                page:page,
                                degree:degree,
                                supervisors:supervisors,
                                type:type,
                                doi:doi
                            });
                        }
                    }
                    else if(type =="pub_unpublished")
                    {
                        if(object.attributes.pubUnpublishedId!=null && object.attributes.pubUnpublishedId.attributes !=null)
                        {
                            var objectId = object.get("pubUnpublishedId").id;
                            var publication_date = object.get("pubUnpublishedId").get("publication_date") != null? object.get("pubUnpublishedId").get("publication_date"):"";
                            var abstract = object.get("pubUnpublishedId").get("abstract") != null? object.get("pubUnpublishedId").get("abstracts"):"";
                            var filename = object.get("pubUnpublishedId").get("filename") != null? object.get("pubUnpublishedId").get("filename"):"";
                            var keywords = object.get("pubUnpublishedId").get("keywords") != null? object.get("pubUnpublishedId").get("keywords"):[];
                            var url = object.get("pubUnpublishedId").get("url") != null? object.get("pubUnpublishedId").get("url"):"#";
                            var title = object.get("pubUnpublishedId").get("title") != null? object.get("pubUnpublishedId").get("title"):"";
                            var contributors = object.get("pubUnpublishedId").get("contributors") != null? object.get("pubUnpublishedId").get("contributors"):[];
                            var type = "unpublished";
                            var location = object.get("pubUnpublishedId").get("location") != null? object.get("pubUnpublishedId").get("location"):"";
                            var doi = object.get("pubUnpublishedId").get("doi") != null? object.get("pubUnpublishedId").get("doi"):"";
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                publication_date:publication_date,
                                description:abstract,
                                filename:filename,
                                keywords:keywords,
                                url:url,
                                title:title,
                                contributors:contributors,
                                location:location,
                                type:type,
                                doi:doi
                            });
                        }
                    }
                    else if(type =="pub_report")
                    {
                        if(object.attributes.pubReportId!=null && object.attributes.pubReportId.attributes !=null)
                        {
                            var objectId = object.get("pubReportId").id;
                            var publication_date = object.get("pubReportId").get("publication_date") != null? object.get("pubReportId").get("publication_date"):"";
                            var report_location = object.get("pubReportId").get("report_location") != null? object.get("pubReportId").get("report_location"):"";
                            var abstract = object.get("pubReportId").get("abstract") != null? object.get("pubReportId").get("abstracts"):"";
                            var filename = object.get("pubReportId").get("filename") != null? object.get("pubReportId").get("filename"):"";
                            var keywords = object.get("pubReportId").get("keywords") != null? object.get("pubReportId").get("keywords"):[];
                            var url = object.get("pubReportId").get("url") != null? object.get("pubReportId").get("url"):"#";
                            var title = object.get("pubReportId").get("title") != null? object.get("pubReportId").get("title"):"";
                            var contributors = object.get("pubReportId").get("contributors") != null? object.get("pubReportId").get("contributors"):[];
                            var collaborators = object.get("pubReportId").get("collaborators") != null? object.get("pubReportId").get("collaborators"):[];
                            var report_number = object.get("pubReportId").get("report_number") != null? object.get("pubReportId").get("type"):"";
                            var location = object.get("pubReportId").get("location") != null? object.get("pubReportId").get("location"):"";
                            var publisher = object.get("pubReportId").get("publisher") != null? object.get("pubReportId").get("publisher"):"";
                            var type = "report";
                            var doi = object.get("pubReportId").get("doi") != null? object.get("pubReportId").get("doi"):"";
                            feeds.push({
                                objId: objectId,
                                fullname: fullname,
                                username: username,
                                userImg: userImg,
                                publication_date:publication_date,
                                description:abstract,
                                filename:filename,
                                keywords:keywords,
                                url:url,
                                title:title,
                                contributors:contributors,
                                location:location,
                                type:type,
                                report_number:report_number,
                                doi:doi
                            });
                        }
                    }
                    else if(type == "mod") {
                        if (object.attributes.modId != null && object.attributes.modId.attributes != null) {
                            var modItem = object.attributes.modId.attributes;
                            var filename ="";
                            var title ="";
                            var hashtags ="";
                            var year ="";
                            var author ="";
                            var description ="";
                            var objectId = object.attributes.modId;
                            var picture = modItem.picture.url();
                            if (modItem.filename != null) {
                                filename = modItem.filename;
                            }
                            if (modItem.title != null) {
                                title = modItem.title;
                            }
                            if (modItem.hashtags != null) {
                                hashtags = modItem.hashtags;
                            }
                            if (modItem.year != null) {
                                year = modItem.year;
                            }
                            if (modItem.author != null) {
                                author = modItem.author;
                            }
                            if (modItem.abstract != null) {
                                description = modItem.abstract;
                            }
                            feeds.push({
                                username: username,
                                userImg: userImg,
                                fullname: fullname,
                                type:type,
                                date:date,
                                filename: filename,
                                description: description,
                                author: author,
                                year: year,
                                hashtags: hashtags,
                                title: title,
                                objId: objectId,
                                picture: picture
                            });
                        }
                    }
                    else if (type == "dat") {
                        if (object.attributes.datId != null && object.attributes.datId.attributes != null) {
                            var datItem = object.attributes.datId.attributes;
                            var filename = datItem.filename;
                            var title ="";
                            var hashtags ="";
                            var year ="";
                            var author ="";
                            var description ="";
                            var objectId = object.attributes.datId;
                            var picture = datItem.picture.url();
                            if (datItem.title != null) {
                                title = datItem.title;
                            }
                            if (datItem.hashtags != null) {
                                hashtags = datItem.hashtags;
                            }
                            if (datItem.year != null) {
                                year = datItem.year;
                            }
                            if (datItem.author != null) {
                                author = datItem.author;
                            }
                            if (datItem.description != null) {
                                description = datItem.description;
                            }
                            feeds.push({
                                username: username,
                                userImg: userImg,
                                fullname: fullname,
                                type:type,
                                date:date,
                                filename: filename,
                                description: description,
                                author: author,
                                year: year,
                                hashtags: hashtags,
                                title: title,
                                objId: objectId,
                                picture: picture
                            });
                        }
                    }
                }
                res.send(feeds);
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });
    });

    app.get('/organizations', is_auth, function (req, res, next){
        var orgs =[];
        var query = new Parse.Query('Relationship');
        query.equalTo('userId',{ __type: "Pointer", className: "_User", objectId: req.user.id});
        query.include('orgId');
        query.each(function(result) {
            var verified = result.get('verified');
            var orgId = result.get('orgId').id;
            var orgName = result.get('orgId').get('displayName');
            var orgLink = result.get('orgId').get('name');
            //console.log("VERIFIED " +verified + " ORGID " + orgId + " ORGNAME " + orgName);
            if (verified) {
                var org = {
                    orgId: orgId,
                    orgName: orgName,
                    orgLink: orgLink
                }
                orgs.push(org);
            }
        }).then(function(){
            console.log(JSON.stringify(orgs));
            res.json(orgs);
        })
    });

    app.post('/newsfeed', is_auth,function (req, res, next) {
        var NewsFeed = Parse.Object.extend("NewsFeed");
        var newsFeed = new NewsFeed();
        newsFeed.set('from', currentUser);
        newsFeed.set('content', req.body.content);
        newsFeed.save(null, {
            success: function (newsfeed) {
                // Execute any logic that should take place after the object is saved.
                res.render('newsfeed', {
                    title: 'NewsFeed', userId: currentUser.id,
                    username: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl
                });
            },
            error: function (newsfeed, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('Failed to create new object, with error code: ' + error.message);
                res.render('newsfeed', {title: 'NewsFeed', msg: 'Posting content failed!'});
            }
        });
    });

};