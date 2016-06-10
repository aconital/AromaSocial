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
                            madeBy: {
                                username: object.get("madeBy").get("username"),
                                fullname: object.get("madeBy").get("fullname"),
                                imgUrl :object.get("madeBy").get("picture").url()
                            },
                            topic: object.get("topic"),
                            content: object.get("content")
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
    app.get('/organization/:objectId/discussions/:discId',function(req,res,next){
        var Discussion = Parse.Object.extend("Discussion");
        var query = new Parse.Query(Discussion);
        query.equalTo("orgId", { __type: "Pointer", className: "Organization", objectId: req.params.objectId});
        query.equalTo("objectId",req.params.discId);
        query.include("madeBy");
        query.include("posts");
        query.descending("createdAt");
        query.first({
            success: function (result) {

                if(result!=null){

                    var discssion={
                        madeBy: {
                            username: result.get("madeBy").get("username"),
                            fullname: result.get("madeBy").get("fullname"),
                            imgUrl :result.get("madeBy").get("picture").url()
                        },
                        topic: result.get("topic"),
                        content: result.get("content"),
                        posts: result.get("posts")
                    };

                     res.json(discssion);

                }

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
    app.delete('/organization/:objectId/discussions',function(req,res,next){

    });
    app.delete('/organization/:objectId/discussions/:discId',function(req,res,next){

    });

}