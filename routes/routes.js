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

module.exports=function(app,Parse) {
  /*******************************************
   *
   * HOME PAGE
   *
   ********************************************/
  app.get('/', function(req, res, next) {
        res.render('home', {user: req.user});
  });


    /*******************************************
     *
     * NEWS FEED
     *
     ********************************************/
  app.get('/newsfeeddata', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          var NewsFeed = Parse.Object.extend("NewsFeed");

          // pub query
          var query = new Parse.Query(NewsFeed);
          query.include("pubId");
          query.include("modId");
          query.include("dataId");
          query.include('from');
          query.descending("createdAt");

          // mod query
          // var mquery = new Parse.Query(NewsFeed);
          // mquery.include();
          query.find({
              success: function(results) {
                  console.log("Successfully retrieved " + results.length + " feed.");
                  // Do something with the returned Parse.Object values
                  var feeds=[];
                  for (var i = 0; i < results.length; i++) {
                      var object = results[i];

                      var username = "N/A";
                      var userImg = "";
                      if(object.attributes.from!=null) {
                           username = object.attributes.from.attributes.username;
                           fullname = object.attributes.from.attributes.fullname;
                           userImg = object.attributes.from.attributes.imgUrl;
                      }


                      var  type=object.attributes.type;
                      var  date=object.createdAt;

                      if(type == "pub") {

                            if(object.attributes.pubId!=null){

                          if (object.attributes.pubId.attributes != null) {


                              var pubItem = object.attributes.pubId.attributes;

                              console.log("PUB ATTRIBUTES: ");
                              console.log(object.attributes);

                              var filename ="";
                              var title ="";
                              var hashtags ="";
                              var year ="";
                              var author ="";
                              var description ="";
                              var itemId = pubItem.objectId;
                              var objectId = object.attributes.pubId;

                              if (pubItem.filename != null) {
                                  filename = pubItem.filename;
                              }
                              if (pubItem.title != null) {
                                  title = pubItem.title;
                              }
                              if (pubItem.hashtags != null) {
                                  hashtags = pubItem.hashtags;
                              }
                              if (pubItem.year != null) {
                                  year = pubItem.year;
                              }
                              if (pubItem.author != null) {
                                  author = pubItem.author;
                              }
                              if (pubItem.description != null) {
                                  description = pubItem.description;
                              }
                              feeds.push({
                                  itemId: itemId,
                                  fullname: fullname,
                                  username: username,
                                  userImg: userImg,
                                  type:type,
                                  date:date,
                                  filename: filename,
                                  description: description,
                                  author: author,
                                  year: year,
                                  hashtags: hashtags,
                                  title: title,
                                  objId: objectId
                              });
//                              console.log(itemId);
                          }
                      }
                      }

                    else if(type == "mod") {
                        if (object.attributes.modId != null && object.attributes.modId.attributes != null) {
                          var modItem = object.attributes.modId.attributes;

                          var filename ="";
                          var title ="";
                          var hashtags ="";
                          var year ="";
                          var author ="";
                          var description ="";
                          var objectId = object.attributes.modId;

                          if (modItem.filename != null) {
                            filename = modItem.filename;
                          }
                          if (modItem.title != null) {
                              title = modItem.title;
                          }
                          if (modItem.hashtags != null) {
                              hashtags = modItem.hashtags;
                          }
                          if (modItem.year != null) {
                              year = modItem.year;
                          }
                          if (modItem.author != null) {
                              author = modItem.author;
                          }
                          if (modItem.description != null) {
                              description = modItem.description;
                          }

                          feeds.push({
                            username: username,
                            userImg: userImg,
                            type:type,
                            date:date,
                            filename: filename,
                            description: description,
                            author: author,
                            year: year,
                            hashtags: hashtags,
                            title: title,
                            objId: objectId
                          });

                        }
                    }
                    else if (type == "data") {
                          if (object.attributes.dataId != null && object.attributes.dataId.attributes != null) {
                          var dataItem = object.attributes.dataId.attributes;

                          var filename ="";
                          var title ="";
                          var hashtags ="";
                          var year ="";
                          var author ="";
                          var description ="";
                          var objectId = object.attributes.dataId;

                          if (dataItem.filename != null) {
                            filename = modItem.filename;
                          }
                          if (dataItem.title != null) {
                              title = modItem.title;
                          }
                          if (dataItem.hashtags != null) {
                              hashtags = modItem.hashtags;
                          }
                          if (dataItem.year != null) {
                              year = modItem.year;
                          }
                          if (dataItem.author != null) {
                              author = modItem.author;
                          }
                          if (dataItem.description != null) {
                              description = modItem.description;
                          }

                          feeds.push({
                            username: username,
                            userImg: userImg,
                            type:type,
                            date:date,
                            filename: filename,
                            description: description,
                            author: author,
                            year: year,
                            hashtags: hashtags,
                            title: title,
                            objId: objectId
                          });

                        }
                    }

                  }

                  res.send(feeds);
              },
              error: function(error) {
                  console.log("Error: " + error.code + " " + error.message);
              }
          });
      } else {
          res.render('index', {title: 'Login failed', path: req.path});
      }

});

 app.get('/newsfeed', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          console.log(currentUser);
          res.render('newsfeed', {layout:'home',
                                  title: 'Website',
                                  currentUserId: currentUser.id,
                                  currentUsername: currentUser.attributes.username,
                                  currentUserImg: currentUser.attributes.imgUrl});
      } else {
          res.render('index', {title: 'Login failed', path: req.path});
      }
});

    app.post('/newsfeed', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            var NewsFeed = Parse.Object.extend("NewsFeed");
            var newsFeed= new NewsFeed();
            newsFeed.set('from',currentUser);
            newsFeed.set('content',req.body.content);
            newsFeed .save(null, {
                success: function(newsfeed) {
                    // Execute any logic that should take place after the object is saved.
                    res.render('newsfeed', {title: 'NewsFeed', userId: currentUser.id,
                                                               username: currentUser.attributes.username,
                                                               currentUserImg: currentUser.attributes.imgUrl});
                },
                error: function(newsfeed, error) {
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and message.
                    alert('Failed to create new object, with error code: ' + error.message);
                    res.render('newsfeed', {title: 'NewsFeed', msg: 'Posting content failed!'});
                }
            });


        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }

    });

