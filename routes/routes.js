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
      res.render('index', {title: 'The index page!'})
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
          res.render('guest', {title: 'Login failed'});
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
            res.render('guest', {title: 'Login failed'});
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
          res.render('profile', {title: 'Profile', username: 'Profile'});
      }else{
          res.render('guest', {title: 'Please Login'});
      }

});
  app.post('/profile',function(req,res,next){

  });
  
app.get('/profilebootstrap', function (req, res, next) {
  res.render('profilebootstrap', {title: 'Profile', username: "erinbush"});
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
                      hashtags:object.attributes.hashtags
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
          form.parse(req, function(err, fields, files) {
              tags=fields.tags;
              title=fields.title;
              filename=files.upload.name;
          });
          form.on('end', function(fields, files) {
              /* Temporary location of our uploaded file */
              var temp_path = this.openedFiles[0].path;
              /* The file name of the uploaded file */
              var file_name = this.openedFiles[0].name;
              /* Location where we want to copy the uploaded file */
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
                      pub .save(null, {
                          success: function(pub) {
                              // Execute any logic that should take place after the object is saved.
                              res.render('profile', {title: 'Profile',msg: 'Publication uploaded successfully!', username: currentUser.attributes.username});
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
                res.send(pubs);
            },
            error: function(error) {
                console.log("Error: " + error.code + " " + error.message);
            }
        });

    });

    /*******************************************
   *
   * SIGN UP
   *
   ********************************************/
  app.get('/signup', function (req, res, next) {

    res.render('signup', {title: 'Sign Up'});
});
  app.post('/signup', function (req, res, next) {
  var user = new Parse.User();
  user.set("username", req.body.username);
  user.set("password", req.body.password);
  user.set("email", req.body.email);

  user.signUp(null, {
    success: function (user) {
        res.render('/newsfeed');
    },
    error: function (user, error) {
      // Show the error message somewhere and let the user try again.
      res.render('/signup',{Error: error.message});
    }
  });

});
  /*******************************************
   *
   * SIGN IN
   *
   ********************************************/
  app.get('/signin', function (req, res, next) {

    res.render('signin', {title: 'Login'});
  });

  app.post('/signin', function (req, res, next) {
    Parse.User.logIn(req.body.username, req.body.password, {
      success: function(user) {
          res.redirect('/newsfeed');
      },
      error: function(user, error) {
          res.render('guest', {title: 'Login failed'});
      }
    });

  });


/*******************************************
 *
 * SIGN OUT
 *
 ********************************************/

app.post('/signout', function (req, res, next) {
    Parse.User.logOut();
    res.render('guest', {title: 'Come back again!'});
});

};

