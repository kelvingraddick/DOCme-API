var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');

router.post('/authenticate', authenticate, async function(req, res, next) {
  res.json({ isSuccess: true, token: res.token, patient: res.patient });
});

router.post('/authorize', authorize, async function(req, res, next) {
  res.json({ isSuccess: true, patient: req.patient });
});

module.exports = router;
