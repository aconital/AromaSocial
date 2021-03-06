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

        if(req.body.institution != '')
        {
            var query = new Parse.Query(Parse.User);
            query.get(currentUser.id).then(
                function (result) {
                    if (result != undefined) {

                        if (req.body.institution.objectId === null) {
                            ////////////////////////////////////////////////////////////
                            var dName = req.body.institution.value;
                            var orgName = req.body.institution.value.toLowerCase().replace(/'/g, "_").replace(/ /g, "_");
                            // check if name already exists in db
                            var Organization = Parse.Object.extend("Organization");
                            var maxIndexSoFar = -1;
                            var query = new Parse.Query(Organization);
                            query.startsWith("displayName", req.body.institution.value.toLowerCase());
                            query.each(function (result) {
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
                            }).then(function () {
                                if (maxIndexSoFar == -1) {
                                    // no match in db, all good - keeping this just in case we need to hand such a case (e.g if we dont want to include a seq num for the very first organization)
                                } else {
                                    // update orgName to use next index
                                    var newIndex = maxIndexSoFar + 1;
                                    orgName = req.body.institution.value.toLowerCase() + "." + newIndex;
                                }
                            }).then(function () {
                                //var Organization = Parse.Object.extend("Organization");
                                var org = new Organization();
                                org.set('name', orgName);
                                org.set('displayName', dName);
                                org.save(null).then(function (response) {
                                    var Education = Parse.Object.extend("Education");
                                    var education = new Education();
                                    education.set("start_date", new Date(req.body.start_date));
                                    education.set("end_date", new Date(req.body.end_date));
                                    education.set("faculty", req.body.faculty);
                                    education.set("department", req.body.department);
                                    education.set("degree", req.body.degree);
                                    education.set("description", req.body.description);
                                    education.set("userId", {
                                        __type: "Pointer",
                                        className: "_User",
                                        objectId: currentUser.id
                                    });
                                    education.set("orgId", {
                                        __type: "Pointer",
                                        className: "Organization",
                                        objectId: response.id
                                    });
                                    education.save(null, {
                                        success: function (obj) {
                                            result.add("educations", {
                                                __type: "Pointer",
                                                className: "Education",
                                                objectId: obj.id
                                            });
                                            result.save(null, {useMasterKey: true});
                                            res.status(200).json({status: "Info Uploaded Successfully!"});
                                        },
                                        error: function (error) {
                                            console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                                            res.status(500).json({error: error});
                                        }
                                    });
                                });

                            }, function (error) {
                                console.log('Failed to create new organization, with error code: ' + error.message);
                                return res.status(500).json({error: error.message});
                            });
                            ///////////////////////////////////////////////////////////

                        }
                        else {
                            var Education = Parse.Object.extend("Education");
                            var education = new Education();
                            education.set("start_date", new Date(req.body.start_date));
                            education.set("end_date", new Date(req.body.end_date));
                            education.set("faculty", req.body.faculty);
                            education.set("department", req.body.department);
                            education.set("degree", req.body.degree);
                            education.set("description", req.body.description);
                            education.set("userId", {__type: "Pointer", className: "_User", objectId: currentUser.id});
                            education.set("orgId", {
                                __type: "Pointer",
                                className: "Organization",
                                objectId: req.body.institution.objectId
                            });
                            education.save(null, {
                                success: function (obj) {
                                    console.log(obj);
                                    console.log('education success!');

                                    result.add("educations", {
                                        __type: "Pointer",
                                        className: "Education",
                                        objectId: obj.id
                                    }); // TODO replace with org query res
                                    result.save(null, {useMasterKey: true});
                                    res.status(200).json({status: "Info Uploaded Successfully!"});
                                },
                                error: function (error) {
                                    console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                                    res.status(500).json({error: error});
                                }
                            });
                        }
                    }
                }, function (error) {
                    console.log('Failed to upload education, with error: ' + error, JSON.stringify(error, null, 2));
                    res.status(500).json({status: "Adding education failed. " + error.message});
                });
        }
        else
            res.status(200).json({status: "nothing to save"});
    });

    app.post('/workExperience', is_auth, function(req,res,next){

        var currentUser = req.user;

        if(req.body.company != '')
        {
            var query = new Parse.Query(Parse.User);
            query.get(currentUser.id).then(
                function (result) {
                    if (result != undefined) {
                        if (req.body.company.objectId === null) {
                            ////////////////////////////////////////////////////////////
                            var dName = req.body.company.value;
                            var orgName = req.body.company.value.toLowerCase().replace(/'/g, "_").replace(/ /g, "_");
                            // check if name already exists in db
                            var Organization = Parse.Object.extend("Organization");
                            var maxIndexSoFar = -1;
                            var query = new Parse.Query(Organization);
                            query.startsWith("displayName", req.body.company.value.toLowerCase());
                            query.each(function (result) {
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
                            }).then(function () {
                                if (maxIndexSoFar == -1) {
                                    // no match in db, all good - keeping this just in case we need to hand such a case (e.g if we dont want to include a seq num for the very first organization)
                                } else {
                                    // update orgName to use next index
                                    var newIndex = maxIndexSoFar + 1;
                                    orgName = req.body.company.value.toLowerCase() + "." + newIndex;
                                }
                            }).then(function () {
                                //var Organization = Parse.Object.extend("Organization");
                                var org = new Organization();
                                org.set('name', orgName);
                                org.set('displayName', dName);
                                org.save(null).then(function (response) {
                                    var Work_experience = Parse.Object.extend("Work_experience");
                                    var workExperience = new Work_experience();
                                    workExperience.set("start_date", new Date(req.body.start_date));
                                    workExperience.set("end_date", new Date(req.body.end_date));
                                    workExperience.set("is_current", (req.body.start_date && !req.body.end_date) ? true : false);
                                    workExperience.set("position", req.body.position);
                                    workExperience.set("description", req.body.description);
                                    workExperience.set("userId", {
                                        __type: "Pointer",
                                        className: "_User",
                                        objectId: currentUser.id
                                    });
                                    workExperience.set("orgId", {
                                        __type: "Pointer",
                                        className: "Organization",
                                        objectId: response.id
                                    });
                                    workExperience.save(null, {
                                        success: function (obj) {
                                            console.log('workExperience success!');

                                            result.add("workExperience", {
                                                __type: "Pointer",
                                                className: "Work_experience",
                                                objectId: obj.id
                                            }); // TODO replace with org query res
                                            result.save(null, {useMasterKey: true});
                                            res.status(200).json({status: "Info Uploaded Successfully!"});
                                        },
                                        error: function (error) {
                                            console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                                            res.status(500).json({error: error});
                                        }
                                    });
                                });

                            }, function (error) {
                                console.log('Failed to create new organization, with error code: ' + error.message);
                                return res.status(500).json({error: error.message});
                            });
                            ///////////////////////////////////////////////////////////
                        }
                        else {
                            var Work_experience = Parse.Object.extend("Work_experience");
                            var workExperience = new Work_experience();
                            console.log("company is");
                            console.log(req.body.company);

                            workExperience.set("start_date", new Date(req.body.start_date));
                            workExperience.set("end_date", new Date(req.body.end_date));
                            workExperience.set("is_current", (req.body.start_date && !req.body.end_date) ? true : false);
                            workExperience.set("position", req.body.position);
                            workExperience.set("description", req.body.description);
                            workExperience.set("userId", {
                                __type: "Pointer",
                                className: "_User",
                                objectId: currentUser.id
                            });
                            workExperience.set("orgId", {
                                __type: "Pointer",
                                className: "Organization",
                                objectId: req.body.company.objectId
                            }); // TODO query org for this

                            workExperience.save(null, {
                                success: function (obj) {
                                    console.log('workExperience success!');

                                    result.add("workExperience", {
                                        __type: "Pointer",
                                        className: "Work_experience",
                                        objectId: obj.id
                                    }); // TODO replace with org query res
                                    result.save(null, {useMasterKey: true});
                                    res.status(200).json({status: "Info Uploaded Successfully!"});
                                },
                                error: function (error) {
                                    console.log('Failed to create new object, with error: ' + JSON.stringify(error));
                                    res.status(500).json({error: error});
                                }
                            });
                        }
                    }
                }
            );
        }
        else
            res.status(200).json({status: "nothing to save"});
    });
};
