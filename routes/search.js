require("babel-core").transform("code", {
  presets: ["react"]
});
var React = require('react');
var ReactDOM = require('react-dom/server');
var components = require('../public/javascripts/searchComponents.js');
var SearchFeed = React.createFactory(components.SearchFeed)


// var markup = ReactDOM.renderToString(
//     Item({ initialCount: 7 })
// );

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

function sendSearchFeed(res, searchResults) {
  var sf = SearchFeed({data: searchResults});
  res.render('search', {
    react: ReactDOM.renderToString(sf)
  });
}

module.exports=function(app,Parse) {

    /*******************************************
     *
     * Search
     *
     ********************************************/

     app.get('searchfeeddata', function(){

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

      var searchResults = [];

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
              //matching_users[object.get('username')] = object.id;
              //matching_users.push(object.get('username'));
              matching_users[object.get('username')] = {
                "type" : "user",
                "id" : object.id
              };
            }
          users_done = true;
          searchResults.push(matching_users);
          if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.send(searchResults);
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
              //matching_models[object.get('title')] = object.id;
              //matching_models.push(object.get('title'));
              matching_models[object.get('title')] = {
                "type" : "model",
                "id" : object.id
              };
            }
            models_done = true;
            searchResults.push(matching_models);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.send(searchResults);
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
              //matching_data[object.get('title')] = object.id;
              //matching_data.push(object.get('description'));
              matching_data[object.get('title')] = {
                "type" : "data",
                "id" : object.id
              };
            }
            data_done = true;
            searchResults.push(matching_data);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.send(searchResults);
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
              //matching_pubs[object.get('title')] = object.id;
              //matching_pubs.push(object.get('description'));
              matching_pubs[object.get('title')] = {
                "type" : "publication",
                "id" : object.id
              };
            }
            pubs_done = true;
            searchResults.push(matching_pubs);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.send(searchResults);
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING PUBLICATIONS");
          }
        });

        // Organization Search
        var Organization = Parse.Object.extend("Organization");
        var oquery = new Parse.Query(Organization);
        oquery.equalTo("name", searchQ);
        oquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("ORGANIZATION FOUND");
              var object = results[i];
              //matching_orgs[object.get('name')] = object.id;
              //matching_orgs.push(object.get('name'));
              matching_orgs[object.get('name')] = {
                "type" : "organization",
                "id" : object.id
              };
            }
            orgs_done = true;
            searchResults.push(matching_orgs);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              res.send(searchResults);
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING ORGANIZATIONS");
          }
        });


      }
      // else {
      //   res.render('index', {title: 'Please Login', path: req.path});
      // }

     });
