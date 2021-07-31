var express = require('express');
var router = express.Router();
var PushNotification = require('../helpers/push-notification');
var ErrorType = require('../constants/error-type');

router.post('/pushnotification/send', async function(req, res, next) {
  await PushNotification.send(req.body.message, req.body.subtitle, req.body.userId)
    .then(
      response => {
        res.json({ isSuccess: true, response: response });
      }, 
      error => {
        console.error('Email error: ' + error.message);
        res.json({ isSuccess: false, errorCode: ErrorType.SERVER_PROBLEM, errorMessage: error.message });
      }
    )
    .catch(error => { 
      console.error('Email error: ' + error.message);
      res.json({ isSuccess: false, errorCode: ErrorType.SERVER_PROBLEM, errorMessage: error.message });
    });
});

module.exports = router;
