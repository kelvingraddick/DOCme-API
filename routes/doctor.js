var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var Database = require('../helpers/database');
var Email = require('../helpers/email/email');
var UserType = require('../constants/user-type');
var ErrorType = require('../constants/error-type');
var DatabaseAttributes = require('../constants/database-attributes');

router.post('/authenticate', authenticate, async function(req, res, next) {
  res.json({ isSuccess: true, token: res.token, doctor: res.doctor });
});

router.post('/authorize', authorize, async function(req, res, next) {
  res.json({ isSuccess: true, doctor: req.doctor });
});

router.post('/register', async function(req, res, next) {
  var existingDoctor = await Database.Doctor.findOne({ where: { email_address: req.body.emailAddress } });
  if (existingDoctor) {
    res.json({ isSuccess: false, errorCode: ErrorType.EMAIL_TAKEN, errorMessage: 'This email address is already taken.' });
  } else {
    var newDoctor = {
      is_approved: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email_address: req.body.emailAddress,
      password: req.body.password,
      gender: req.body.gender,
      race: req.body.race,
      image_url: req.body.imageUrl
    };
    Database.Doctor.create(newDoctor)
      .then(async createdDoctor => {
        var foundDoctor = await Database.Doctor
          .findOne({
            where: { id: createdDoctor.id },
            attributes: DatabaseAttributes.DOCTOR,
            include: [
              {
                model: Database.Image,
                attributes: DatabaseAttributes.IMAGE
              },
              { 
                model: Database.Practice,
                attributes: DatabaseAttributes.PRACTICE
              },
              { 
                model: Database.Schedule,
                attributes: DatabaseAttributes.SCHEDULE
              }
            ]
          });
        
        await Email.send(foundDoctor.get().emailAddress, 'Welcome to DOCme ' + foundDoctor.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_DOCTOR)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));

        var token = jwt.sign({ type: UserType.DOCTOR }, process.env.TOKEN_SECRET, { subject: foundDoctor.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
        res.json({ isSuccess: true, doctor: foundDoctor, token: token });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

router.post('/:doctorId/update', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    var updatedDoctor = {
      is_active: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      gender: req.body.gender,
      race: req.body.race,
      image_url: req.body.imageUrl
    };
    Database.Doctor.update(updatedDoctor, { where: { id: doctorId } })
      .then(async numberUpdated => {
        console.info('Number of doctors updated: ' + numberUpdated);

        var foundDoctor = await Database.Doctor
          .findOne({
            where: { id: doctorId },
            attributes: DatabaseAttributes.DOCTOR,
            include: [
              {
                model: Database.Image,
                attributes: DatabaseAttributes.IMAGE
              },
              { 
                model: Database.Practice,
                attributes: DatabaseAttributes.PRACTICE
              },
              { 
                model: Database.Schedule,
                attributes: DatabaseAttributes.SCHEDULE
              }
            ]
          });
        
        /* TODO: doctor changed email
        await Email.send(foundDoctor.get().emailAddress, 'Welcome to DOCme ' + foundDoctor.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_DOCTOR)
          .then(() => {}, error => console.error('Email error: ' + error.message))
          .catch(error => console.error('Email error: ' + error.message));
        */

        res.json({ isSuccess: true, doctor: foundDoctor });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

router.get('/search', async function(req, res, next) {
  var response = { isSuccess: true }

	var specialtyId = req.params.specialtyId;
	var location = req.params.location;
	var date = req.params.date;
	var insuranceCarrierId = req.params.insuranceCarrierId;
	var insurancePlanId = req.params.insurancePlanId;

  response.doctors = await Database.Doctor.findAll({
    attributes: DatabaseAttributes.DOCTOR,
    include: [
      { 
        model: Database.Practice,
        attributes: DatabaseAttributes.PRACTICE
      }
    ],
    where: {
			is_approved: true
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

router.get('/:id', async function(req, res, next) {
  var response = { isSuccess: false };

	var id = req.params.id;

  response.doctor = await Database.Doctor.findOne({
    attributes: DatabaseAttributes.DOCTOR,
    include: [
      {
        model: Database.Image,
        attributes: [
          'id',
          ['doctor_id', 'doctorId'],
          'url',
          'description'
        ]
      },
      { 
        model: Database.Practice,
        attributes: DatabaseAttributes.PRACTICE
      },
      { 
        model: Database.Schedule,
        attributes: [
          'id',
          ['doctor_id', 'doctorId'],
          ['sunday_availability_start_time', 'sundayAvailabilityStartTime'],
          ['sunday_availability_end_time', 'sundayAvailabilityEndTime'],
          ['sunday_break_start_time', 'sundayBreakStartTime'],
          ['sunday_break_end_time', 'sundayBreakEndTime'],
          ['monday_availability_start_time', 'mondayAvailabilityStartTime'],
          ['monday_availability_end_time', 'mondayAvailabilityEndTime'],
          ['monday_break_start_time', 'mondayBreakStartTime'],
          ['monday_break_end_time', 'mondayBreakEndTime'],
          ['tuesday_availability_start_time', 'tuesdayAvailabilityStartTime'],
          ['tuesday_availability_end_time', 'tuesdayAvailabilityEndTime'],
          ['tuesday_break_start_time', 'tuesdayBreakStartTime'],
          ['tuesday_break_end_time', 'tuesdayBreakEndTime'],
          ['wednesday_availability_start_time', 'wednesdayAvailabilityStartTime'],
          ['wednesday_availability_end_time', 'wednesdayAvailabilityEndTime'],
          ['wednesday_break_start_time', 'wednesdayBreakStartTime'],
          ['wednesday_break_end_time', 'wednesdayBreakEndTime'],
          ['thursday_availability_start_time', 'thursdayAvailabilityStartTime'],
          ['thursday_availability_end_time', 'thursdayAvailabilityEndTime'],
          ['thursday_break_start_time', 'thursdayBreakStartTime'],
          ['thursday_break_end_time', 'thursdayBreakEndTime'],
          ['friday_availability_start_time', 'fridayAvailabilityStartTime'],
          ['friday_availability_end_time', 'fridayAvailabilityEndTime'],
          ['friday_break_start_time', 'fridayBreakStartTime'],
          ['friday_break_end_time', 'fridayBreakEndTime'],
          ['saturday_availability_start_time', 'saturdayAvailabilityStartTime'],
          ['saturday_availability_end_time', 'saturdayAvailabilityEndTime'],
          ['saturday_break_start_time', 'saturdayBreakStartTime'],
          ['saturday_break_end_time', 'saturdayBreakEndTime']
        ]
      }
    ],
    where: {
			id: id
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  response.isSuccess = response.doctor != null;

  res.json(response);
});

module.exports = router;
