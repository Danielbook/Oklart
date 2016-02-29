var express = require('express');
var router = express.Router();
var smhidata = require('../data.json');



router.get('/', function(req, res, next) {
  res.render('index',{location: "Norrköping",time:"28/2 - 2016",dataobject:smhidata});
});

module.exports = router;