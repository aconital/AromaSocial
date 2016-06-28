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
var is_auth = require('../utils/helpers').is_auth;
var include_user= require('../utils/helpers').include_user;

module.exports = function(app, Parse, io) {
	app.get('/search', include_user, function(req, res, next) {
		console.log(req.query.searchQuery);
		if (req.isAuthenticated() || true) {
			var searchString = req.query.searchQuery;
			res.render('search', {searchString: searchString});
		} else {
			res.json("Not signed in");
		}
	});
}