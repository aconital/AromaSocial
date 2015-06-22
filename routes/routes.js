var express = require('express');
var formidable = require('formidable');
var util = require('util');
 var fs  = require('fs-extra');

module.exports=function(app,Parse) {
  /*******************************************
   *
   * HOME PAGE
   *
   ********************************************/
  app.get('/', function (req, res) {
      res.render('index', {title: 'The index page!', path: req.path})
    });


    /*******************************************
     *
     * NEWS FEED
     *
     ********************************************/
  app.get('/newsfeed', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          console.log(currentUser);
          res.render('newsfeed', {title: 'Website', username: currentUser.attributes.username});
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
                    res.render('newsfeed', {title: 'NewsFeed', username: currentUser.attributes.username});
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
   * PROFILE
   *
   ********************************************/
  app.get('/profile', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          res.render('profile', {title: 'Profile', username: currentUser.attributes.username, userid: true, profilepicurl:"http://placehold.it/500x500&text=Image"});
      }else{
          res.render('index', {title: 'Please Login', path: req.path});
      }

});

  app.get('/:username/:userid', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          res.render('profile', {title: 'Profile', username: req.params.username, userid: false});
      }else{
          res.render('index', {title: 'Please Login', path: req.path});
      }

});

  app.post('/profile',function(req,res,next){

  });



  app.get('/profile/:username/publications',function(req,res,next){

      var User = Parse.Object.extend("User")
      var innerQuery = new Parse.Query(User);
      innerQuery.equalTo("username", req.params.username);

      var Publication = Parse.Object.extend("Publication");
      var query = new Parse.Query(Publication);
      query.matchesQuery("user", innerQuery);
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
                      year: object.year,
                      author: object.author,
                      description: object.description
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
      console.log("POST");
      var currentUser = Parse.User.current();
      if (currentUser && currentUser.attributes.username == req.params.username) {
          var tags;
          var title;
          var filename;
            //upload publication
          var form = new formidable.IncomingForm();
          console.log(form);
          form.parse(req, function(err, fields, files) {
              tags=fields.tags;
              console.log(tags);
              title=fields.title;
              filename=files.upload.name;
              author= files.upload.author;
              description= files.upload.description;
              year= files.upload.year;
          });
          form.on('end', function(fields, files) {
              // Temporary location of our uploaded file 
              var temp_path = this.openedFiles[0].path;
              // The file name of the uploaded file 
              var file_name = this.openedFiles[0].name;
              // Location where we want to copy the uploaded file 
              var new_location = 'uploads/'+req.params.username+'/publications';

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
                              res.render('profile', {title: 'Profile', msg: 'Publication uploaded successfully!', username: currentUser.attributes.username});
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

    /*******************************************
     *
     * Search
     *
     ********************************************/
    app.post('/search', function (req, res, next) {

        var tags=req.body.tags;
        console.log(tags);
        var Publication = Parse.Object.extend("Publication");
        var query = new Parse.Query(Publication);
        query.containedIn("hashtags", tags.match(/#.+?\b/g));
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
                        hashtags:object.attributes.hashtags
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
            res.render('search', {title: 'Search', username: currentUser.attributes.username});
        }else{
            res.render('index', {title: 'Please Login', path: req.path});
        }

    });

    app.post('/searchpage', function(req,res,next){

        var currentUser = Parse.User.current();
        if (currentUser) {
            var tagString=req.body.tags;
            console.log("TAGS:" + tagString);
            res.render("search", {title:'Search', tags: tagString});
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

    res.render('signup', {title: 'Sign Up', path: req.path});
});
  app.post('/signup', function (req, res, next) {
  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);
  user.set("email", req.body.email);

  user.signUp(null, {
    success: function (user) {
        res.render('newsfeed');
    },
    error: function (user, error) {
      // Show the error message somewhere and let the user try again.
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

