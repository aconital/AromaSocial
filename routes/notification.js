/**
 * Created by hroshandel on 7/11/2016.
 */
var express = require('express');
var util = require('util');
var moment = require('moment');
var path = require('path');
var _= require('underscore');

var is_auth = require('../utils/helpers').is_auth;

module.exports=function(app,Parse,io) {

    app.get("/notifications/general",is_auth,function(req,res,next){

        var Notification = Parse.Object.extend("Notification");
        var query = new Parse.Query(Notification);
        query.equalTo("for",{__type: "Pointer", className: "_User", objectId: "WpmgBjH7wa"});
        query.lessThanOrEqualTo('createdAt',req.user.last_seen_notification);
        query.descending("createdAt");
        query.find({
            success: function (results) {
                if(results!=null){
                    var list=[];
                    for(var i=0;i<results.length;i++)
                    {
                        var n = results[0];
                        var notification = {
                            id: n.id,
                            type:n.get("type"),
                            from: n.get("from"),
                            msg: n.get("msg"),
                            extra: n.get("extra")
                        };
                        list.push(notification);
                    }
                    res.json(list);

                }
                else
                    res.json([]);
            },
            error: function (error) {
                res.json([]);
            }
        });
    })
}