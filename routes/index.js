var express = require('express');
var router = express.Router();

// GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Website' });
});

router.get('/newsfeed', function(req, res, next) {
  res.render('newsfeed', { title: 'Website' });
});

router.get('/profile', function(req, res, next) {
  res.render('profile', { title: 'Website', username: 'User' });
});

module.exports = router;