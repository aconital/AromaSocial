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

    app.get('/allpublications', function(req, res, next) {
        var currentUser = Parse.User.current();
        var query = new Parse.Query('Publication');
        query.find({
            success: function(items) {
                var results = [];
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
        });
    });


    /*******************************************
     *
     * PUBLICATION
     *
     ********************************************/
    app.get('/publication', function (req, res, next) {
        res.render('publication', {layout: 'home', title: 'Publication', path: req.path});
    });
    app.get('/publication/:objectId', function (req, res, next) {
        var currentUser = Parse.User.current();
        var query = new Parse.Query('Publication');
        query.get(req.params.objectId,{
            success: function(result) {
                res.render('publication', {layout: 'home', title: 'Publication', path: req.path,
                    currentUserId: currentUser.id,
                    currentUsername: currentUser.attributes.username,
                    currentUserImg: currentUser.attributes.imgUrl,
                    creatorId: result.get("user").id,
                    objectId: req.params.objectId,
                    title: result.get('title'),
                    author: result.get('author'),
                    description: result.get('description'),
                    filename: result.get('filename'),
                    license: result.get('license'),
                    keywords: JSON.stringify(result.get('keywords')),
                    publication_link: result.get('publication_link'),
                    groupies: result.get('groupies'),
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

        var User = Parse.Object.extend("User")
        var innerQuery = new Parse.Query(User);
        innerQuery.equalTo("username", req.params.username);

        var Publication = Parse.Object.extend("Publication");
        var query = new Parse.Query(Publication);
        query.matchesQuery("user", innerQuery);
        query.descending("createdAt");
        query.find({
            success: function(results) {
                console.log("Successfully retrieved " + results.length + " publications.");

                // Do something with the returned Parse.Object values
                var pubs=[];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];
                    pubs.push({
                        filename: object.attributes.filename,
                        title: object.attributes.title,
                        hashtags: object.attributes.hashtags,
                        date: object.createdAt,
                        year: object.attributes.year,
                        author: object.attributes.author,
                        description: object.attributes.description,

                        id: object.id
                    });


                }
                res.send(pubs);
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    });

    app.post('/profile/:username/publication', function(req,res,next){
        var currentUser = req.user;
		var linkUser = req.params.username;
		if(currentUser.username == linkUser) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);
			console.log(req.user.id);
            var reqBody = req.body;
			console.log("REQBODY", reqBody);
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
			console.log("past defaults");
            pub.set('user', {__type: "Pointer", className: "_User", objectId: req.user.id});

			// add type-specific fields
			switch (reqBody.type) {
				case "Pub_Book":
                	pub.set('publisher', reqBody.book_publisher);
                	pub.set('isbn', reqBody.book_isbn);
                	pub.set('edition', reqBody.book_edition);
                	pub.set('page', reqBody.book_pages);
					break;
				case "Pub_Chapter":
                	pub.set('publisher', reqBody.book_publisher);
                	pub.set('isbn', reqBody.book_isbn);
                	pub.set('edition', reqBody.book_edition);
                	pub.set('page', reqBody.book_pages);
				 	pub.set('chapter', reqBody.book_chapter);
					break;
				case "Pub_Conference":
                    pub.set('conference', reqBody.conf);
                    pub.set('volume', reqBody.conf_volume);
                    pub.set('location', reqBody.conf_location);
					break;
				case "Pub_Journal_Article":
                    pub.set('journal', reqBody.journal);
                    pub.set('volume', reqBody.journal_volume);
                    pub.set('issue', reqBody.journal_issue);
                    pub.set('page', reqBody.journal_pages);
					break;
				case "Pub_Patent":
                	pub.set('reference_number', reqBody.patent_refNum);
                	pub.set('location', reqBody.patent_location);
					break;
				case "Pub_Report":
                	pub.set('publisher', reqBody.report_publisher);
                	pub.set('number', reqBody.report_number);
                	pub.set('location', reqBody.report_location);
					break;
				case "Pub_Thesis":
                	pub.set('university', reqBody.thesis_university);
                	pub.set('supervisors', reqBody.thesis_supervisors.split(/\s*,\s*/g));
                	pub.set('degree', reqBody.thesis_degree);
                	pub.set('department', reqBody.thesis_depart);
                	pub.set('page', reqBody.thesis_pages);
					break;
				case "Pub_Unpublished":
                	pub.set('location', reqBody.unpub_location);
					break;
				default:
					console.log("Warning: pub type not identified", reqBody.type);
			}

            pub.save(null).then(function(response) {
				if (reqBody.file != null) {
					objectId = response.id;
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
				return {objectId: objectId};
            }).then(function(response) {
				// add entry into superclass
				/*var Publication = Parse.Object.extend("Publication");
				var publication = new Publication();

//					publication.set('groups',reqBody.groups);
//					publication.set('groupies', reqBody.groupies);
				publication.set('link', {__type: "Pointer", className: reqBody.type, objectId: response.objectId});
				publication.set('year',reqBody.creationDate.substring(0,4));
				publication.set('type',reqBody.type.replace("Pub_","").replace("_"," "));

				console.log("Saving publication superclass.");
				return publication.save(null);*/
				return response;
			}).then(function(response) {
				console.log(response);
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
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
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
        var query = new Parse.Query("Publication");
        query.get(req.params.objectId,{
            success: function(result) {
                if (req.body.title) {
                    result.set("title", req.body.title);
                    result.set("description", req.body.description);
                    result.set("year", req.body.publication_date);
                    result.set("filename", req.body.filename);
                    result.set("license", req.body.license);
                    result.set("publication_code", req.body.publication_code);
                    console.log(req.body.title);
                }
                else if (req.body.keywords) {result.set("keywords",JSON.parse(req.body.keywords)); }
                result.save();
            }
        });
    });



};