/*******************************************
 *
 * ORGANIZATION
 *
********************************************/
app.get('/organization', function (req, res, next) {
    res.render('organization', {layout: 'home', title: 'Organization', path: req.path});
});
app.get('/organization/:objectId', function (req, res, next) {
  var currentUser = Parse.User.current();
  var query = new Parse.Query('Organization');
  query.get(req.params.objectId,{
    success: function(result) {
      res.render('organization', {layout: 'home', title: 'Organization', path: req.path,
        currentUsername: currentUser.attributes.username,
        currentUserImg: currentUser.attributes.imgUrl,
        objectId: req.params.objectId,
        name: result.get('name'),
        about: result.get('about'),
        location: result.get('location'),
        organization_imgURL: result.get('profile_imgURL')
      });
    },
    error: function(error) {
      res.render('index', {title: 'Please Login!', path: req.path});
    }
  });
});

    //Done by Hirad
    //not doing it in REACT
    //getting People of org here and pass it to view
    app.get('/organization/:objectId/people', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.include('userId');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId.attributes;

                    var username= user.username;
                    var fullname="N/A";
                    var company= "N/A";
                    var work_title= "N/A";
                    var userImgUrl= "/images/user.png";
                    var work_experience= [];

                    if(user.hasOwnProperty('fullname')){
                        fullname=user.fullname;
                    }
                    if(user.hasOwnProperty('imgUrl')){
                        userImgUrl=user.imgUrl;
                    }
                    //getting first work experience, since there is no date on these objects
                    if(user.hasOwnProperty('work_experiences')){
                        var work_experience= user.work_experience[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }

                    //only show people who are verified by admin
                    if(verified)
                    {
                        var person = {
                            username:username,
                            title: title,
                            fullname: fullname,
                            userImgUrl: userImgUrl,
                            company: company,
                            workTitle: work_title
                        };
                        people.push(person);

                    }

                }
                var filtered_people=  _.groupBy(people,'title');
                res.json(filtered_people);

            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    //Done by Hirad
    //not doing it in REACT
    //getting pending requests for People of org here and pass it to view
    app.get('/organization/:objectId/pending', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.equalTo('verified',false)
        query.include('userId');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId.attributes;

                    var username= user.username;
                    var fullname="N/A";
                    var company= "N/A";
                    var work_title= "N/A";
                    var userImgUrl= "/images/user.png";
                    var work_experience= [];
                    var id = result[uo].attributes.userId.id;
                    if(user.hasOwnProperty('fullname')){
                        fullname=user.fullname;
                    }
                    if(user.hasOwnProperty('imgUrl')){
                        userImgUrl=user.imgUrl;
                    }
                    //getting first work experience, since there is no date on these objects
                    if(user.hasOwnProperty('work_experience')){
                        var work_experience= user.work_experience[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }

                    //only show people who are verified by admin
                    if(!verified)
                    {
                        var person = {
                            id : id,
                            username:username,
                            title: title,
                            fullname: fullname,
                            userImgUrl: userImgUrl,
                            company: company,
                            workTitle: work_title
                        };
                        people.push(person);

                    }

                }
                res.json(people);

            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.post('/organization/:objectId/pending', function (req, res, next) {
        var person= req.body.person;
        var orgId= req.params.objectId;
        var mode= req.body.mode;


            var innerQuery = new Parse.Query("Organization");
            innerQuery.equalTo("objectId",orgId);

            var innerQuery2 = new Parse.Query(Parse.User);
            innerQuery2.equalTo("objectId",person.id);

            var query = new Parse.Query('Relationship');
            query.matchesQuery("orgId",innerQuery)
            query.matchesQuery("userId",innerQuery2)
            query.equalTo('verified',false)
            query.include('userId');
            query.first({
                success: function(result) {
                    if(mode=="approve")
                    {
                        result.set("verified",true);
                        result.save(null, {
                            success:function(){
                                res.json({scucess:"approved"});
                            },
                            error:function(error){
                                res.json({error:error});
                            }
                        });
                    }
                    else if(mode=="deny")
                    {
                        result.destroy({
                            success: function(model, response){
                                res.json({scucess:"denied"});
                            },
                            error: function(model, response){
                                res.json({error:error});
                            }
                        });
                    }
                },
                error: function(error) {
                    console.log(error);
                    res.render('index', {title: error, path: req.path});
                }
            });


    });
    app.get('/organization/:objectId/connections', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('RelationshipOrg');
        query.matchesQuery("orgId0",innerQuery)
        query.include('orgId1');
        query.find({
            success: function(result) {
                var orgs =[];
                for(var uo in result)
                {

                    var verified= result[uo].attributes.verified;

                    var connected_orgs= result[uo].attributes.orgId1.attributes;

                    var orgId= result[uo].attributes.orgId1.id;

                    var name= "N/A";
                    var location= "N/A";
                    var orgImgUrl= "/images/organization.png";

                    if(connected_orgs.hasOwnProperty('name')){
                        name=connected_orgs.name;
                    }
                    if(connected_orgs.hasOwnProperty('location')){
                        location=connected_orgs.location;
                    }
                    if(connected_orgs.hasOwnProperty('profile_imgURL')){
                        orgImgUrl=connected_orgs.profile_imgURL;
                    }

                    //only show people who are verified by admin
                    if(verified)
                    {
                        var org = {
                            orgId:orgId,
                            name:name,
                            location: location,
                            orgImgUrl: orgImgUrl,
                        };
                        orgs.push(org);

                    }

                }

                res.json(orgs);

            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
            }
        });
    });
    app.get('/organization/:objectId/admins', function (req, res, next) {

        var admins=[];
        var innerQuery = new Parse.Query("Organization");
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('Relationship');
        query.matchesQuery("orgId",innerQuery)
        query.equalTo("isAdmin",true)
        query.include('userId');
        query.find({
            success: function (result) {
                    if(result!=null)
                    {
                        for (var i = 0; i < result.length; i++) {
                            var object = result[i];
                            var admin = {
                                username: object.attributes.userId.attributes.username
                            };
                            admins.push(admin);
                        }
                    }
                         res.json(admins);
                },
                error: function (error) {
                    console.log(error);
                    res.render('index', {title: error, path: req.path});
                }
            });
    });

    app.get('/create/organization', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            console.log(currentUser);
            res.render('organization',
                       {layout:'home', currentUsername: currentUser.attributes.username,
                        currentUserImg: currentUser.attributes.imgUrl, isCreate: true});
        } else {
            res.render('index', {title: 'Login failed', path: req.path});
        }
    });
    app.post('/create/organization', function (req, res, next) {
		var currentUser = Parse.User.current();
		if (currentUser) {
			var Organization = Parse.Object.extend("Organization");
			var org = new Organization();
			org.set('cover_imgURL', '/images/organization.png');
			org.set('name', req.body.name);
			org.set('location', req.body.location);
			org.set('about', req.body.description);

			org.save(null, {
				success: function(response) {
					objectId = response.id;
					// encode file
					var params = awsUtils.encodeFile(req.body.name, objectId, req.body.picture, req.body.pictureType, "_org_");

					// upload files to S3
					var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
					bucket.putObject(params, function (err, response) {
						if (err) { console.log("Data Upload Error:", err); }
						else {
							console.log('uploading to s3');
							// update file name in parse object
							org.set('profile_imgURL', awsLink + params.Key);

							org.save(null, {
								success: function(data) {
									console.log("Path name updated successfully.");

									var Relationship = Parse.Object.extend("Relationship");
									var relation = new Relationship();
									relation.set('userId', currentUser);
									relation.set('orgId', { __type: "Pointer", className: "Organization", objectId: objectId });
									relation.set('isAdmin', true);
									relation.set('verified', false);
									relation.set('title', 'TODO');

									relation.save(null, {
										success: function(result) {
											console.log("Organization created successfully.");
											res.status(200).json({status:"OK", location: objectId});
										},
										error: function(result, error) {
											console.log('Failed to create organization, with error code: ' + error.message);
											res.status(500).json({status:"Uploading file failed." + error.message});
										}
									});
								},
								error: function(data, error) {
									console.log('Failed to update new object path, with error code: ' + error.message);
									res.status(500).json({status:"Uploading file failed." + error.message});
								}
							});
						}
					});
				},
				error: function(response, error) {
					console.log('Failed to create new object, with error code: ' + error.message);
					res.status(500).json({status: "Creating org object failed. " + error.message});
				}
			});
		} else {
            res.status(403).json({status:"Please login!"});
        }
    });
