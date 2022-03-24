var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');
var PushNotification = require('../helpers/push-notification');
var Email = require('../helpers/email/email');
var authorize = require('../middleware/authorize');
var DatabaseAttributes = require('../constants/database-attributes');
var ErrorType = require('../constants/error-type');

router.get('/:id', async function(req, res, next) {
  var response = { isSuccess: false };

	var id = req.params.id;

  response.rating = await Database.Rating.findOne({
    attributes: DatabaseAttributes.RATING,
    include: [
      {
        model: Database.Doctor,
        attributes: DatabaseAttributes.DOCTOR
      },
      { 
        model: Database.Patient,
        attributes: DatabaseAttributes.PATIENT
      }
    ],
    where: {
			id: id
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  response.isSuccess = response.rating != null;

  res.json(response);
});

router.post('/upsert', authorize, async function(req, res, next) {
  var patientId = req.body.patientId;
  var doctorId = req.body.doctorId;
  if (patientId != req.patient.id) {
    res.sendStatus(403);
  } else {
    Database.Rating
      .findOne({ where: { patient_id: patientId, doctor_id: doctorId } })
      .then(async function(foundRating) {
        var newRating = {
          patient_id: patientId,
          doctor_id: doctorId,
          timestamp: req.body.timestamp,
          value: req.body.value,
          notes: req.body.notes
        };

        if (foundRating) {
          await Database.Rating.update(newRating, { where: { id: foundRating.get().id } });
        } else {
          await Database.Rating.create(newRating);
        }

        var foundDoctor = await Database.Doctor.findOne({ where: { id: doctorId }});
        if (foundDoctor) {
          foundDoctor.average_rating = req.body.value;
          foundDoctor.number_of_ratings = foundDoctor.number_of_ratings + 1; 
          await foundDoctor.save();
        }
        
        foundRating = await Database.Rating.findOne({ where: { patient_id: patientId, doctor_id: doctorId }});

        await PushNotification.send('You just recieved a new rating from a patient! See more details on the DOCme app.', 'You just recieved a new rating from a patient!', 'doctor' + doctorId)
          .then(() => {}, error => console.error('Push notification error: ' + error.message))
          .catch(error => console.error('Push notification error: ' + error.message));

        res.json({ isSuccess: true, rating: foundRating });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

router.get('/patient/:patientId/list/', authorize, async function(req, res, next) {
  var response = { isSuccess: true }

	var patientId = req.params.patientId;

  response.ratings = await Database.Rating.findAll({
    attributes: DatabaseAttributes.RATING,
    include: [
      {
        model: Database.Doctor,
        attributes: DatabaseAttributes.DOCTOR
      },
      { 
        model: Database.Patient,
        attributes: DatabaseAttributes.PATIENT
      }
    ],
    where: {
			patient_id: patientId
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

router.get('/doctor/:doctorId/list/', authorize, async function(req, res, next) {
  var response = { isSuccess: true }

	var doctorId = req.params.doctorId;

  response.ratings = await Database.Rating.findAll({
    attributes: DatabaseAttributes.RATING,
    include: [
      {
        model: Database.Doctor,
        attributes: DatabaseAttributes.DOCTOR
      },
      { 
        model: Database.Patient,
        attributes: DatabaseAttributes.PATIENT
      }
    ],
    where: {
			doctor_id: doctorId
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

module.exports = router;
