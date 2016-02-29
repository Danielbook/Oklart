var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index',{location: "Norrköping",time:"28/2 - 2016"});
});

module.exports = router;