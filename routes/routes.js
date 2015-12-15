var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');
var _= require('underscore');
var aws = require('aws-sdk');
var s3 = new aws.S3();
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
          var query = new Parse.Query(NewsFeed);
         query.include("pubId");
          query.include('from');
          query.descending("createdAt");
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
                           userImg = object.attributes.from.attributes.imgUrl;
                      }


                      var  type=object.attributes.type;
                      var  date=object.createdAt;

                      if(type == "pub") {

                            if(object.attributes.pubId!=null){

                          if (object.attributes.pubId.attributes != null) {


                              var pubItem = object.attributes.pubId.attributes;

                              var filename ="";
                              var title ="";
                              var hashtags ="";
                              var year ="";
                              var author ="";
                              var description ="";
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
                              });
//                              console.log(feeds);
                          }
                      }
                      }

                    if(type =="model")
                    {
                        //do stuff
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
          res.render('newsfeed', {layout:'home',title: 'Website', currentUsername: currentUser.attributes.username, currentUserImg: currentUser.attributes.imgUrl});
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
                    res.render('newsfeed', {title: 'NewsFeed', username: currentUser.attributes.username, currentUserImg: currentUser.attributes.imgUrl});
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
                    if(user.hasOwnProperty('work_experience')){
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
        work_experience: currentUser.attributes.work_experience,
        education: currentUser.attributes.education,
        projects: currentUser.attributes.projects,
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
             work_experience: result[0].attributes.work_experience,
             education: result[0].attributes.education,
             projects: result[0].attributes.projects,
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
    console.log("this is the path of the data get req" + result.get('path'));
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
  app.post('/profile/:username/publications',function(req,res,next){
      var currentUser = Parse.User.current();
      if (currentUser && currentUser.attributes.username == req.params.username) {
          var tags;
          var title;
          var filename;
            //upload publication
          var form = new formidable.IncomingForm();
          console.log(form);
          
          var now = moment();
          var formatted = now.format('YYYY_MM_DD-HH_mm_ss');
          console.log(formatted); 

          form.parse(req, function(err, fields, files) {
              tags=fields.tags;
              console.log(tags);
              title=fields.title;
              //filename=files.upload.name;
              var start = files.upload.name.indexOf(path.extname(files.upload.name));
              filename = files.upload.name.substring(0, start) + formatted + path.extname(files.upload.name);
              //console.log(path.extname(files.upload.name));
              author= fields.author;
              description= fields.description;
              year= fields.year;
          });
          form.on('end', function(fields, files) {
              // Temporary location of our uploaded file 
              var temp_path = this.openedFiles[0].path;
              // The file name of the uploaded file 
              //var file_name = this.openedFiles[0].name;
              var start = this.openedFiles[0].name.indexOf(path.extname(this.openedFiles[0].name));
              var file_name = this.openedFiles[0].name.substring(0, start) + formatted + path.extname(this.openedFiles[0].name);
              // Location where we want to copy the uploaded file 
              var new_location = 'uploads/'+req.params.username+'/publications/';

              fs.copy(temp_path, new_location + file_name, function(err) {
                  if (err) {
                      console.error(err);
                  } else {

                      var hashtags = tags.match(/#.+?\b/g);
                      var Publication = Parse.Object.extend("Publication");
                      var pub= new Publication();
                      pub.set('user',currentUser);
                      pub.set('title',title);
                      pub.set('hashtags',hashtags);
                      pub.set('filename',filename);
                      pub.set('year',year);
                      pub.set('description',description);
                      pub.set('author',author);
                      pub .save(null, {
                          success: function(pub) {
                              // Execute any logic that should take place after the object is saved.
                              res.render('profile', {title: 'Profile', msg: 'Publication uploaded successfully!', username: currentUser.attributes.username,
                                'isMe': true, currentUserImg:currentUser.attributes.imgUrl, fullname:currentUser.attributes.fullname,
                                email: currentUser.attributes.email});
                          },
                          error: function(pub, error) {
                              // Execute any logic that should take place if the save fails.
                              // error is a Parse.Error with an error code and message.
                              alert('Failed to create new object, with error code: ' + error.message);
                              res.render('profile', {title: 'Profile', msg: 'Uploading publication failed!'});
                          }
                      });
                  }
              });
          });
      } else {
          res.render('profile', {Error: 'Submit Publication Failed!'});
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
				var fileBuff = new Buffer(req.body.file.replace(/^data:\w+\/.+;base64,/, ""),'base64')
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
                            res.status(200).json({status:"Back from routes.js!"});
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
                    var fileBuff = new Buffer(req.body.file.replace(/^data:\w+\/.+;base64,/, ""),'base64')
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
                    var pictureBuff = new Buffer(req.body.picture.replace(/^data:\w+\/.+;base64,/, ""),'base64')
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

    /*******************************************
     *
     * Search
     *
     ********************************************/
    app.post('/search', function (req, res, next) {

        var tags=req.body.tags;
     //   console.log(tags);
        var Publication = Parse.Object.extend("Publication");
        var query = new Parse.Query(Publication);
        query.include('user');
        query.containedIn("hashtags", tags.match(/#.+?\b/g));
        query.find({
            success: function(results) {
                console.log("Successfully retrieved " + results.length + " publications.");
                // Do something with the returned Parse.Object values

                var pubs=[];
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];

                    var  username= object.attributes.user.attributes.username;
                    var  userImg=  object.attributes.user.attributes.imgUrl;
                    pubs.push({
                        username: username,
                        userImg: userImg,
                        filename: object.attributes.filename,
                        title:object.attributes.title,
                        hashtags:object.attributes.hashtags,
                        author:object.attributes.author,
                        description:object.attributes.description,
                        year:object.attributes.year
                    });


                }
                res.setHeader('Content-Type', 'application/json');
                console.log(JSON.stringify(pubs))
                res.send(JSON.stringify(pubs));
                //res.render("search", {title:'Search', results: JSON.stringify(pubs)});
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    });
    app.get('/searchpage', function (req, res, next) {
        var currentUser = Parse.User.current();
        if (currentUser) {
            res.render('search', {title: 'Search', username: currentUser.attributes.username, currentUserImg: currentUser.attributes.imgUrl});
        }else{
            res.render('index', {title: 'Please Login', path: req.path});
        }

    });

    app.post('/searchpage', function(req,res,next){

        var currentUser = Parse.User.current();
        if (currentUser) {
            var tagString=req.body.tags;
            console.log("TAGS:" + tagString);
            res.render("search", {title:'Search', tags: tagString,username: currentUser.attributes.username, currentUserImg: currentUser.attributes.imgUrl});
        }else{
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
