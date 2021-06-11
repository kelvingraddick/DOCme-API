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
  var existingDoctor = await Database.Doctor.findOne({ where: { email_address: req.body.emailAddress } });
  if (existingDoctor && existingDoctor.id != doctorId) {
    res.json({ isSuccess: false, errorCode: ErrorType.EMAIL_TAKEN, errorMessage: 'This email address is already taken.' });
  } else if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    var updatedDoctor = {
      is_active: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email_address: req.body.emailAddress,
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

router.post('/:doctorId/update/password', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  var isCurrentPasswordCorrect = await Database.Doctor.findOne({ where: { id: doctorId, password: req.body.currentPassword } }); // TODO: update to encryption
  if (!isCurrentPasswordCorrect) {
    res.json({ isSuccess: false, errorCode: ErrorType.INVALID_CREDENTIALS, errorMessage: 'This current password is not correct.' });
  } else if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    var updatedDoctor = {
      password: req.body.newPassword,
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
        
        /* TODO: doctor password changed email
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

router.post('/:doctorId/update/practice', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    Database.Practice
      .findOne({ where: { id: req.doctor.toJSON().practiceId } })
      .then(async function(foundPractice) {
        var newPractice = {
          name: req.body.name,
          description: req.body.description,
          website: req.body.website,
          email_address: req.body.emailAddress,
          phone_number: req.body.phoneNumber,
          fax_number: req.body.faxNumber,
          address_line_1: req.body.addressLine1,
          address_line_2: req.body.addressLine2,
          city: req.body.city,
          state: req.body.state,
          postal_code: req.body.postalCode,
          country_code: req.body.countryCode,
          latitude: req.body.latitude,
          longitude: req.body.longitude,
          image_url: req.body.imageUrl
        };

        if (foundPractice) {
          await Database.Practice.update(newPractice, { where: { id: foundPractice.id } });
        } else {
          var createdPractice = await Database.Practice.create(newPractice);
          var updatedDoctor = {
            practice_id: createdPractice.id
          };
          await Database.Doctor.update(updatedDoctor, { where: { id: doctorId } });
        }

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

router.post('/:doctorId/update/schedule', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    Database.Schedule
      .findOne({ where: { doctor_id: req.doctor.id } })
      .then(async function(foundSchedule) {
        var newSchedule = {
          doctor_id: req.doctor.id,
          sunday_availability_start_time: req.body.sundayAvailabilityStartTime,
          sunday_availability_end_time: req.body.sundayAvailabilityEndTime,
          sunday_break_start_time: req.body.sundayBreakStartTime,
          sunday_break_end_time: req.body.sundayBreakEndTime,
          monday_availability_start_time: req.body.mondayAvailabilityStartTime,
          monday_availability_end_time: req.body.mondayAvailabilityEndTime,
          monday_break_start_time: req.body.mondayBreakStartTime,
          monday_break_end_time: req.body.mondayBreakEndTime,
          tuesday_availability_start_time: req.body.tuesdayAvailabilityStartTime,
          tuesday_availability_end_time: req.body.tuesdayAvailabilityEndTime,
          tuesday_break_start_time: req.body.tuesdayBreakStartTime,
          tuesday_break_end_time: req.body.tuesdayBreakEndTime,
          wednesday_availability_start_time: req.body.wednesdayAvailabilityStartTime,
          wednesday_availability_end_time: req.body.wednesdayAvailabilityEndTime,
          wednesday_break_start_time: req.body.wednesdayBreakStartTime,
          wednesday_break_end_time: req.body.wednesdayBreakEndTime,
          thursday_availability_start_time: req.body.thursdayAvailabilityStartTime,
          thursday_availability_end_time: req.body.thursdayAvailabilityEndTime,
          thursday_break_start_time: req.body.thursdayBreakStartTime,
          thursday_break_end_time: req.body.thursdayBreakEndTime,
          friday_availability_start_time: req.body.fridayAvailabilityStartTime,
          friday_availability_end_time: req.body.fridayAvailabilityEndTime,
          friday_break_start_time: req.body.fridayBreakStartTime,
          friday_break_end_time: req.body.fridayBreakEndTime,
          saturday_availability_start_time: req.body.saturdayAvailabilityStartTime,
          saturday_availability_end_time: req.body.saturdayAvailabilityEndTime,
          saturday_break_start_time: req.body.saturdayBreakStartTime,
          saturday_break_end_time: req.body.saturdayBreakEndTime
        };

        if (foundSchedule) {
          await Database.Schedule.update(newSchedule, { where: { id: foundSchedule.id } });
        } else {
          await Database.Schedule.create(newSchedule);
        }

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
        
        /* TODO: doctor updated schedule
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
