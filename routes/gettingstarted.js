/**
 * Created by hroshandel on 7/25/2016.
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
//**********************************************//
//                                              //
//                  EQUIPMENT                   //
//                                              //
//**********************************************//

module.exports=function(app,Parse,io) {
    app.post('/education', is_auth, function(req,res,next){
        var currentUser = req.user;
        var query = new Parse.Query(Parse.User);
        query.get(currentUser.id).then(
            function (result) {
                if (result != undefined) {
                    var Education = Parse.Object.extend("Education");
                    var education = new Education();

                    education.set("start_date", new Date(req.body.start_date));
                    education.set("end_date", new Date(req.body.end_date));
                    education.set("faculty", req.body.faculty);
                    education.set("department", req.body.department);
                    education.set("degree", req.body.degree);
                    education.set("description", req.body.description);
                    education.set("userId", { __type: "Pointer", className: "_User", objectId: currentUser.id});
                    education.set("orgId", { __type: "Pointer", className: "Organization", objectId: "ny1UEBo6zn"}); // TODO query org for this

                    education.save(null, {
                        success: function (obj) {
                            console.log(obj);
                            console.log('education success!');

                            result.add("educations", { __type: "Pointer", className: "Education", objectId: obj.id}); // TODO replace with org query res
                            result.save(null, { useMasterKey: true });
                            res.status(200).json({status: "Info Uploaded Successfully!"});
                        },
                        error: function (error) {
                            console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                            res.status(500).json({error: error});
                        }
                    });
                }
            }, function(error) {
                console.log('Failed to upload education, with error: ' + error, JSON.stringify(error, null, 2));
                res.status(500).json({status: "Adding education failed. " + error.message});
            });
    });

    app.post('/workExperience', is_auth, function(req,res,next){
        console.log(req.body, req.user);
        var currentUser = req.user;
        var query = new Parse.Query(Parse.User);
        query.get(currentUser.id).then(
            function (result) {
                if (result != undefined) {
                    var Work_experience = Parse.Object.extend("Work_experience");
                    var workExperience = new Work_experience();
                    console.log(req.params.objectId);
                    console.log(req.body);

                    workExperience.set("start_date", new Date(req.body.start_date));
                    workExperience.set("end_date", new Date(req.body.end_date));
                    workExperience.set("is_current", (req.body.start_date && !req.body.end_date) ? true : false);
                    workExperience.set("position", req.body.position);
                    workExperience.set("description", req.body.description);
                    workExperience.set("userId", { __type: "Pointer", className: "_User", objectId: currentUser.id});
                    workExperience.set("orgId", { __type: "Pointer", className: "Organization", objectId: "ny1UEBo6zn"}); // TODO query org for this

                    workExperience.save(null, {
                        success: function (obj) {
                            console.log('workExperience success!');

                            result.add("educations", { __type: "Pointer", className: "Work_experience", objectId: obj.id}); // TODO replace with org query res
                            result.save(null, { useMasterKey: true });
                            res.status(200).json({status: "Info Uploaded Successfully!"});
                        },
                        error: function (error) {
                            console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                            res.status(500).json({error: error});
                        }
                    });
                }
            }
        );
    });
};
