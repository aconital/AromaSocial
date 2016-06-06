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
var pubTypeToClass = require('../utils/helpers').pubTypeToClass;

var decodeHtmlEntity = function(str) {
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};

var encodeHtmlEntity = function(str) {
  var buf = [];
  for (var i=str.length-1;i>=0;i--) {
    buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
  }
  return buf.join('');
};

module.exports=function(app,Parse,io) {
    
    app.post('/allpublications', function(req, res, next) {
        var currentUser = req.user;
        var results = [];
        var str = req.body.substr;
        console.log("string to match in pub: ", str);
        var query = new Parse.Query('Pub_Book');
        query.limit(1000);
        query.contains("title", str);
        query.find({
            success: function(items) {
                //var results = [];
                for (var i = 0; i < items.length; i++) {
                    var obj = items[i];
                    results.push(obj);
                }
                console.log("RESULTS ARE: ");
                console.log(results);
                //res.send(results);
            },
            error: function(error) {
                console.log("Error while getting all publications");
            }
        }).then(function() {
            var query = new Parse.Query('Pub_Conference');
            query.limit(1000);
            query.contains("title", str);
            query.find({
                success: function(items) {
                    //var results = [];
                    for (var i = 0; i < items.length; i++) {
                        var obj = items[i];
                        results.push(obj);
                    }
                    console.log("RESULTS ARE: ");
                    console.log(results);
                    //res.send(results);
                },
                error: function(error) {
                    console.log("Error while getting all publications");
                }
            }).then(function() {
                var query = new Parse.Query('Pub_Journal_Article');
                query.limit(1000);
                query.contains("title", str);
                query.find({
                    success: function(items) {
                        //var results = [];
                        for (var i = 0; i < items.length; i++) {
                            var obj = items[i];
                            results.push(obj);
                        }
                        console.log("RESULTS ARE: ");
                        console.log(results);
                        //res.send(results);
                    },
                    error: function(error) {
                        console.log("Error while getting all publications");
                    }
                }).then(function() {
                    var query = new Parse.Query('Pub_Patent');
                    query.limit(1000);
                    query.contains("title", str);
                    query.find({
                        success: function(items) {
                            //var results = [];
                            for (var i = 0; i < items.length; i++) {
                                var obj = items[i];
                                results.push(obj);
                            }
                            console.log("RESULTS ARE: ");
                            console.log(results);
                            //res.send(results);
                        },
                        error: function(error) {
                            console.log("Error while getting all publications");
                        }
                    }).then(function() {
                        var query = new Parse.Query('Pub_Report');
                        query.limit(1000);
                        query.contains("title", str);
                        query.find({
                            success: function(items) {
                                //var results = [];
                                for (var i = 0; i < items.length; i++) {
                                    var obj = items[i];
                                    results.push(obj);
                                }
                                console.log("RESULTS ARE: ");
                                console.log(results);
                                //res.send(results);
                            },
                            error: function(error) {
                                console.log("Error while getting all publications");
                            }
                        }).then(function(){             
                            var query = new Parse.Query('Pub_Thesis');
                            query.limit(1000);
                            query.contains("title", str);
                            query.find({
                                success: function(items) {
                                    //var results = [];
                                    for (var i = 0; i < items.length; i++) {
                                        var obj = items[i];
                                        results.push(obj);
                                    }
                                    console.log("RESULTS ARE: ");
                                    console.log(results);
                                    //res.send(results);
                                },
                                error: function(error) {
                                    console.log("Error while getting all publications");
                                }
                            }).then(function() {
                                var query = new Parse.Query('Pub_Unpublished');
                                query.limit(1000);
                                query.contains("title", str);
                                query.find({
                                    success: function(items) {
                                        //var results = [];
                                        for (var i = 0; i < items.length; i++) {
                                            var obj = items[i];
                                            results.push(obj);
                                        }
                                        console.log("RESULTS ARE: ");
                                        console.log(results);
                                        res.send(results);
                                    },
                                    error: function(error) {
                                        console.log("Error while getting all publications");
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
        //res.send(results);
    });


    /*******************************************
     *
     * PUBLICATION
     *
     ********************************************/
    app.get('/publication', function (req, res, next) {
        res.render('publication', {layout: 'home', title: 'Publication', path: req.path});
    });

    app.get('/publication/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query(req.query.pub_class);

        query.equalTo("objectId", req.params.objectId);
        query.include('user');
        query.find({
            success: function(result) {
                var pubObject = JSON.parse(JSON.stringify(result[0]));
                var userEnv = { updatePath: req.path,
                                publication_date: pubObject.publication_date.iso.slice(0,10),
                                user: {username: pubObject.user.username,
                                imgUrl: pubObject.user.picture.url}}; // NOTE: currently just the uploader of file
                // merge the Parse object and fields for current user
                var rendered = _.extend(pubObject, userEnv);
                res.status(200).json({status:"OK", query: rendered});
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.get('/publication/book/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Book');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    contributors: result.get('contributors'),
                    author: result.get('author'),
                    abstract: result.get('abstract'),
                    filename: filename,
                    keywords: result.get('keywords'),
                    url: result.get('url'),
                    title: result.get('title'),
                    doi: result.get('doi'),
                    pub_class: 'Pub_Book',
                    publication_keys: JSON.stringify(result[0]),
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/conference/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Conference');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Conference',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/journal/:objectId', is_auth, function (req, res, next) {
        var query = new Parse.Query('Pub_Journal_Article');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: req.user.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Journal_Article',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/patent/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Patent');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Patent',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/report/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Report');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    collaborators: result.get('collaborators'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Report',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/thesis/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Thesis');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Thesis',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });
    app.get('/publication/unpublished/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Unpublished');
        query.include('user');
        query.get(req.params.objectId,{
            success: function(result) {
                var filename='';
                if (result.get('file')!=undefined){
                    filename=result.get('file').url();
                }
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    creatorImg: result.get('user').get('picture').url(),
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    contributers: result.get('contributers'),
                    description: result.get('abstract'),
                    filename: filename,
                    license: result.get('license'),
                    keywords: result.get('keywords'),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Unpublished',
                    publication_date: result.get('publication_date'),
                    publication_code: result.get('publication_code'),
                    createdAt: result.get('createdAt'),
                    updatedAt: result.get('updatedAt')
                });
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.get('/profile/:username/publications',function(req,res,next){
        // get publications of profile visited.
        var profile = req.user.id;
        profileQuery = new Parse.Query("User");
        profileQuery.equalTo("username",req.params.username);
        profileQuery.first().then(function(user) {
            var profile = user.id;
                otherPubs = user.get('other_pubs'); // retrieve those not uploaded by user
                pubs=[];
                pubBooks = Parse.Object.extend("Pub_Book");
                query = new Parse.Query(pubBooks);
            query.equalTo('user',{ __type: "Pointer", className: "_User", objectId: profile});
            query.descending("createdAt");
            query.find().then(function(books) {
                console.log("Successfully retrieved " + books.length + " Books.");
                // Do something with the returned Parse.Object values
                for (var i = 0; i < books.length; i++) {
                    var object = books[i];
                    pubs.push({
                        type: "book",
                        title: object.attributes.title,
                        keywords: object.attributes.keywords,
                        date: object.attributes.publication_date,
                        year: object.attributes.year,
                        contributors: object.attributes.contributors,
                        description: object.attributes.abstract,
                        id: object.id
                    });
                }
            }).then(function() {
                var pubConference = Parse.Object.extend("Pub_Conference");

                var uploadedC = new Parse.Query(pubConference); // get publications others have uploaded
                uploadedC.equalTo('other_users', user);
                uploadedC.descending("createdAt");

                var otherC = new Parse.Query(pubConference); // get uploaded publications
                otherC.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                otherC.descending("createdAt");

                var query1 = new Parse.Query.or(uploadedC, otherC);
                query1.find().then(function (conferences) {
                    console.log("Successfully retrieved " + conferences.length + " conferences.");
                    // Do something with the returned Parse.Object values
                    for (var i = 0; i < conferences.length; i++) {
                        var object = conferences[i];
                        pubs.push({
                            type: "conference",
                            title: object.attributes.title,
                            keywords: object.attributes.keywords,
                            date: object.attributes.publication_date,
                            year: object.attributes.year,
                            contributors: object.attributes.contributors,
                            description: object.attributes.abstract,
                            id: object.id
                        });
                    }
                }).then(function () {
                    var pubJournal = Parse.Object.extend("Pub_Journal_Article");

                    var uploadedJ = new Parse.Query(pubJournal); // get publications others have uploaded
                    uploadedJ.equalTo('other_users', user);
                    uploadedJ.descending("createdAt");

                    var otherJ = new Parse.Query(pubJournal); // get uploaded publications
                    otherJ.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                    otherJ.descending("createdAt");

                    var query2 = new Parse.Query.or(uploadedJ, otherJ);
                    query2.find().then(function (journals) {
                        console.log("Successfully retrieved " + journals.length + " articles.");
                        // Do something with the returned Parse.Object values
                        for (var i = 0; i < journals.length; i++) {
                            var object = journals[i];
                            pubs.push({
                                type: "journal",
                                title: object.attributes.title,
                                keywords: object.attributes.keywords,
                                date: object.attributes.publication_date,
                                year: object.attributes.year,
                                contributors: object.attributes.contributors,
                                description: object.attributes.abstract,
                                id: object.id
                            });
                        }
                    }).then(function () {
                        var pubPatent = Parse.Object.extend("Pub_Patent");
                        var query3 = new Parse.Query(pubPatent);
                        query3.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                        query3.descending("createdAt");
                        query3.find().then(function (patents) {
                            console.log("Successfully retrieved " + patents.length + " patents.");
                            // Do something with the returned Parse.Object values
                            for (var i = 0; i < patents.length; i++) {
                                var object = patents[i];
                                pubs.push({
                                    type: "patent",
                                    title: object.attributes.title,
                                    keywords: object.attributes.keywords,
                                    date: object.attributes.publication_date,
                                    year: object.attributes.year,
                                    contributors: object.attributes.contributors,
                                    description: object.attributes.abstract,
                                    id: object.id
                                });
                            }
                        }).then(function () {
                            var pubReport = Parse.Object.extend("Pub_Report");
                            var query4 = new Parse.Query(pubReport);
                            query4.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                            query4.descending("createdAt");
                            query4.find().then(function (reports) {
                                console.log("Successfully retrieved " + reports.length + " reports.");
                                // Do something with the returned Parse.Object values
                                for (var i = 0; i < reports.length; i++) {
                                    var object = reports[i];
                                    pubs.push({
                                        type: "report",
                                        title: object.attributes.title,
                                        keywords: object.attributes.keywords,
                                        date: object.attributes.publication_date,
                                        year: object.attributes.year,
                                        contributors: object.attributes.contributors,
                                        description: object.attributes.abstract,
                                        id: object.id
                                    });
                                }
                            }).then(function () {
                                var pubThesis = Parse.Object.extend("Pub_Thesis");
                                var query4 = new Parse.Query(pubThesis);
                                query4.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                                query4.descending("createdAt");
                                query4.find().then(function (thesis) {
                                    console.log("Successfully retrieved " + thesis.length + " thesis.");
                                    // Do something with the returned Parse.Object values
                                    for (var i = 0; i < thesis.length; i++) {
                                        var object = thesis[i];
                                        pubs.push({
                                            type: "thesis",
                                            title: object.attributes.title,
                                            keywords: object.attributes.keywords,
                                            date: object.attributes.publication_date,
                                            year: object.attributes.year,
                                            contributors: object.attributes.contributors,
                                            description: object.attributes.abstract,
                                            id: object.id
                                        });
                                    }
                                }).then(function () {
                                    var pubUnpublished = Parse.Object.extend("Pub_Unpublished");
                                    var query5 = new Parse.Query(pubUnpublished);
                                    query5.equalTo('user', {__type: "Pointer", className: "_User", objectId: profile});
                                    query5.descending("createdAt");
                                    query5.find().then(function (unpublished) {
                                        console.log("Successfully retrieved " + unpublished.length + " unpublished.");
                                        // Do something with the returned Parse.Object values
                                        for (var i = 0; i < unpublished.length; i++) {
                                            var object = unpublished[i];
                                            pubs.push({
                                                type: "unpublished",
                                                title: object.attributes.title,
                                                keywords: object.attributes.keywords,
                                                date: object.attributes.publication_date,
                                                year: object.attributes.year,
                                                contributors: object.attributes.contributors,
                                                description: object.attributes.abstract,
                                                id: object.id
                                            });
                                        }
                                    }).then(function (results) {
                                        var filteredPubs= _.groupBy(pubs,'type');
                                        res.json(filteredPubs);
                                    }, function(error) {
                                        console.log('Failed to retrive publications, with error code: ' + error.message);
                                        res.status(500).json({status: "Publication retrieval failed. " + error.message});
                                    });
                                })
                            })
                        })
                    })
                })
            })
        })
    });

    app.delete('/publication/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var pubClass = req.query.pub_class;
        console.log(pubClass)
        if (currentUser) {
            var Publication = Parse.Object.extend(pubClass);
            var query = new Parse.Query(Publication);
            query.get(req.params.objectId, {
                success: function(result) {
                    result.destroy({});
                    res.status(200).json({status:"OK"});
                },
                error: function(error) {
                    console.log(error);
                    res.status(500).json({status:"Query failed "+error.message});
                }
            });
        } else {
            res.status(403).json({status:"Couldn't delete publication"});
        }
    });

    app.post('/profile/:username/publication', function(req,res,next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;

            // set correct object and send to Parse
            var PubType = (reqBody.type == "Pub_Chapter" ? Parse.Object.extend("Pub_Book") : Parse.Object.extend(reqBody.type));
            var pub = new PubType();
            var pubClass = reqBody.type; // save field before being overwritten

            pub.set('contributors', JSON.parse(reqBody.collaborators));
            pub.set('abstract', reqBody.description);
            pub.set('filename', "");
            pub.set('keywords', JSON.parse(reqBody.keywords));
            pub.set('url', reqBody.url);
            pub.set('title', reqBody.title);
            pub.set('doi', reqBody.doi);
            pub.set('publication_date', new Date(reqBody.creationDate));
            pub.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});

            // add type-specific fields
            switch (reqBody.type) {
                case "Pub_Book":
                    pub.set('publisher', reqBody.book_publisher);
                    pub.set('isbn', reqBody.book_isbn);
                    pub.set('edition', reqBody.book_edition);
                    pub.set('page', reqBody.book_pages);
                    pub.set('type', "book");
                    break;
                case "Pub_Chapter":
                    pub.set('publisher', reqBody.book_publisher);
                    pub.set('isbn', reqBody.book_isbn);
                    pub.set('edition', reqBody.book_edition);
                    pub.set('page', reqBody.book_pages);
                    pub.set('chapter', reqBody.book_chapter);
                    pub.set('type', "chapter");
                    break;
                case "Pub_Conference":
                    pub.set('conference', reqBody.conf);
                    pub.set('volume', reqBody.conf_volume);
                    pub.set('location', reqBody.conf_location);
                    pub.set('type', "conference");
                    break;
                case "Pub_Journal_Article":
                    pub.set('journal', reqBody.journal);
                    pub.set('volume', reqBody.journal_volume);
                    pub.set('issue', reqBody.journal_issue);
                    pub.set('page', reqBody.journal_pages);
                    pub.set('type', "journal");
                    break;
                case "Pub_Patent":
                    pub.set('reference_number', reqBody.patent_refNum);
                    pub.set('location', reqBody.patent_location);
                    pub.set('type', "patent");
                    break;
                case "Pub_Report":
                    pub.set('publisher', reqBody.report_publisher);
                    pub.set('number', reqBody.report_number);
                    pub.set('location', reqBody.report_location);
                    pub.set('type', "report");
                    break;
                case "Pub_Thesis":
                    pub.set('university', reqBody.thesis_university);
                    pub.set('supervisors', reqBody.thesis_supervisors.split(/\s*,\s*/g));
                    pub.set('degree', reqBody.thesis_degree);
                    pub.set('department', reqBody.thesis_depart);
                    pub.set('page', reqBody.thesis_pages);
                    pub.set('type', "thesis");
                    break;
                case "Pub_Unpublished":
                    pub.set('location', reqBody.unpub_location);
                    pub.set('type', "unpublished");
                    break;
                default:
                    console.log("Warning: pub type not identified", reqBody.type);
            }
            var promises = [];
            if (req.body.file != null) {
                var fileName = "publication_file." + req.body.fileType;
                var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""), 'base64')
                var fileFile = new Parse.File(fileName, {base64: fileBuff});
                promises.push(fileFile.save().then(function () {
                    pub.set('file', fileFile)
                }));
            }
            return Parse.Promise.when(promises).then(function (res1, res2) {
                pub.save().then(function () {
                    res.json({status: "Success in creating data"})
                })
            }, function (error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.status(500).json({status: "Creating data object failed. " + error.message});
            });
        }
    });

    app.delete('/profile/:username/publications',function(req,res,next){
        var currentUser = req.user;
        if (currentUser && currentUser.username == req.params.username) {
            var pubId=req.body.id;
            console.log("ID is: "+pubId);
            var Publication = Parse.Object.extend("Publication");
            var query = new Parse.Query(Publication);
            query.equalTo("objectId", pubId);
            query.first({
                success: function(object) {
                    object.destroy().then(function() {
                        res.send(200);
                    });
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                    res.render("profile", {Error: 'No publication found!'});
                }
            });
        }
        else {
            res.render('profile', {Error: 'Deleting Publication Failed!'});
        }

    });


    app.post('/publication/:objectId/update',function(req,res,next){
        var query = new Parse.Query(req.body.pub_class); // xhange to req-bosy.type
        query.get(req.params.objectId,{
            success: function(result) {
                // everything in data form
                var keys = Object.keys(req.body);
                for (var i=0; i<keys.length; i++) {
                    if (keys[i] !== 'pub_class') {
                        if (keys[i] == ('publication_date')) {
                            result.set(keys[i], new Date(req['body'][keys[i]]));
                        // } else if (keys[i] == ('keywords') || keys[i] == ('contributors') || keys[i] == ('supervisors')) {
                        //     result.set(keys[i],JSON.parse(req['body'][keys[i]])); 
                        } else {
                            result.set(keys[i], req['body'][keys[i]]);
                        }
                    }
                }
                
                result.save(null, {
                    success:function(obj) {
                        console.log("Pub update successfully saved");
                        res.status(200).json({status:"OK", query: obj});
                    },
                    error:function(err) { 
                        console.log("Pub update not successfully saved", err);
                        // response.error();
                        res.status(500).json({status:"Error", msg: 'Could not update publication!' + err});
                    }
                    });
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
                res.status(500).json({status:"Error", msg: 'Could not update publication!' + error});
            }
        });
    });


};