/*******************************************
 *
 * PROFILE
 *
********************************************/
app.get('/profile/:username', function (req, res, next) {
  var currentUser = Parse.User.current();
  var linkUser = req.params.username;
  if (currentUser) {
    if(currentUser.attributes.username == linkUser) {
      res.render('profile', {layout: 'home', title: 'Profile', path: req.path,
        currentUsername: currentUser.attributes.username,
        objectId: currentUser.id,
        currentUserImg: currentUser.attributes.imgUrl,
        username: currentUser.attributes.username,
        email: currentUser.attributes.email,
        fullname: currentUser.attributes.fullname,
        about: currentUser.attributes.about,
        position: currentUser.attributes.position,
        location: currentUser.attributes.location,
        summary: currentUser.attributes.summary,
        expertise: JSON.stringify(currentUser.attributes.expertise),
        interests: JSON.stringify(currentUser.attributes.interests),
        work_experiences: JSON.stringify(currentUser.attributes.work_experiences),
        educations: JSON.stringify(currentUser.attributes.educations),
        projects: JSON.stringify(currentUser.attributes.projects),
        profile_imgURL: currentUser.attributes.imgUrl,
        'isMe': true
      });
    }
    else {
      var query = new Parse.Query(Parse.User);
      query.equalTo("username",linkUser); query.limit(1);
      query.find({
        success: function(result) {
          res.render('profile', {layout: 'home', title: 'Profile', path: req.path,
            currentUsername: currentUser.attributes.username,
            currentUserImg: currentUser.attributes.imgUrl,
            username: result[0].attributes.username,
            objectId: result[0].id,
            email: result[0].attributes.email,
            fullname: result[0].attributes.fullname,
            about: result[0].attributes.about,
            position: result[0].attributes.position,
            location: result[0].attributes.location,
             summary: result[0].attributes.summary,
             expertise: JSON.stringify(result[0].attributes.expertise),
             interests: JSON.stringify(result[0].attributes.interests),
             work_experiences: JSON.stringify(result[0].attributes.work_experiences),
             educations: JSON.stringify(result[0].attributes.educations),
             projects: JSON.stringify(result[0].attributes.projects),
            profile_imgURL: result[0].attributes.imgUrl,
            'isMe': false
          });
        },
        error: function(error) {
          res.redirect('/newsfeed');
        }
      });
    }
  } else {
    res.render('index', {title: 'Please Login!', path: req.path});
  }
});

    app.get('/profile/:objectId/connections', function (req, res, next) {
        // var currentUser = Parse.User.current();

        var innerQuery = new Parse.Query(Parse.User);
        innerQuery.equalTo("objectId",req.params.objectId);

        var query = new Parse.Query('RelationshipUser');
        query.matchesQuery("userId0",innerQuery)
        query.include('userId1');
        query.find({
            success: function(result) {
                var people =[];
                for(var uo in result)
                {
                    var title= result[uo].attributes.title;
                    var verified= result[uo].attributes.verified;

                    var user= result[uo].attributes.userId1.attributes;

                    var username= user.username;
                    var fullname="N/A";
                    var company= "N/A";
                    var work_title= "N/A";
                    var userImgUrl= "/images/user.png";
                    var work_experience= [];

                    if(user.hasOwnProperty('fullname')){
                        fullname=user.fullname;
                    }
                    if(user.hasOwnProperty('imgUrl')){
                        userImgUrl=user.imgUrl;
                    }
                    //getting first work experience, since there is no date on these objects
                    if(user.hasOwnProperty('work_experiences')){
                        var work_experience= user.work_experiences[0];
                        company= work_experience.company;
                        work_title= work_experience.title;
                    }

                    //only show people who are verified by admin
                    if(verified)
                    {
                        var person = {
                            username:username,
                            title: title,
                            fullname: fullname,
                            userImgUrl: userImgUrl,
                            company: company,
                            workTitle: work_title
                        };
                        people.push(person);

                    }

                }
                var filtered_people=  _.groupBy(people,'title');
                res.json(filtered_people);


            },
            error: function(error) {
                console.log(error);
                res.render('index', {title: error, path: req.path});
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
        author: result.get('author'),
        description: result.get('description'),
        filename: result.get('filename'),
        hashtags: result.get('hashtags'),
        title: result.get('title'),
        year: result.get('year'),
        groups: result.get('groups'),
        license: result.get('license'),
        keywords: result.get('keywords'),
        publication_link: result.get('publication_link')
      });
    },
    error: function(error) {
      res.render('index', {title: 'Please Login!', path: req.path});
    }
  });
});

