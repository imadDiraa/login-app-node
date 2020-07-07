var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.session.user) {
    return res.render('welcome', {user: req.session.user})
  } else {
    return res.redirect('/users/login')
  }
});

module.exports = router;
