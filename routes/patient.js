var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var path = require('path');
var Database = require('../helpers/database');
var UserType = require('../constants/user-type');
var ErrorType = require('../constants/error-type');
var DatabaseAttributes = require('../constants/database-attributes');

router.post('/authenticate', authenticate, async function(req, res, next) {
  res.json({ isSuccess: true, token: res.token, patient: res.patient });
});

router.post('/authorize', authorize, async function(req, res, next) {
  res.json({ isSuccess: true, patient: req.patient });
});

router.post('/register', async function(req, res, next) {
  var existingPatient = await Database.Patient.findOne({ where: { email_address: req.body.emailAddress } });
  if (existingPatient) {
    res.json({ isSuccess: false, errorCode: ErrorType.EMAIL_TAKEN, errorMessage: 'This email address is already taken.' });
  } else {
    var newPatient = {
      is_active: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email_address: req.body.emailAddress,
      password: req.body.password,
      gender: req.body.gender,
      race: req.body.race,
      image_url: req.body.imageUrl
    };
    Database.Patient.create(newPatient)
      .then(async createdPatient => {
        var foundPatient = await Database.Patient
          .findOne({
            where: { id: createdPatient.id },
            attributes: DatabaseAttributes.PATIENT
          });
        var token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: foundPatient.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
        res.json({ isSuccess: true, patient: foundPatient, token: token });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

module.exports = router;