/*******************************************
 *
 * DATA
 *
********************************************/
app.get('/data', function (req, res, next) {
    res.render('data', {layout: 'home', title: 'Data', path: req.path});
});
app.get('/data/:objectId', function (req, res, next) {
  var currentUser = Parse.User.current();
  var query = new Parse.Query('Data');
  query.get(req.params.objectId,{
    success: function(result) {
      res.render('data', {layout: 'home', title: 'Data', path: req.path,
        currentUserId: currentUser.id,
        currentUsername: currentUser.attributes.username,
        currentUserImg: currentUser.attributes.imgUrl,
        objectId: req.params.objectId,
        creatorId: result.get("user").id,
        access: result.get('author'),
        collaborators: result.get('collaborators'),
        description: result.get('description'),
        hashtags: result.get('hashtags'),
        keywords: result.get('title'),
        title: result.get('title'),
        license: result.get('license'),
        keywords: result.get('keywords'),
        createdAt: result.get('createdAt'),
        image_URL: result.get('image_URL'),
        aws_path: result.get('path'),
        publication: result.get('publication'),
        publication_link: result.get('publication_link')
      });
    },
    error: function(error) {
      res.render('index', {title: 'Please Login!', path: req.path});
    }
  });
});

/*******************************************
 *
 * MODEL
 *
********************************************/
app.get('/model', function (req, res, next) {
    res.render('model', {layout: 'home', title: 'Model', path: req.path});
});
app.get('/model/:objectId', function (req, res, next) {
  var currentUser = Parse.User.current();
  var query = new Parse.Query('Model');
  query.get(req.params.objectId,{
    success: function(result) {
      res.render('model', {layout: 'home', title: 'Model', path: req.path,
        currentUserId: currentUser.id,
        currentUsername: currentUser.attributes.username,
        currentUserImg: currentUser.attributes.imgUrl,
        objectId: req.params.objectId,
        creatorId: result.get("user").id,
        access: result.get('access'),
        description: result.get('abstract'),
        feature: result.get('feature'),
        other: result.get('other'),
        hashtags: result.get('hashtags'),
        title: result.get('title'),
        image: result.get('image'),
        image_URL: result.get('image_URL'),
        collaborators: result.get('collaborators'),
        license: result.get('license'),
        keywords: result.get('keywords'),
        createdAt: result.get('createdAt'),
        publication_link: result.get('publication_link')
      });
    },
    error: function(error) {
      res.render('index', {title: 'Please Login!', path: req.path});
    }
  });
});


    app.post('/profile/:username',function(req,res,next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var name;
            var email;

            //upload publication
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                name=fields.inputname;
                email=fields.inputemail;
            });
            form.on('end', function(fields, files) {
                if(name !=null)
                currentUser.set("fullname",name);
                if(email !=null)
                currentUser.set("email",email);
                currentUser.save();
                res.render('profile', {layout: 'home', title: 'Profile', username: currentUser.attributes.username, 'isMe': true, currentUserImg:currentUser.attributes.imgUrl,
                  userImg:currentUser.attributes.imgUrl, fullname:currentUser.attributes.fullname, email: currentUser.attributes.email});
            });
        }else {
            res.render('profile', {Error: 'Profile Update Failed!'});
        }
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
                      title:object.attributes.title,
                      hashtags:object.attributes.hashtags,
                      date:object.createdAt,
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
    var currentUser = Parse.User.current();
    if (currentUser && currentUser.attributes.username == req.params.username) {
        var objectId;
        var now = moment();
        var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
        console.log(formatted);

        var reqBody = req.body;

        // send to Parse
        var Publication = Parse.Object.extend("Publication");
        var pub = new Publication();

        pub.set('user',currentUser);
        pub.set('author',reqBody.author);
        pub.set('description',reqBody.description);
        pub.set('filename',"");
        pub.set('groups',reqBody.groups);
        pub.set('hashtags',reqBody.hashtags);
        pub.set('keywords',reqBody.keywords);
        pub.set('license',reqBody.license);
        pub.set('publication_link',reqBody.publication_link);
        pub.set('title',reqBody.title);
        pub.set('year',reqBody.publishDate.substring(0,4));

        pub.save(null, {
          success: function(response) {
            objectId = response.id;
            // encode file
            var params = awsUtils.encodeFile(req.params.username, objectId, reqBody.file, reqBody.fileType, "_pub_");

            // upload files to S3
            var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
            bucket.putObject(params, function (err, response) {
                if (err) { console.log("Data Upload Error:", err); }
                else {
                    console.log('uploading to s3');

                    // update file name in parse object
                    pub.set('filename', awsLink + params.Key);

                    pub.save(null, {
                      success: function(data) {
                        console.log("Path name updated successfully.");
                        res.status(200).json({status:"OK", query: data});
                      },
                      error: function(data, error) {
                        console.log('Failed to update new object path, with error code: ' + error.message);
                        res.status(500).json({status:"Uploading file failed." + error.message});
                      }
                    });
                }
            });
          },
          error: function(response, error) {
              console.log('Failed to create new object, with error code: ' + error.message);
              res.status(500).json({status: "Creating pub object failed. " + error.message});
          }
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

    app.post('/profile/:username/data',function(req,res,next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            console.log(formatted);

            var reqBody = req.body;

            // send to Parse
			var keywords = reqBody.keywords.split(/\s*,\s*/g);
			var collaborators = reqBody.collaborators.split(/\s*,\s*/g);
			var Data = Parse.Object.extend("Data");
			var data= new Data();
			console.log(keywords);
			console.log(collaborators);
			data.set('user',currentUser);
			data.set('access', ["UBC"]);
			data.set('collaborators',collaborators);
			data.set('description', reqBody.description);
			data.set('title',reqBody.title);
			data.set('hashtags',keywords); // TODO are they the same?
			data.set('keywords',keywords);
			data.set('image_URL','/images/blackpaper.png');
			data.set('license',reqBody.license);
			data.set('path',"TODO");
//			data.set('publication',reqBody.pubLink); // TODO takes pointer to Publication obj
			data.set('number_cited',0);
			data.set('number_syncholar_factor',0);

			console.log(data);

			data.save(null, {
			  success: function(response) {
				  // Execute any logic that should take place after the object is saved.
				  objectId = response.id;
				// encode file
				var s3Key = req.params.username + "_" + objectId + "." + reqBody.fileType;
				var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
				var fileBuff = new Buffer(reqBody.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
				var params = {
					Key: s3Key,
					Body: fileBuff,
					ContentEncoding: 'base64',
					ContentType: (contentType ? contentType[1] : 'text/plain')
				};

				// upload files to S3
				var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });
				bucket.putObject(params, function (err, response) {
					if (err) { console.log("Data Upload Error:", err); }
					else {
						console.log('uploading to s3');

						// update file name in parse object
						data.set('path', awsLink + s3Key);

						data.save(null, {
                          success: function(data) {
                            console.log("Path name updated successfully.");
                            res.status(200).json({status:"OK", query: data});
                          },
                          error: function(data, error) {
                            console.log('Failed to update new object path, with error code: ' + error.message);
                            res.status(500).json({status:"Uploading file failed." + error.message});
                          }
                        });
					}
				});
			  },
			  error: function(response, error) {
				  console.log('Failed to create new object, with error code: ' + error.message);
                  res.status(500).json({status: "Creating data object failed. " + error.message});
			  }
			});

        } else {
            res.status(500).json({status: 'Data upload failed!'});
        }
    });

    app.post('/publication/:objectId/update',function(req,res,next){
        var query = new Parse.Query("Publication");
        query.get(req.params.objectId,{
            success: function(result) {
                result.set("title", req.body.title);
                result.set("description", req.body.description);
                console.log(req.body.title);
                console.log(req.body.description);
                result.save();
            }
        });
    });

    app.post('/model/:objectId/update',function(req,res,next){
        var query = new Parse.Query("Model");
        query.get(req.params.objectId,{
            success: function(result) {
                result.set("title", req.body.title);
                result.set("abstract", req.body.description);
                result.set("feature", req.body.feature);
                result.set("other", req.body.other);
                console.log(req.body.title);
                console.log(req.body.description);
                console.log(req.body.feature);
                console.log(req.body.other);
                result.save();
            }
        });
    });

    app.post('/data/:objectId/update',function(req,res,next){
        var query = new Parse.Query("Data");
        query.get(req.params.objectId,{
            success: function(result) {
                result.set("title", req.body.title);
                result.set("description", req.body.description);
                console.log(req.body.title);
                console.log(req.body.description);
                result.save();
            }
        });
    });

    app.post('/data/:objectId/picture',function(req,res,next){
       var query = new Parse.Query("Data");
       query.get(req.params.objectId,{
           success: function(result) {
               var bucket = new aws.S3();

               var s3KeyP = req.params.objectId + "_data_picture_" + req.body.randomNumber + "." + req.body.pictureType;
               var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
               var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
               var pictureParams = {
                   Bucket: 'syncholar',
                   Key: s3KeyP,
                   Body: pictureBuff,
                   ContentEncoding: 'base64',
                   ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
               };

               bucket.putObject(pictureParams, function (err, data) {
                   if (err) { console.log("Profile Picture (Image) Upload Error:", err); }
                   else {
                       console.log('Uploaded Image to S3!');
                       result.set("image_URL",awsLink + s3KeyP);
                       result.save();
                       res.status(200).json({status: "Picture Uploaded Successfully!"});
                   }
               });
           }
       });
   });

    app.post('/model/:objectId/picture',function(req,res,next){
       var query = new Parse.Query("Model");
       query.get(req.params.objectId,{
           success: function(result) {
               var bucket = new aws.S3();

               var s3KeyP = req.params.objectId + "_model_picture_" + req.body.randomNumber + "." + req.body.pictureType;
               var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
               var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
               var pictureParams = {
                   Bucket: 'syncholar',
                   Key: s3KeyP,
                   Body: pictureBuff,
                   ContentEncoding: 'base64',
                   ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
               };

               bucket.putObject(pictureParams, function (err, data) {
                   if (err) { console.log("Profile Picture (Image) Upload Error:", err); }
                   else {
                       console.log('Uploaded Image to S3!');
                       result.set("image_URL",awsLink + s3KeyP);
                       result.save();
                       res.status(200).json({status: "Picture Uploaded Successfully!"});
                   }
               });
           }
       });
   });

    app.post('/profile/:username/model',function(req,res,next){
        var currentUser = Parse.User.current();
        if (currentUser && currentUser.attributes.username == req.params.username) {
            var objectId;
            var now = moment();
            var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
            var reqBody = req.body;

            // send to Parse
			var keywords = reqBody.keywords.split(/\s*,\s*/g);
			var collaborators = reqBody.collaborators.split(/\s*,\s*/g);
			var Model = Parse.Object.extend("Model");
			var model= new Model();
			model.set('user',currentUser);
			model.set('abstract', reqBody.description);
			model.set('access', ["UBC"]);
			model.set('collaborators',collaborators);
			model.set('image','/images/paper.png');
			model.set('image_URL','/images/paper.png');
			model.set('title',reqBody.title);
			model.set('keywords',keywords);
			model.set('license',reqBody.license);
//			model.set('publication',reqBody.pubLink);
			model.set('number_cited',0);
			model.set('number_syncholar_factor',1);

			model.save(null, {
			  success: function(response) {
				  // Execute any logic that should take place after the object is saved.
				  objectId = response.id;

                  var bucket = new aws.S3({ params: { Bucket: 'syncholar'} });

				// encode file
				if (reqBody.file != null) {
                    var s3Key = req.params.username + "_" + objectId + "." + reqBody.fileType;
                    var contentType = reqBody.file.match(/^data:(\w+\/.+);base64,/);
                    var fileBuff = new Buffer(req.body.file.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                    var fileParams = {
                        Key: s3Key,
                        Body: fileBuff,
                        ContentEncoding: 'base64',
                        ContentType: (contentType ? contentType[1] : 'text/plain')
                    };
                    console.log(contentType);

                    // upload files to S3
                    bucket.putObject(fileParams, function (err, data) {
                        if (err) { console.log("Model Upload Error:", err); }
                        else {
                            console.log('uploading to s3');

                            // update file name in parse object
                            model.set('image_URL', awsLink + s3Key);
                            model.save();
                        }
                    });
                }
                console.log(objectId);

				// encode picture NOTE: Parse object currently does not differentiate between image and file.
				// Only file (saved in image_URL) is accessible on website
				if (reqBody.picture != null) {
                    var s3KeyP = req.params.username + "_" + objectId + "_pic." + reqBody.pictureType;
                    var contentTypeP = reqBody.picture.match(/^data:(\w+\/.+);base64,/);
                    var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
                    var pictureParams = {
                        Key: s3KeyP,
                        Body: pictureBuff,
                        ContentEncoding: 'base64',
                        ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
                    };

                    bucket.putObject(pictureParams, function (err, data) {
                        if (err) { console.log("Model image Upload Error:", err); }
                        else {
                            console.log('uploading to s3');

                            // update file name in parse object
                            model.set('image', awsLink + s3KeyP);
                            model.save();
                        }
                    });
                }
                res.status(200).json({status: "Model uploaded successfully!"});
			  },
			  error: function(response, error) {
                console.log('Failed to create new object, with error code: ' + error.message);
                res.status(500).json({status: "Creating model object failed. " + error.message});
			  }
			});

        } else {
            res.render('profile', {Error: 'Model Upload Failed!'});
            res.status(500).json({status: "Model Upload Failed! " + error.message});
        }
    });

app.post('/profile/:username/picture',function(req,res,next){
    var currentUser = Parse.User.current();
    var linkUser = req.params.username;
    if (currentUser) {
        if(currentUser.attributes.username == linkUser) {
            var bucket = new aws.S3();

            var s3KeyP = req.params.username + "_profile_picture_" + req.body.randomNumber + "." + req.body.pictureType;
            var contentTypeP = req.body.picture.match(/^data:(\w+\/.+);base64,/);
            var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w*\/{0,1}.*;base64,/, ""),'base64')
            var pictureParams = {
                Bucket: 'syncholar',
                Key: s3KeyP,
                Body: pictureBuff,
                ContentEncoding: 'base64',
                ContentType: (contentTypeP ? contentTypeP[1] : 'text/plain')
            };

            bucket.putObject(pictureParams, function (err, data) {
                if (err) { console.log("Profile Picture (Image) Upload Error:", err); }
                else {
                    console.log('Uploaded Image to S3!');
                    currentUser.set("imgUrl",awsLink + s3KeyP);
                    currentUser.save();
                    res.status(200).json({status: "Picture Uploaded Successfully!"});
                }
            });
        }
    }
});