app.post('/searchpage', function (req, res, next) {
      var searchQ = req.body.searchQuery;

      // var matching_users = [];
      // var matching_models = [];
      // var matching_data = [];
      // var matching_pubs = [];
      // var matching_orgs = [];

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

      var searchResults = [];

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
              //matching_users[object.get('username')] = object.id;
              //matching_users.push(object.get('username'));
              matching_users[object.get('username')] = {
                "type" : "user",
                "id" : object.id
              };
            }
          console.log("Matching users are: ");
          console.log(matching_users);
          users_done = true;
          searchResults.push(matching_users);
          if (users_done && models_done && data_done && pubs_done && orgs_done) {
              //res.send(searchResults);
              sendSearchFeed(res, searchResults);
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
              //matching_models[object.get('title')] = object.id;
              //matching_models.push(object.get('title'));
              matching_models[object.get('title')] = {
                "type" : "model",
                "id" : object.id
              };
            }
            models_done = true;
            searchResults.push(matching_models);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              //res.send(searchResults);
                sendSearchFeed(res, searchResults);
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
              //matching_data[object.get('title')] = object.id;
              //matching_data.push(object.get('description'));
              matching_data[object.get('title')] = {
                "type" : "data",
                "id" : object.id
              };
            }
            data_done = true;
            searchResults.push(matching_data);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              //res.send(searchResults);
                sendSearchFeed(res, searchResults);
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
              //matching_pubs[object.get('title')] = object.id;
              //matching_pubs.push(object.get('description'));
              matching_pubs[object.get('title')] = {
                "type" : "publication",
                "id" : object.id
              };
            }
            pubs_done = true;
            searchResults.push(matching_pubs);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              //res.send(searchResults);
                sendSearchFeed(res, searchResults);
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING PUBLICATIONS");
          }
        });

        // Organization Search
        var Organization = Parse.Object.extend("Organization");
        var oquery = new Parse.Query(Organization);
        oquery.equalTo("name", searchQ);
        oquery.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              console.log("ORGANIZATION FOUND");
              var object = results[i];
              //matching_orgs[object.get('name')] = object.id;
              //matching_orgs.push(object.get('name'));
              matching_orgs[object.get('name')] = {
                "type" : "organization",
                "id" : object.id
              };
            }
            orgs_done = true;
            searchResults.push(matching_orgs);
            if (users_done && models_done && data_done && pubs_done && orgs_done) {
              //res.send(searchResults);
                sendSearchFeed(res, searchResults);
            }
          },
          error: function(error) {
            console.log("ERROR WHILE SEARCHING ORGANIZATIONS");
          }
        });


      }
});

    // app.post('/searchpage', function (req, res, next) {
    //   var sf = SearchFeed({data: "Forestry"});
    //   res.render('search', {
    //     react: ReactDOM.renderToString(sf)
    //   });
    //   // var searchQ = req.body.searchQuery;

    //   // var matching_users = {};
    //   // var matching_models = {};
    //   // var matching_data = {};
    //   // var matching_pubs = {};
    //   // var matching_orgs = {};

    //   // var users_done = false;
    //   // var models_done = false;
    //   // var data_done = false;
    //   // var pubs_done = false;
    //   // var orgs_done = false;

    //   // var searchResults = [];

    //   // var currentUser = Parse.User.current();
    //   // if (currentUser) {

    //   //   // Search User
    //   //   var User = Parse.Object.extend("User");
    //   //   var uquery = new Parse.Query(User);
    //   //   uquery.equalTo("username", searchQ);
    //   //   uquery.find({
    //   //     success: function (results) {
    //   //       for (var i = 0; i < results.length; i++) {
    //   //         var object = results[i];
    //   //         console.log(object.id);
    //   //         matching_users[object.get('username')] = object.id;
    //   //         //matching_users.push(object.get('username'));
    //   //       }
    //   //     console.log("Matching users are: ");
    //   //     console.log(matching_users);
    //   //     users_done = true;
    //   //     searchResults.push(matching_users);
    //   //     if (users_done && models_done && data_done && pubs_done && orgs_done) {
    //   //         res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
    //   //                           username: currentUser.attributes.username, 
    //   //                           currentUserImg: currentUser.attributes.imgUrl,
    //   //                           users: matching_users,
    //   //                           models: matching_models,
    //   //                           publications: matching_pubs,
    //   //                           data: matching_data,
    //   //                           organizations: matching_orgs
    //   //         });
    //   //         //res.send(searchResults);
    //   //       }
    //   //     },
    //   //     error: function(error) {
    //   //         console.log("Error in searching");
    //   //     }
    //   //   });

    //   //   // Search Model
    //   //   var Model = Parse.Object.extend("Model");
    //   //   var mquery = new Parse.Query(Model);
    //   //   mquery.equalTo("keywords", searchQ);
    //   //   mquery.find({
    //   //     success: function(results) {
    //   //       for (var i = 0; i < results.length; i++) {
    //   //         console.log("MODEL FOUND");
    //   //         var object = results[i];
    //   //         matching_models[object.get('title')] = object.id;
    //   //         //matching_models.push(object.get('title'));
    //   //       }
    //   //       models_done = true;
    //   //       searchResults.push(matching_models);
    //   //       if (users_done && models_done && data_done && pubs_done && orgs_done) {
    //   //         res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
    //   //                             username: currentUser.attributes.username, 
    //   //                             currentUserImg: currentUser.attributes.imgUrl,
    //   //                             users: matching_users,
    //   //                             models: matching_models,
    //   //                             publications: matching_pubs,
    //   //                             data: matching_data,
    //   //                             organizations: matching_orgs
    //   //                           });
    //   //         //res.send(searchResults);
    //   //       }
    //   //     },
    //   //     error: function(error) {
    //   //       console.log("ERROR WHILE SEARCHING MODEL");
    //   //     }
    //   //   });

    //   //   // Search Data
    //   //   var Data = Parse.Object.extend("Data");
    //   //   var dquery = new Parse.Query(Data);
    //   //   dquery.equalTo("keywords", searchQ);
    //   //   dquery.find({
    //   //     success: function(results) {
    //   //       for (var i = 0; i < results.length; i++) {
    //   //         console.log("DATA FOUND");
    //   //         var object = results[i];
    //   //         matching_data[object.get('title')] = object.id;
    //   //         //matching_data.push(object.get('description'));
    //   //       }
    //   //       data_done = true;
    //   //       searchResults.push(matching_data);
    //   //       if (users_done && models_done && data_done && pubs_done && orgs_done) {
    //   //           res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
    //   //                             username: currentUser.attributes.username, 
    //   //                             currentUserImg: currentUser.attributes.imgUrl,
    //   //                             users: matching_users,
    //   //                             models: matching_models,
    //   //                             publications: matching_pubs,
    //   //                             data: matching_data,
    //   //                             organizations: matching_orgs
    //   //         });
    //   //         //res.send(searchResults);
    //   //       }
    //   //     },
    //   //     error: function(error) {
    //   //       console.log("ERROR WHILE SEARCHING DATA");
    //   //     }
    //   //   });

    //   //   // Search Publication
    //   //   var Publication = Parse.Object.extend("Publication");
    //   //   var pquery = new Parse.Query(Publication);
    //   //   pquery.equalTo("keywords", searchQ);
    //   //   pquery.find({
    //   //     success: function(results) {
    //   //       for (var i = 0; i < results.length; i++) {
    //   //         console.log("PUBLICATION FOUND");
    //   //         var object = results[i];
    //   //         matching_pubs[object.get('title')] = object.id;
    //   //         //matching_pubs.push(object.get('description'));
    //   //       }
    //   //       pubs_done = true;
    //   //       searchResults.push(matching_pubs);
    //   //       if (users_done && models_done && data_done && pubs_done && orgs_done) {
    //   //         res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
    //   //                             username: currentUser.attributes.username, 
    //   //                             currentUserImg: currentUser.attributes.imgUrl,
    //   //                             users: matching_users,
    //   //                             models: matching_models,
    //   //                             publications: matching_pubs,
    //   //                             data: matching_data,
    //   //                             organizations: matching_orgs
    //   //                           });
    //   //         //res.send(searchResults);
    //   //       }
    //   //     },
    //   //     error: function(error) {
    //   //       console.log("ERROR WHILE SEARCHING PUBLICATIONS");
    //   //     }
    //   //   });

    //   //   // Organization Search
    //   //   var Organization = Parse.Object.extend("Organization");
    //   //   var oquery = new Parse.Query(Organization);
    //   //   oquery.equalTo("name", searchQ);
    //   //   oquery.find({
    //   //     success: function(results) {
    //   //       for (var i = 0; i < results.length; i++) {
    //   //         console.log("ORGANIZATION FOUND");
    //   //         var object = results[i];
    //   //         matching_orgs[object.get('name')] = object.id;
    //   //         //matching_orgs.push(object.get('name'));
    //   //       }
    //   //       orgs_done = true;
    //   //       searchResults.push(matching_orgs);
    //   //       if (users_done && models_done && data_done && pubs_done && orgs_done) {
    //   //         res.render('search', {title: 'Complete Search', query: req.body.searchQuery,
    //   //                             username: currentUser.attributes.username, 
    //   //                             currentUserImg: currentUser.attributes.imgUrl,
    //   //                             users: matching_users,
    //   //                             models: matching_models,
    //   //                             publications: matching_pubs,
    //   //                             data: matching_data,
    //   //                             organizations: matching_orgs
    //   //                           });
    //   //         //res.send(searchResults);
    //   //       }
    //   //     },
    //   //     error: function(error) {
    //   //       console.log("ERROR WHILE SEARCHING ORGANIZATIONS");
    //   //     }
    //   //   });


    //   // }
    //   // else {
    //   //   res.render('index', {title: 'Please Login', path: req.path});
    //   // }
    //  });



    app.get('/searchpage', function(req, res, next) {
                    res.render('search', {
                                });
    });





















};