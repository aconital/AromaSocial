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
    app.get('/newsfeeddata',function (req, res, next) {

        var query = new Parse.Query('NewsFeed');
        query.include("pubBookId");
        query.include("pubReportId");
        query.include("pubConferenceId");
        query.include("pubJournalId");
        query.include("pubThesisId");
        query.include("pubUnpublishedId");
        query.include("pubPatentId");
        query.include("equipmentId");
        query.include("projectId");
        query.include("orgId");
        query.include("modId");
        query.include("datId");
        query.include("comments");
        query.include("comments.from");
        query.include('from');
        query.descending("createdAt");
        query.limit(20);
        var feed=[];
        query.find(function(results) {
            for (var i = 0; i < results.length; i++) {
                var result=results[i];
                // Do something with the returned Parse.Object values
                var comments = [];
                if(result.get("comments") != undefined){
                    var commentsList =result.get("comments");
                    var commentId=0;
                    for(var c in commentsList){
                        var comment = {
                            id: commentId,
                            from :  {
                                name: commentsList[c].get("from").get("fullname"),
                                img : commentsList[c].get("from").get("picture").url(),
                                username: commentsList[c].get("from").get("username")
                            },
                            content: commentsList[c].get("content"),
                            createdAt: commentsList[c].get("createdAt")
                        };
                        comments.push(comment);
                        commentId++;
                    }
                }
                var feedId= result.id;
                var date=result.createdAt;
                var type=result.get("type");

                if (type == "equipment") {
                    var message="added an equipment";
                    var adderName=result.get("orgId").get("name");
                    var adderURL="/organization/" + adderName;
                    var objectURL="/equipment/" + result.get("equipmentId").id;
                    feed.push({
                        date:date,
                        feedId:feedId,
                        adderPicture:result.get("orgId").get("picture").url(),
                        adderName:result.get("orgId").get("displayName"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("equipmentId").get("picture").url(),
                        objectTitle:result.get("equipmentId").get("title")!=null ? result.get("equipmentId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("orgId").get("description")!=null ? result.get("orgId").get("description"):"",
                        comments:comments
                    });
                }
                else if (type == "project") {
                    var message="added a project";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/project/" + result.get("projectId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("projectId").get("picture").url(),
                        objectTitle:result.get("projectId").get("title")!=null ? result.get("projectId").get("title"):"" ,
                        objectURL:objectURL,
                        description:result.get("projectId").get("description")!=null ? result.get("projectId").get("description"):"",
                        comments:comments
                    });
                }
                else if(type == "mod") {
                    var message="added a model on ";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/model/" + result.get("modId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("modId").get("picture").url(),
                        objectTitle:result.get("modId").get("title")!=null ? result.get("modId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("modId").get("description")!=null ? result.get("modId").get("description"):"",
                        comments:comments
                    });
                    console.log("4");
                }
                else if(type == "dat"){
                    var message="added a data";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/data/" + result.get("datId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("datId").get("picture").url(),
                        objectTitle:result.get("datId").get("title")!=null ? result.get("datId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("datId").get("description")!=null ? result.get("datId").get("description"):"",
                        comments:comments
                    });

                }
                else if(type =="pub_book" ) {
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/book/" + result.get("pubBookId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubBookId").get("title")!=null ? result.get("pubBookId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubBookId").get("abstract")!=null ? result.get("pubBookId").get("abstract"):"",
                        comments:comments
                    });
                }
                else if(type == "pub_conference" ){
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/conference/" + result.get("pubConferenceId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubConferenceId").get("title")!=null ? result.get("pubConferenceId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubConferenceId").get("abstract")!=null ? result.get("pubConferenceId").get("abstract"):"",
                        comments:comments
                    });
                }
                else if(type =="pub_journal"){

                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/journal/" + result.get("pubJournalId").id;


                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubJournalId").get("title")!=null ? result.get("pubJournalId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubJournalId").get("abstract")!=null ? result.get("pubJournalId").get("abstract"):"",
                        comments:comments
                    });


                }
                else if(type =="pub_patent"){
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/patent/" + result.get("pubPatentId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubPatentId").get("title")!=null ? result.get("pubPatentId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubPatentId").get("abstract")!=null ? result.get("pubPatentId").get("abstract"):"",
                        comments:comments
                    });
                }
                else if(type =="pub_thesis"){
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/thesis/" + result.get("pubThesisId").id;
                    feed.push({
                        date: date,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubThesisId").get("title")!=null ? result.get("pubThesisId").get("title")!=null:"",
                        objectURL:objectURL,
                        description:result.get("pubThesisId").get("abstract")!=null ? result.get("pubThesisId"):"",
                        comments:comments
                    });
                }
                else if(type =="pub_unpublished"){
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/unpublished/" + result.get("pubUnpublishedId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubUnpublishedId").get("title")!=null ? result.get("pubUnpublishedId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubUnpublishedId").get("abstract")!=null ? result.get("pubUnpublishedId").get("abstract"):"",
                        comments:comments
                    });
                }
                else if(type =="pub_report"){
                    var message="added a book";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/publication/report/" + result.get("pubReportId").id;
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:"/images/paper.png",
                        objectTitle:result.get("pubReportId").get("title")!=null ? result.get("pubReportId").get("title"):"",
                        objectURL:objectURL,
                        description:result.get("pubReportId").get("abstract")!=null ? result.get("pubReportId").get("abstract"):"",
                        comments:comments
                    });
                }
                else if(type =="org_create"){
                    var message="created";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/organization/" + result.get("orgId").get("name");
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("orgId").get("picture").url(),
                        objectTitle:result.get("orgId").get("displayName"),
                        objectURL:objectURL,
                        description:result.get("orgId").get("description")!=null ? result.get("orgId").get("description"):"",
                        comments:comments
                    });
                }
                else if(type =="org_join"){
                    var message="joined";
                    var adderURL="/profile/" + result.get("from").get("username");
                    var objectURL="/organization/" + result.get("orgId").get("name");
                    feed.push({
                        date:date,
                        feedId: feedId,
                        adderPicture:result.get("from").get("picture").url(),
                        adderName:result.get("from").get("fullname"),
                        adderURL:adderURL,
                        message:message,
                        objectPicture:result.get("orgId").get("picture").url(),
                        objectTitle:result.get("orgId").get("displayName"),
                        objectURL:objectURL,
                        description:result.get("orgId").get("description")!=null ? result.get("orgId").get("description"):"",
                        comments:comments
                    });
                }
            }

            res.json(feed);
        }, function(error) {
            console.log("Error: " + error.toString());
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

    app.get('/comments/:feedId',function(req,res,next){
        var feedId= req.params.feedId;
        var query= new Parse.Query('NewsFeed');
        query.equalTo("objectId", feedId);
        query.include("comments");
        query.include("comments.from");
        query.first({
            success: function (result) {
                if (result)
                {
                    var comments =[];
                    if(result.get("comments") != undefined)
                    {
                        var commentsList =result.get("comments");

                        var commentId=0;
                        for(var c in commentsList){

                            var comment = {
                                id: commentId,
                                from :  {
                                    name: commentsList[c].get("from").get("fullname"),
                                    img : commentsList[c].get("from").get("picture").url(),
                                    username: commentsList[c].get("from").get("username")
                                },
                                content: commentsList[c].get("content")
                            };
                            comments.push(comment);
                            commentId++;
                        }
                    }
                    res.json(comments);
                }
            },
            error: function ( error) {
                console.log("Couldnt save cookie token")
            }
        });

    });
    app.post('/comment',is_auth,function(req,res,next){
        var feedId= req.body.feedId;
        var feedNumber= req.body.feedNumber;
        var content = req.body.content;
        var Comment = Parse.Object.extend("Comment");
        var comment = new Comment();
        comment.set('from', {__type: "Pointer", className: "_User", objectId: req.user.id});
        comment.set('content', {msg: content});
        comment.set('feedId',{__type: "Pointer", className: "NewsFeed", objectId: feedId})
        comment.save(null, {
            success: function (comment) {
                var query= new Parse.Query('NewsFeed');
                query.equalTo("objectId", feedId);
                query.first({
                    success: function (result) {
                        if (result) {
                            var comments=result.get("comments");
                            if(comments != undefined) {
                                comments.push({__type: "Pointer", className: "Comment", objectId: comment.id});
                                result.set("comments",comments);
                            }
                            else
                                result.set("comments",[{__type: "Pointer", className: "Comment", objectId: comment.id}]);

                            result.save();

                            var finalComment= {
                                id: comment.id,
                                from :  {
                                    name: req.user.fullname,
                                    img : req.user.imgUrl,
                                    username: req.user.username
                                },
                                content: {msg:content}
                            };

                            io.to(req.user.id).emit('commentReceived',{feedId:feedId,feedNumber:feedNumber,comment:finalComment});
                            res.json({msg:"success"});
                        }
                    },
                    error: function ( error) {
                        console.log("Couldnt save cookie token")
                    }
                });
            },
            error: function (comment, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('Failed to create new object, with error code: ' + error.message);
                res.render('newsfeed', {title: 'NewsFeed', msg: 'Posting content failed!'});
            }
        });
    });
};