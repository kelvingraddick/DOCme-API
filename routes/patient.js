var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');

router.post('/signin', authenticate, async function(req, res, next) {
  res.json({ isSuccess: true, token: res.token, patient: res.patient });
});

module.exports = router;