app.post('/profile/:username/update',function(req,res,next){
    var currentUser = Parse.User.current();
    var linkUser = req.params.username;
    if (currentUser) {
        if(currentUser.attributes.username == linkUser) {
            if (req.body.summary) {
                console.log(req.body.summary);
                currentUser.set("summary",req.body.summary);
                currentUser.save();
                res.status(200).json({status: "Info Uploaded Successfully!"});
            } else if (req.body.expertise || req.body.interests) {
                console.log(req.body.expertise);
                if (req.body.expertise) { currentUser.set("expertise",JSON.parse(req.body.expertise)); }
                console.log(req.body.interests);
                if (req.body.interests) { currentUser.set("interests",JSON.parse(req.body.interests)); }
                currentUser.save();
                res.status(200).json({status: "Info Uploaded Successfully!"});
            } else if (req.body.work_experiences && req.body.educations && req.body.projects) {
                console.log(req.body.work_experiences);
                currentUser.set("work_experiences",JSON.parse(req.body.work_experiences));
                console.log(req.body.educations);
                currentUser.set("educations",JSON.parse(req.body.educations));
                console.log(req.body.projects);
                currentUser.set("projects",JSON.parse(req.body.projects));
                currentUser.save();
                res.status(200).json({status: "Info Uploaded Successfully!"});
            } else if (req.body.action && req.body.type) {
                if (req.body.action == "delete") {
                    console.log("Delete");
                    if (req.body.type == "work_experience") {
                        var work_experiencesTemp = currentUser.attributes.work_experiences;
                        for(var i = 0; i < work_experiencesTemp.length; i++) {
                            if (work_experiencesTemp[i].key = req.body.key) {
                                delete work_experiencesTemp[i];
                                work_experiencesTemp.splice(i,1);
                            } console.log(work_experiencesTemp);
                        } currentUser.set("work_experiences",work_experiencesTemp);
                        res.status(200).json({status: "Deleted Successfully!"});
                    } else if (req.body.type == "education") {
                          var educationsTemp = currentUser.attributes.educations;
                          for(var i = 0; i < educationsTemp.length; i++) {
                              if (educationsTemp[i].key = req.body.key) {
                                  delete educationsTemp[i];
                                  educationsTemp.splice(i,1);
                              } console.log(educationsTemp);
                          } currentUser.set("educations",educationsTemp);
                          res.status(200).json({status: "Deleted Successfully!"});
                    } else if (req.body.type == "project") {
                        var projectsTemp = currentUser.attributes.projects;
                        for(var i = 0; i < projectsTemp.length; i++) {
                            if (projectsTemp[i].key = req.body.key) {
                                delete projectsTemp[i];
                                projectsTemp.splice(i,1);
                            } console.log(projectsTemp);
                        } currentUser.set("projects",projectsTemp);
                        res.status(200).json({status: "Deleted Successfully!"});
                    }
                    currentUser.save();
                } else if (req.body.action == "update") {
                    console.log("Update");
                    if (req.body.type == "work_experience") {
                        var work_experiencesTemp = currentUser.attributes.work_experiences;
                        for(var i = 0; i < work_experiencesTemp.length; i++) {
                            if (work_experiencesTemp[i].key = req.body.key) {
                                var changedWE = {key: req.body.key,
                                                 title: req.body.title,
                                                 company: req.body.company,
                                                 description: req.body.description,
                                                 start: req.body.start,
                                                 end: req.body.end};
                                work_experiencesTemp[i] = changedWE;
                            } console.log(work_experiencesTemp);
                        } currentUser.set("work_experiences",work_experiencesTemp);
                        res.status(200).json({status: "Updated Successfully!"});
                    } else if (req.body.type == "education") {
                         var educationsTemp = currentUser.attributes.educations;
                         for(var i = 0; i < educationsTemp.length; i++) {
                             if (educationsTemp[i].key = req.body.key) {
                                 var changedWE = {key: req.body.key,
                                                  title: req.body.title,
                                                  company: req.body.company,
                                                  description: req.body.description,
                                                  start: req.body.start,
                                                  end: req.body.end};
                                 educationsTemp[i] = changedWE;
                             } console.log(educationsTemp);
                         } currentUser.set("educations",educationsTemp);
                         res.status(200).json({status: "Updated Successfully!"});
                    } else if (req.body.type == "project") {
                        var projectsTemp = currentUser.attributes.projects;
                        for(var i = 0; i < projectsTemp.length; i++) {
                            if (projectsTemp[i].key = req.body.key) {
                                var changedWE = {key: req.body.key,
                                                 title: req.body.title,
                                                 company: req.body.company,
                                                 description: req.body.description,
                                                 start: req.body.start,
                                                 end: req.body.end};
                                projectsTemp[i] = changedWE;
                            } console.log(projectsTemp);
                        } currentUser.set("projects",projectsTemp);
                        res.status(200).json({status: "Updated Successfully!"});
                    }
                    currentUser.save();
                }
            }
        }
    }
});

    /*******************************************
     *
     * Search
     *
     ********************************************/

    app.post('/searchpage', function (req, res, next) {
      var searchQ = req.body.searchQuery;

      var matching_users = {};
      var matching_models = {};
      var matching_data = {};
      var matching_pubs = {};
      var matching_orgs = {};

      var users_done = false;
      var models_done = false;
      var data_done = false;
      var pubs_done = false;
      var orgs_done = false;

      var currentUser = Parse.User.current();
      if (currentUser) {

        // Search User
        var User = Parse.Object.extend("User");
        var uquery = new Parse.Query(User);
        uquery.equalTo("username", searchQ);
        uquery.find({
          success: function (results) {
            for (var i = 0; i < results.length; i++) {
              var object = results[i];
              console.log(object.id);
              matching_users[object.get('username')] = object.id;
              //matching_users.push(object.get('username'));
            }
          console.log("Matching users are: ");
          console.log(matching_users);
          users_done = true;
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
                                username: currentUser.attributes.username, 
                                currentUserImg: currentUser.attributes.imgUrl,
                                users: matching_users,
                                models: matching_models,
                                publications: matching_pubs,
                                data: matching_data,
                                organizations: matching_orgs
              });
            }
          },
          error: function(error) {
              console.log("Error in searching");
          }
        });

        // Search Model
        var Model = Parse.Object.extend("Model");
        var mquery = new Parse.Query(Model);
        mquery.equalTo("keywords", searchQ);
        mquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("MODEL FOUND");
              var object = results[i];
              matching_models[object.get('title')] = object.id;
              //matching_models.push(object.get('title'));
            }
            models_done = true;
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
                                  username: currentUser.attributes.username, 
                                  currentUserImg: currentUser.attributes.imgUrl,
                                  users: matching_users,
                                  models: matching_models,
                                  publications: matching_pubs,
                                  data: matching_data,
                                  organizations: matching_orgs
                                });
          }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING MODEL");
          }
        });

        // Search Data
        var Data = Parse.Object.extend("Data");
        var dquery = new Parse.Query(Data);
        dquery.equalTo("keywords", searchQ);
        dquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("DATA FOUND");
              var object = results[i];
              matching_data[object.get('title')] = object.id;
              //matching_data.push(object.get('description'));
            }
            data_done = true;
              if (users_done && models_done && data_done && pubs_done && orgs_done) {
                res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
                                  username: currentUser.attributes.username, 
                                  currentUserImg: currentUser.attributes.imgUrl,
                                  users: matching_users,
                                  models: matching_models,
                                  publications: matching_pubs,
                                  data: matching_data,
                                  organizations: matching_orgs
              });
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING DATA");
          }
        });

        // Search Publication
        var Publication = Parse.Object.extend("Publication");
        var pquery = new Parse.Query(Publication);
        pquery.equalTo("keywords", searchQ);
        pquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("PUBLICATION FOUND");
              var object = results[i];
              matching_pubs[object.get('title')] = object.id;
              //matching_pubs.push(object.get('description'));
            }
            pubs_done = true;
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
                                  username: currentUser.attributes.username, 
                                  currentUserImg: currentUser.attributes.imgUrl,
                                  users: matching_users,
                                  models: matching_models,
                                  publications: matching_pubs,
                                  data: matching_data,
                                  organizations: matching_orgs
                                });
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING PUBLICATIONS");
          }
        });

        // Organization
        var Organization = Parse.Object.extend("Organization");
        var oquery = new Parse.Query(Organization);
        oquery.equalTo("name", searchQ);
        oquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("ORGANIZATION FOUND");
              var object = results[i];
              matching_orgs[object.get('name')] = object.id;
              //matching_orgs.push(object.get('name'));
            }
            orgs_done = true;
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
                                  username: currentUser.attributes.username, 
                                  currentUserImg: currentUser.attributes.imgUrl,
                                  users: matching_users,
                                  models: matching_models,
                                  publications: matching_pubs,
                                  data: matching_data,
                                  organizations: matching_orgs
                                });
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING ORGANIZATIONS");
          }
        });


      }
      else {
        res.render('index', {title: 'Please Login', path: req.path});
      }
     });

    /*******************************************
   *
   * SIGN UP
   *
   ********************************************/
  app.get('/signup', function (req, res, next) {

       res.render('signup', {title: 'Sign Up', path: req.path, Error: ""});
   });
     app.post('/signup', function (req, res, next) {
     var user = new Parse.User();
     user.set("username", req.body.username);
     user.set("password", req.body.password);
     user.set("fullname", req.body.fullname);
     user.set("email", req.body.email);
     user.set("imgUrl", "/images/user.png");
     console.log(req.body.username);
     user.signUp(null, {
       success: function (user) {
           console.log("sucessful signup");
           res.render('newsfeed', {layout:'home',title: 'Website', username: user.attributes.username, currentUserImg: user.attributes.imgUrl});
       },
       error: function (user, error) {
         // Show the error message somewhere and let the user try again.
         console.log("unsucessful signup: " + error.message);
         res.render('signup', {Error: error.message, path: req.path});
       }
     });

   });

  /*******************************************
   *
   * SIGN IN
   *
   ********************************************/
  app.get('/signin', function (req, res, next) {

    res.render('signin', {title: 'Login', path: req.path});
  });

  app.post('/signin', function (req, res, next) {
    Parse.User.logIn(req.body.username, req.body.password, {
      success: function(user) {
          res.redirect('/newsfeed');
      },
      error: function(user, error) {
          res.render('index', {title: 'Login failed', path: req.path});
      }
    });

  });
  
  app.post("/uploadimage/:username", function (req, res, next){
    var currentUser = Parse.User.current();
    if (currentUser && currentUser.attributes.username == req.params.username) {
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        filename=files.upload.name;
      });

      form.on('end', function(fields, files) {
        // Temporary location of our uploaded file 
        var temp_path = this.openedFiles[0].path;
        // The file name of the uploaded file 
        var file_name = this.openedFiles[0].name;
        // Location where we want to copy the uploaded file 
        var new_location = 'public/profilepictures/'+req.params.username+'/';

        fs.copy(temp_path, new_location + file_name, function(err) {
          if (err) {
            console.error(err);
          }else{
            currentUser.set("imgUrl",'/profilepictures/'+req.params.username+'/'+file_name);
          
            currentUser.save();
            res.render('profile', {title: 'Profile', username: currentUser.attributes.username, 'isMe': true, currentUserImg:currentUser.attributes.imgUrl, 
              userImg:currentUser.attributes.imgUrl, fullname:currentUser.attributes.fullname, email: currentUser.attributes.email});
          }
        });
      });
    } else {
      res.render('profile', {Error: 'Submit Publication Failed!'});
    }
  });
/*******************************************
*
* GROUP
*
********************************************/
    app.get("/groups/:id", function (req, res, next) {
        var Group = Parse.Object.extend("Group");
        var query = new Parse.Query(Group);
        query.find({
            success: function (results) {
                console.log("Successfully retrieved " + results.length + " groups.");

                res.render('group');
            }
        });
    });


/*******************************************
 *
 * SIGN OUT
 *
 ********************************************/

app.get('/signout', function (req, res, next) {
    Parse.User.logOut();
    res.render('index', {title: 'Come back again!', path: req.path});
});

};
