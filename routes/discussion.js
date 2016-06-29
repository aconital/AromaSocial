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

    app.get('/organization/:orgname/discussions',function(req,res,next){
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("name",req.params.orgname);

        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.include("madeBy");
        query.matchesQuery("orgId",innerQuery);
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
    app.get('/organization/:orgname/discussions/:discId',is_auth,function(req,res,next){


        var Organization = Parse.Object.extend("Organization");
        var query = new Parse.Query(Organization);
        query.equalTo("name",req.params.orgname);
        query.first({
            success: function (r) {
                if(r!=null){
                   var orgName=r.get("name");
                    res.render('discussion',{orgName:orgName,orgId: req.params.objectId,discId:req.params.discId});
                }
                else
                    res.render('index', {title: error, path: req.path})
            },
            error: function (error) {
                res.render('index', {title: error, path: req.path});
            }
        });

    });
    app.get('/organization/:orgname/discussions/:discId/:page',is_auth,function(req,res,next){
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("name",req.params.orgname);

        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.matchesQuery("orgId", innerQuery);
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
                        id: result.id,
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
                            //update the view
                            io.to(req.user.id).emit('DiscussionPostReceived',{discId:discId,post:finalPost});
                            //notify everyone
                            notifyParticipants(discId,req.user,content);
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
    //delete a whole discussion and its posts
    app.delete('/organization/:objectId/discussions',is_auth,function(req,res,next){
        var discId= req.body.discId;
        var orgName = req.body.orgName;

        var Discussion_post = Parse.Object.extend("Discussion_post");
        var query = new Parse.Query(Discussion_post);
        query.equalTo("discussionId",{ __type: "Pointer", className: "Discussion", objectId: discId});
        query.find().then(function(results) {
            return Parse.Object.destroyAll(results, {useMasterKey: true});
        }).then(function() {
                var Discussion = Parse.Object.extend("Discussion");
                var query = new Parse.Query(Discussion);
                query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
                query.equalTo("objectId",discId);
                query.first({
                    success: function (r) {
                        if(r!=null){
                           r.destroy({
                               success: function(model, response){
                                   res.json({url:'/organization/'+orgName});
                               },
                               error: function(model, response){
                                   res.json({error:error});
                               }
                           });
                        }
                        else
                            res.json({error:"Oops! Something went wrong!"});
                    },
                    error: function (error) {
                        res.render('index', {title: error, path: req.path});
                    }
                });
        }, function(error) {
            res.json({error:"Could not delete the discussion"})
        });
    });


    //delete a post in discussion
    app.delete('/organization/:objectId/discussions/:discId',is_auth,function(req,res,next){
        var postId= req.body.postId;

        var Discussion_post = Parse.Object.extend("Discussion_post");
        var query = new Parse.Query(Discussion_post);
        query.equalTo("objectId",postId);
        query.first({
            success: function (result) {
                if(result!=null){

                       result.destroy({
                           success: function(model, response){
                               var Discussion = Parse.Object.extend("Discussion");
                               var query = new Parse.Query(Discussion);
                               query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
                               query.equalTo("objectId",req.params.discId);
                               query.first({
                                   success: function (r) {
                                       if(r!=null){
                                            r.remove("posts",{"__type":"Pointer","className":"Discussion_post","objectId":postId});
                                            r.save(null, { useMasterKey: true }).then(function () {
                                                io.to(req.user.id).emit('DiscussionPostDeleted',{discId:req.params.discId,postId:postId});
                                               res.json({msg: "success"});
                                           });
                                       }
                                       else
                                       res.json({error:"Oops! Something went wrong!"});
                                   },
                                   error: function (error) {
                                       res.render('index', {title: error, path: req.path});
                                   }
                               });
                           },
                           error: function(model, response){
                               res.json({error:"Could not delete the post"});
                           }
                       });
                }
                else
                res.json({error:"Post didn't found!"});
            },
            error: function (error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });

    });


    function notifyParticipants(discId,myself,post)
    {
        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.equalTo("objectId",discId);
        query.include("posts");
        query.include("orgId");
        query.include("posts.from");
        query.first({
            success: function (result) {

                if(result!=null){
                    var participants=[];
                    var jsonPosts= result.get("posts");
                    for(var p in jsonPosts)
                    {
                        var participantId= jsonPosts[p].get("from").id;


                        if(myself.id != participantId &&  !_.contains(participantId, participantId))
                        {
                            participants.push(participantId);
                            var notification = {
                                id: "disc_"+discId+"_to_"+participantId,
                                type:"discussion",
                                from: {
                                    userId:myself.id,
                                    username: myself.username,
                                    name:myself.fullname,
                                    userImgUrl: myself.imgUrl,
                                },
                                msg: 'replied "'+post.substring(0,30)+'"',
                                extra: {
                                    id: discId,
                                    title:result.get("topic"),
                                    content: null,
                                    imgUrl: null,
                                    url: "/organization/"+result.get("orgId").get("name")+"/discussions/"+discId
                                }
                            };

                            io.to(participantId).emit('discussionPost',{data:notification});
                        }

                    }



                }

            },
            error: function (error) {
                console.log(error);
            }
        });
    }
}