var express = require('express');
var router = express.Router();
var Authenticator = require('../helpers/authenticator');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  var authentication = await Authenticator(req, res);
  if (!authentication.isSuccess) return; 

  res.send(JSON.stringify(authentication.user));
});

module.exports = router;
