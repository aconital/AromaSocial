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

  app.get('/newsfeed', function (req, res, next) {
      var currentUser = Parse.User.current();
      if (currentUser) {
          console.log(currentUser);
          res.render('newsfeed', {title: 'Website', username: currentUser.attributes.username});
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
       res.render('profile', {title: 'Website', username: 'User'});
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
      res.send(200);
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
 * SING OUT
 *
 ********************************************/

app.post('/signout', function (req, res, next) {
    Parse.User.logOut();
});

};

