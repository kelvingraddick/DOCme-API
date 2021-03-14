var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var Sequelize = require('sequelize');
var Database = require('../helpers/database');
var Email = require('../helpers/email/email');
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
        
        await Email.send(foundPatient.get().emailAddress, 'Welcome to DOCme ' + foundPatient.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_PATIENT)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));

        var token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: foundPatient.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
        res.json({ isSuccess: true, patient: foundPatient, token: token });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

router.post('/:patientId/update', authorize, async function(req, res, next) {
  var patientId = req.params.patientId;
  var existingPatient = await Database.Patient.findOne({ where: { email_address: req.body.emailAddress } });
  if (existingPatient && existingPatient.id != patientId) {
    res.json({ isSuccess: false, errorCode: ErrorType.EMAIL_TAKEN, errorMessage: 'This email address is already taken.' });
  } else if (patientId != req.patient.id) {
    res.sendStatus(403);
  } else {
    var updatedPatient = {
      is_active: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email_address: req.body.emailAddress,
      gender: req.body.gender,
      race: req.body.race,
      image_url: req.body.imageUrl
    };
    Database.Patient.update(updatedPatient, { where: { id: patientId } })
      .then(async numberUpdated => {
        console.info('Number of patients updated: ' + numberUpdated);

        var foundPatient = await Database.Patient
          .findOne({
            where: { id: patientId },
            attributes: DatabaseAttributes.PATIENT
          });
        
        /* TODO: patient changed email
        await Email.send(foundPatient.get().emailAddress, 'Welcome to DOCme ' + foundPatient.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_PATIENT)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));
        */

        res.json({ isSuccess: true, patient: foundPatient });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

module.exports = router;
