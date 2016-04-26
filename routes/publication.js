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

module.exports=function(app,Parse) {

    // app.get('/allpublications', function(req, res, next) {
    //     var currentUser = req.user;
    //     var query = new Parse.Query('Publication');
    //     query.find({
    //         success: function(items) {
    //             var results = [];
    //             for (var i = 0; i < items.length; i++) {
    //                 var obj = items[i];
    //                 results.push(obj);
    //             }
    //             console.log("RESULTS ARE: ");
    //             console.log(results);
    //             res.send(results);
    //         },
    //         error: function(error) {
    //             console.log("Error while getting all publications");
    //         }
    //     });
    // });

    
    app.get('/allpublications', function(req, res, next) {
        var currentUser = req.user;
        var results = [];

        var query = new Parse.Query('Pub_Book');
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
        console.log(req.query,'\n\n');

        query.equalTo("objectId", req.params.objectId);
        query.find({
            success: function(result) {
                var pubObject = JSON.parse(JSON.stringify(result[0]));
                var userEnv = {updatePath: req.path,
                    publication_date: pubObject.publication_date.iso.slice(0,10),
                    user: pubObject.user.objectId}; //creatorId

                // merge the Parse object and fields for current user
                var rendered = _.extend(pubObject, userEnv);
                console.log("us", pubObject);

                res.status(200).json({status:"OK", query: pubObject});
            },
            error: function(error) {
                res.render('index', {title: 'Please Login!', path: req.path});
            }
        });
    });

    app.get('/publication/book/:objectId', is_auth, function (req, res, next) {
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Book');

        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: JSON.parse(JSON.stringify(result.get("user"))).objectId,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    contributors: JSON.stringify(result.get('contributors')),
                    author: result.get('author'),
                    abstract: result.get('abstract'),
                    filename: result.get('filename'),
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
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Conference',
                    publication_date: result.get('year'),
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
        var currentUser = req.user;
        var query = new Parse.Query('Pub_Journal_Article');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Journal_Article',
                    publication_date: result.get('year'),
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
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Patent',
                    publication_date: result.get('year'),
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
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    collaborators: JSON.stringify(result.get('collaborators')),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Report',
                    publication_date: result.get('year'),
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
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Thesis',
                    publication_date: result.get('year'),
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
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.username,
                    currentUserImg: currentUser.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    contributers: result.get('contributers'),
                    description: result.get('abstract'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
                    pub_class: 'Pub_Unpublished',
                    publication_date: result.get('year'),
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
        var pubs=[];
        var pubBooks = Parse.Object.extend("Pub_Book");
        var query = new Parse.Query(pubBooks);
        query.equalTo('user',{ __type: "Pointer", className: "_User", objectId: req.user.id});
        query.find().then(function(books) {
            console.log("Successfully retrieved " + books.length + " Books.");
            // Do something with the returned Parse.Object values
            for (var i = 0; i < books.length; i++) {
                var object = books[i];
                pubs.push({
                    type: "book",
                    filename: object.attributes.filename,
                    title: object.attributes.title,
                    hashtags: object.attributes.hashtags,
                    date: object.createdAt,
                    year: object.attributes.year,
                    contributers: object.attributes.contributers,
                    description: object.attributes.description,
                    id: object.id
                });
            }
        }).then(function() {
            var pubConference = Parse.Object.extend("Pub_Conference");
            var query1 = new Parse.Query(pubConference);
            query1.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
            query1.find().then(function (conferences) {
                console.log("Successfully retrieved " + conferences.length + " conferences.");
                // Do something with the returned Parse.Object values
                for (var i = 0; i < conferences.length; i++) {
                    var object = conferences[i];
                    pubs.push({
                        type: "conference",
                        filename: object.attributes.filename,
                        title: object.attributes.title,
                        hashtags: object.attributes.hashtags,
                        date: object.createdAt,
                        year: object.attributes.year,
                        contributers: object.attributes.contributers,
                        description: object.attributes.description,
                        id: object.id
                    });
                }
            }).then(function () {
                var pubJournal = Parse.Object.extend("Pub_Journal_Article");
                var query2 = new Parse.Query(pubJournal);
                query2.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
                query2.descending("createdAt");
                query2.find().then(function (journals) {
                    console.log("Successfully retrieved " + journals.length + " articles.");
                    // Do something with the returned Parse.Object values
                    for (var i = 0; i < journals.length; i++) {
                        var object = journals[i];
                        pubs.push({
                            type: "journal",
                            filename: object.attributes.filename,
                            title: object.attributes.title,
                            hashtags: object.attributes.hashtags,
                            date: object.createdAt,
                            year: object.attributes.year,
                            contributers: object.attributes.contributers,
                            description: object.attributes.description,
                            id: object.id
                        });
                    }
                }).then(function () {
                    var pubPatent = Parse.Object.extend("Pub_Patent");
                    var query3 = new Parse.Query(pubPatent);
                    query3.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
                    query3.find().then(function (patents) {
                        console.log("Successfully retrieved " + patents.length + " patents.");
                        // Do something with the returned Parse.Object values
                        for (var i = 0; i < patents.length; i++) {
                            var object = patents[i];
                            pubs.push({
                                type: "patent",
                                filename: object.attributes.filename,
                                title: object.attributes.title,
                                hashtags: object.attributes.hashtags,
                                date: object.createdAt,
                                year: object.attributes.year,
                                contributers: object.attributes.contributers,
                                description: object.attributes.description,
                                id: object.id
                            });
                        }
                    }).then(function () {
                        var pubReport = Parse.Object.extend("Pub_Report");
                        var query4 = new Parse.Query(pubReport);
                        query4.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
                        query4.find().then(function (reports) {
                            console.log("Successfully retrieved " + reports.length + " reports.");
                            // Do something with the returned Parse.Object values
                            for (var i = 0; i < reports.length; i++) {
                                var object = reports[i];
                                pubs.push({
                                    type: "report",
                                    filename: object.attributes.filename,
                                    title: object.attributes.title,
                                    hashtags: object.attributes.hashtags,
                                    date: object.createdAt,
                                    year: object.attributes.year,
                                    contributers: object.attributes.contributers,
                                    description: object.attributes.description,
                                    id: object.id
                                });
                            }
                        }).then(function () {
                            var pubThesis = Parse.Object.extend("Pub_Thesis");
                            var query4 = new Parse.Query(pubThesis);
                            query4.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
                            query4.find().then(function (thesis) {
                                console.log("Successfully retrieved " + thesis.length + " thesis.");
                                // Do something with the returned Parse.Object values
                                for (var i = 0; i < thesis.length; i++) {
                                    var object = thesis[i];
                                    pubs.push({
                                        type: "thesis",
                                        filename: object.attributes.filename,
                                        title: object.attributes.title,
                                        hashtags: object.attributes.hashtags,
                                        date: object.createdAt,
                                        year: object.attributes.year,
                                        contributers: object.attributes.contributers,
                                        description: object.attributes.description,
                                        id: object.id
                                    });
                                }
                            }).then(function () {
                                var pubUnpublished = Parse.Object.extend("Pub_Unpublished");
                                var query5 = new Parse.Query(pubUnpublished);
                                query5.equalTo('user', {__type: "Pointer", className: "_User", objectId: req.user.id});
                                query5.find().then(function (unpublished) {
                                    console.log("Successfully retrieved " + unpublished.length + " unpublished.");
                                    // Do something with the returned Parse.Object values
                                    for (var i = 0; i < unpublished.length; i++) {
                                        var object = unpublished[i];
                                        pubs.push({
                                            type: "unpublished",
                                            filename: object.attributes.filename,
                                            title: object.attributes.title,
                                            hashtags: object.attributes.hashtags,
                                            date: object.createdAt,
                                            year: object.attributes.year,
                                            contributers: object.attributes.contributers,
                                            description: object.attributes.description,
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
    });

    app.post('/profile/:username/publication', function(req,res,next){
        var currentUser = req.user;
        if (currentUser.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);
            var reqBody = req.body;

            // set correct object and send to Parse
            var PubType = (reqBody.type == "Pub_Chapter" ? Parse.Object.extend("Pub_Book") : Parse.Object.extend(reqBody.type));
            var pub = new PubType();

            pub.set('contributors',reqBody.collaborators.split(/\s*,\s*/g));
            pub.set('abstract',reqBody.description);
            pub.set('filename',"");
            pub.set('keywords',reqBody.keywords.split(/\s*,\s*/g));
            pub.set('url',reqBody.url);
            pub.set('title',reqBody.title);
			pub.set('doi',reqBody.doi);
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

            pub.save(null).then(function(response) {
				objectId = response.id;
				if (reqBody.file != null) {
					// encode file
					var params = awsUtils.encodeFile(req.params.username, objectId, reqBody.file, reqBody.fileType, "_pub_");

					// upload files to S3
					var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
					bucket.putObject(params, function (err, response) {
						if (err) { console.log("Data Upload Error:", err); }
						else {
							// update file name in parse object
							pub.set('filename', awsLink + params.Key);
							console.log("S3 uploaded successfully, saving new path.");
							return {objectId: objectId, data: pub.save(null)};
						}
					});
				}
				console.log("Publication type saved successfully.");
				return {objectId: response.id};
            }).then(function(response) {
				// add entry into superclass
				var Publication = Parse.Object.extend("Publication");
				var publication = new Publication();

//				publication.set('groups',reqBody.groups);
//				publication.set('groupies', reqBody.groupies);
				publication.set('link', {__type: "Pointer", className: reqBody.type, objectId: response.objectId});
				publication.set('year',reqBody.creationDate.substring(0,4));
				publication.set('type',reqBody.type.replace("Pub_","").replace("_"," "));

				console.log("Saving publication superclass.");
				return publication.save(null);
			}).then(function(response) {
				console.log("Publication created successfully.");
				res.status(200).json({status:"OK", query: response});
			}, function(error) {
				console.log('Failed to create new publication object, with error code: ' + error.message);
				res.status(500).json({status: "Creating publication failed. " + error.message});
			});

        } else {
            res.status(500).json({status: 'Publication upload failed!'});
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
                    console.log(req.params);
                    console.log(req.body);
        var query = new Parse.Query(req.body.pub_class); // xhange to req-bosy.type
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    // everything in data form
                    var keys = Object.keys(req.body);
                    console.log(keys);
                    for (var i=0; i<keys.length; i++) {
                        console.log(keys[i], req['body'][keys[i]]);
                        if (keys[i] !== 'pub_class') {
                            if (keys[i] == ('publication_date')) {
                                result.set(keys[i], new Date(req['body'][keys[i]]));
                            // } else if (keys[i] == ('collaborators' || 'keywords') && typeof req['body'][keys[i]] === 'string') {
                            //     result.set(keys[i], req['body'][keys[i]].split(/\s*,\s*/g));
                            } else {
                                result.set(keys[i], req['body'][keys[i]]);
                            }
                        }
                    }
                    // result.set("title", req.body.title);
                    // result.set("abstract", req.body.abstract);
                    // result.set("year", req.body.publication_date);
                    // result.set("filename", req.body.filename);
                    // result.set("license", req.body.license);
                    // result.set("publication_code", req.body.publication_code);
                }
                else if (req.body.keywords) {result.set("keywords",JSON.parse(req.body.keywords)); }
                result.save(null, {
                    success:function(obj) {
                        console.log("Successfully saved");
                        res.status(200).json({status:"OK", query: obj});
                    },
                    error:function(err) { 
                        console.log("Not successfully saved", err);
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

    /************************************
     * HELPER FUNCTIONS
     *************************************/
    function is_auth(req,res,next){

        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else { res.locals.user = req.user;
            res.locals.user = req.user;
            next();
        }
    };
};
