/**
 * Created by hroshandel on 6/9/2016.
 */
var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var is_auth = require('../utils/helpers').is_auth;

module.exports=function(app,Parse,io) {

    app.get('/organization/:objectId/discussions',function(req,res,next){
        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.include("madeBy");
        query.descending("createdAt");
        query.find({
            success: function (result) {
                var discussions=[];
                if(result!=null){
                    for (var i = 0; i < result.length; i++) {
                        var object = result[i];
                        var disc = {
                            id: object.id,
                            madeBy: {
                                username: object.get("madeBy").get("username"),
                                fullname: object.get("madeBy").get("fullname"),
                                about: object.get("madeBy").get("about"),
                                imgUrl :object.get("madeBy").get("picture").url()
                            },
                            topic: object.get("topic"),
                            content: object.get("content"),
                            created: object.get("createdAt")
                        };
                        discussions.push(disc);
                    }
                }
                res.json({discussions:discussions});
            },
            error: function (error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.get('/organization/:objectId/discussions/:discId',is_auth,function(req,res,next){
        res.render('discussion',{orgId: req.params.objectId,discId:req.params.discId});
    });
    app.get('/organization/:objectId/discussions/:discId/:page',is_auth,function(req,res,next){

        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.equalTo("objectId",req.params.discId);
        query.include("madeBy");
        query.include("posts");
        query.include("posts.from");
        query.descending("createdAt");
        query.first({
            success: function (result) {

                if(result!=null){
                    var posts=[];
                    var jsonPosts= result.get("posts");
                    for(var p in jsonPosts)
                    {
                        var p =jsonPosts[p];
                        var post = {
                            id: p.id,
                            from :  {
                                name: p.get("from").get("fullname"),
                                about: p.get("from").get("about"),
                                img : p.get("from").get("picture").url(),
                                username: p.get("from").get("username")
                            },
                            content: p.get("content"),
                            createdAt: p.get("createdAt")
                        };
                        posts.push(post);
                    }
                    var discussion={
                        madeBy: {
                            username: result.get("madeBy").get("username"),
                            fullname: result.get("madeBy").get("fullname"),
                            about: result.get("madeBy").get("about"),
                            imgUrl :result.get("madeBy").get("picture").url()
                        },
                        topic: result.get("topic"),
                        content: result.get("content"),
                        posts: posts,
                        created: result.get("createdAt")
                    };

                     res.json({discussion:discussion});

                }else
                res.json({});
            },
            error: function (error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });

    app.post('/organization/:objectId/discussions',is_auth,function(req,res,next){
     var topic = req.body.topic;
     var content = req.body.content;
        if(topic == undefined || topic == "")
             res.json({error : "topic cannot be empty"});
        else
        {
            var createDisscusion = Parse.Object.extend("Discussion");
            var discussion = new createDisscusion();
            discussion.set("content", {msg: content});
            discussion.set("topic", topic);
            discussion.set("posts",[]);
            discussion.set("orgId", {__type: "Pointer", className: "Organization", objectId: req.params.objectId});
            discussion.set("madeBy", {__type: "Pointer", className: "_User", objectId: req.user.id});
            discussion.save(null, {
                success: function () {
                    res.json({msg: "success"});
                },
                error: function (error) {
                    res.json({error: error});
                }
            });
        }
    });
    app.post('/organization/:objectId/discussions/:discId',is_auth,function(req,res,next){
        var discId= req.params.discId;
        var content = req.body.content;

        var Discussion_post = Parse.Object.extend("Discussion_post");
        var dPost = new Discussion_post();
        dPost.set('from', {__type: "Pointer", className: "_User", objectId: req.user.id});
        dPost.set('content', {msg: content});
        dPost.set('discussionId',{__type: "Pointer", className: "Discussion", objectId: discId})
        dPost.save(null, {
            success: function (discPost) {
                var query= new Parse.Query('Discussion');
                query.equalTo("objectId", discId);
                query.first({
                    success: function (result) {
                        if (result) {
                            var posts=result.get("posts");
                            if(posts != undefined) {
                                posts.push({__type: "Pointer", className: "Discussion_post", objectId: discPost.id});
                                result.set("posts",posts);
                            }
                            else
                                result.set("posts",[{__type: "Pointer", className: "Discussion_post", objectId: discPost.id}]);

                            result.save();

                            var finalPost= {
                                id: discPost.id,
                                from :  {
                                    name: req.user.fullname,
                                    img : req.user.imgUrl,
                                    about : req.user.about,
                                    username: req.user.username
                                },
                                createdAt:discPost.get("createdAt"),
                                content: {msg:content}
                            };

                            io.to(req.user.id).emit('DiscussionPostReceived',{discId:discId,post:finalPost});
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
    app.delete('/organization/:objectId/discussions',function(req,res,next){

    });
    app.delete('/organization/:objectId/discussions/:discId',function(req,res,next){

    });

}