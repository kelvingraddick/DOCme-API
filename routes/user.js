var express = require('express');
var router = express.Router();
var Authenticator = require('../helpers/authenticator');

router.get('/signin', async function(req, res, next) {
  var authentication = await Authenticator(req, res);
  if (!authentication.isSuccess) return; 

  res.send(JSON.stringify({ isSuccess: true, user: authentication.user }));
});

module.exports = router;
