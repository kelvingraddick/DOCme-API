var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var Sequelize = require('sequelize');
var Crypto = require('crypto');
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
      password: await bcrypt.hash(req.body.password, 10),
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

router.post('/:patientId/update/password', authorize, async function(req, res, next) {
  var patientId = req.params.patientId;
  var patient = await Database.Patient.findOne({ where: { id: patientId } });
  if (!patient || !await bcrypt.compare(req.body.currentPassword, patient.password)) {
    res.json({ isSuccess: false, errorCode: ErrorType.INVALID_CREDENTIALS, errorMessage: 'This current password is not correct.' });
  } else if (patientId != req.patient.id) {
    res.sendStatus(403);
  } else {
    var updatedPatient = {
      password: await bcrypt.hash(req.body.newPassword, 10),
    };
    Database.Patient.update(updatedPatient, { where: { id: patientId } })
      .then(async numberUpdated => {
        console.info('Number of patients updated: ' + numberUpdated);

        var foundPatient = await Database.Patient
          .findOne({
            where: { id: patientId },
            attributes: DatabaseAttributes.PATIENT
          });
        
        /* TODO: patient password changed email
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

router.post('/reset/password/request', async function(req, res, next) {
  var patient = await Database.Patient.findOne({ where: { email_address: req.body.emailAddress } });
  if (patient) {
    var updatedPatient = {
      reset_password_code: Crypto.randomUUID(),
      reset_password_timestamp: Sequelize.literal('CURRENT_TIMESTAMP')
    };
    Database.Patient.update(updatedPatient, { where: { id: patient.id } })
      .then(async numberUpdated => {
        console.info('Number of patients updated: ' + numberUpdated);

        var foundPatient = await Database.Patient
          .findOne({
            where: { id: patient.id },
            attributes: DatabaseAttributes.PATIENT
          });
        
        await Email.send(
          foundPatient.get().emailAddress,
          'Your reset password request for DOCme!',
          'A password reset was request for an account with this email address on DOCme',
          Email.templates.RESET_PASSWORD_REQUEST,
          {
            reset_password_expiration_minutes: 10,
            reset_password_link: 'http://app.docmeapp.com/resetpassword/?code=' + foundPatient.get().resetPasswordCode
          })
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));

        res.json({ isSuccess: true });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  } else {
    res.json({ isSuccess: true });
  }
});

router.post('/update/password/:code', async function(req, res, next) {
  var code = req.params.code;
  var patient = await Database.Patient.findOne({ where: { reset_password_code: code } });
  if (!patient) {
    res.status(403).send('Password reset code is invalid.');
  } else if (
    !patient.reset_password_timestamp ||
    (new Date() - patient.reset_password_timestamp) > 600000) { // 10 minutes
    res.status(403).send('Password reset request timed-out.');
  } else {
    var updatedPatient = {
      password: await bcrypt.hash(req.body.newPassword, 10),
      reset_password_code: null,
      reset_password_timestamp: null
    };
    Database.Patient.update(updatedPatient, { where: { id: patient.id } })
      .then(async numberUpdated => {
        console.info('Number of patients updated: ' + numberUpdated);

        /*
        var foundPatient = await Database.Patient
          .findOne({
            where: { id: patient.id },
            attributes: DatabaseAttributes.PATIENT
          });
        */
        
        /* TODO: patient password changed email
        await Email.send(foundPatient.get().emailAddress, 'Welcome to DOCme ' + foundPatient.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_PATIENT)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));
        */

        res.json({ isSuccess: true });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

router.delete('/:id', authorize, async function(req, res, next) {
  var patientId = req.params.id;
  if (patientId != req.patient.id) {
    res.sendStatus(403);
  } else {
    var patient = req.patient.toJSON();
    var emailAddress = patient.emailAddress;

    Database.Patient
      .destroy({ where: { id: patientId } })
      .then(async affectedRows => {     
           
        /* TODO: patient deleted email
        await Email.send(foundDoctor.get().emailAddress, 'Welcome to DOCme ' + foundDoctor.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_DOCTOR)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));
        */

        res.json({ isSuccess: true });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

module.exports = router;
