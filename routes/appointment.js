var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');
var authorize = require('../middleware/authorize');
var DatabaseAttributes = require('../constants/database-attributes');
var ErrorType = require('../constants/error-type');

router.get('/:id', authorize, async function(req, res, next) {
  var response = { isSuccess: false };

	var id = req.params.id;

  response.appointment = await Database.Appointment.findOne({
    attributes: DatabaseAttributes.APPOINTMENT,
    include: [
      {
        model: Database.Doctor,
        attributes: DatabaseAttributes.DOCTOR
      },
      { 
        model: Database.Patient,
        attributes: DatabaseAttributes.PATIENT
      },
      { 
        model: Database.Specialty
      }
    ],
    where: {
			id: id
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  response.isSuccess = response.appointment != null;

  res.json(response);
});

router.get('/patient/:patientId/list/', authorize, async function(req, res, next) {
  var response = { isSuccess: true }

	var patientId = req.params.patientId;

  response.appointments = await Database.Appointment.findAll({
    attributes: DatabaseAttributes.APPOINTMENT,
    include: [
      {
        model: Database.Doctor,
        attributes: DatabaseAttributes.DOCTOR
      },
      { 
        model: Database.Patient,
        attributes: DatabaseAttributes.PATIENT
      },
      { 
        model: Database.Specialty
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

router.post('/book', authorize, async function(req, res, next) {
  var newAppointment = {
    patient_id: req.body.patientId,
    doctor_id: req.body.doctorId,
    specialty_id: req.body.specialtyId,
    timestamp: req.body.timestamp,
    is_new_patient: req.body.isNewPatient,
    notes: req.body.notes
  };
  Database.Appointment.create(newAppointment)
    .then(async createdAppointment => {
      var foundAppointment = await Database.Appointment
        .findOne({
          where: { id: createdAppointment.id },
          attributes: DatabaseAttributes.APPOINTMENT
        });
      res.json({ isSuccess: true, appointment: foundAppointment });
    })
    .catch(error => { 
      res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
    });
});

router.post('/:appointmentId/update', authorize, async function(req, res, next) {
	var id = req.params.appointmentId;
  Database.Appointment.findOne({ where: { id: id } })
  .then(async function(appointment) {
    if (appointment) {
      appointment.specialty_id = req.body.specialtyId;
      appointment.timestamp = req.body.timestamp;
      appointment.is_new_patient = req.body.isNewPatient;
      appointment.notes = req.body.notes;
      await appointment.save();
      Database.Appointment.findOne({
        attributes: DatabaseAttributes.APPOINTMENT,
        include: [
          {
            model: Database.Doctor,
            attributes: DatabaseAttributes.DOCTOR
          },
          { 
            model: Database.Patient,
            attributes: DatabaseAttributes.PATIENT
          },
          { 
            model: Database.Specialty
          }
        ],
        where: {
          id: id
        }
      })
      .then(async function(appointment) {
        res.json({ isSuccess: true, appointment: appointment });
      })
      .catch((error) => {
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
    } else {
      res.json({ isSuccess: false, errorCode: ErrorType.NO_DATA_FOUND, errorMessage: 'Could not find appointment' });
    }
  })
  .catch((error) => {
    res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
  });
});

router.post('/:appointmentId/delete', authorize, async function(req, res, next) {
	var id = req.params.appointmentId;
  Database.Appointment.findOne({
    where: {
			id: id
    }
  })
  .then(async function(appointment) {
    if (appointment) {
      await appointment.destroy();
      res.json({ isSuccess: true });
    } else {
      res.json({ isSuccess: false, errorCode: ErrorType.NO_DATA_FOUND, errorMessage: 'Could not find appointment' });
    }
  })
  .catch((error) => {
    res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
  });
});

module.exports = router;
