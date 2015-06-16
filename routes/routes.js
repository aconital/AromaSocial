var express = require('express');


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
       res.render('profile', {title: 'Profile', username: 'Profile'});
});


  app.get('/profilebootstrap', function (req, res, next) {
       res.render('profilebootstrap', {title: 'Profile', username: 'Profile'});
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
        res.render('guest', {title: 'Verify Email!'});
    },
    error: function (user, error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
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

