var express = require('express');
var formidable = require('formidable');
var util = require('util');
var fs  = require('fs-extra');
var moment = require('moment');
var path = require('path');

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
          query.include('pubId');
          query.include('from');
          query.descending("createdAt");
          query.find({
              success: function(results) {
                  console.log("Successfully retrieved " + results.length + " feed.");
                  // Do something with the returned Parse.Object values
                  var feeds=[];
                  for (var i = 0; i < results.length; i++) {
                      var object = results[i];

                      var  username= object.attributes.from.attributes.username;
                      var  userImg=  object.attributes.from.attributes.imgUrl;
                      var  type=object.attributes.type;
                      var  date=object.createdAt;

                      if(type == "pub") {
                            if(object.attributes.pubId!=null){
                          if (object.attributes.pubId._serverData != null) {
                              var pubItem = object.attributes.pubId._serverData;

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
        currentUserImg: currentUser.attributes.imgUrl,
        username: currentUser.attributes.username,
        email: currentUser.attributes.email,
        fullname: currentUser.attributes.fullname,
        about: currentUser.attributes.about,
        position: currentUser.attributes.position,
        location: currentUser.attributes.location,
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
            email: result[0].attributes.email,
            fullname: result[0].attributes.fullname,
            about: result[0].attributes.about,
            position: result[0].attributes.position,
            location: result[0].attributes.location,
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
