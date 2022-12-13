var express = require('express');
var router = express.Router();
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var Database = require('../helpers/database');
var Sequelize = require('sequelize');
var Crypto = require('crypto')
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
      password: await bcrypt.hash(req.body.password, 10),
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
              },
              { 
                model: Database.Specialty,
                attributes: DatabaseAttributes.SPECIALTY
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
              },
              { 
                model: Database.Specialty,
                attributes: DatabaseAttributes.SPECIALTY
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
  var doctor = await Database.Doctor.findOne({ where: { id: doctorId } });
  if (!doctor || !await bcrypt.compare(req.body.currentPassword, doctor.password)) {
    res.json({ isSuccess: false, errorCode: ErrorType.INVALID_CREDENTIALS, errorMessage: 'This current password is not correct.' });
  } else if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    var updatedDoctor = {
      password: await bcrypt.hash(req.body.newPassword, 10),
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
              },
              { 
                model: Database.Specialty,
                attributes: DatabaseAttributes.SPECIALTY
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

router.post('/reset/password/request', async function(req, res, next) {
  var doctor = await Database.Doctor.findOne({ where: { email_address: req.body.emailAddress } });
  if (doctor) {
    var updatedDoctor = {
      reset_password_code: Crypto.randomUUID(),
      reset_password_timestamp: Sequelize.literal('CURRENT_TIMESTAMP')
    };
    Database.Doctor.update(updatedDoctor, { where: { id: doctor.id } })
      .then(async numberUpdated => {
        console.info('Number of doctors updated: ' + numberUpdated);

        var foundDoctor = await Database.Doctor
          .findOne({
            where: { id: doctor.id },
            attributes: DatabaseAttributes.DOCTOR
          });
        
        await Email.send(
          foundDoctor.get().emailAddress,
          'Your reset password request for DOCme!',
          'A password reset was request for an account with this email address on DOCme',
          Email.templates.RESET_PASSWORD_REQUEST,
          {
            reset_password_expiration_minutes: 10,
            reset_password_link: 'http://app.docmeapp.com/resetpassword/?code=' + foundDoctor.get().resetPasswordCode
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
  var doctor = await Database.Doctor.findOne({ where: { reset_password_code: code } });
  if (!doctor) {
    res.status(403).send('Password reset code is invalid.');
  } else if (
    !doctor.reset_password_timestamp ||
    (new Date() - doctor.reset_password_timestamp) > 600000) { // 10 minutes
    res.status(403).send('Password reset request timed-out.');
  } else {
    var updatedDoctor = {
      password: await bcrypt.hash(req.body.newPassword, 10),
      reset_password_code: null,
      reset_password_timestamp: null
    };
    Database.Doctor.update(updatedDoctor, { where: { id: doctor.id } })
      .then(async numberUpdated => {
        console.info('Number of doctors updated: ' + numberUpdated);

        /*
        var foundDoctor = await Database.Doctor
          .findOne({
            where: { id: doctor.id },
            attributes: DatabaseAttributes.DOCTOR
          });
        */
        
        /* TODO: doctor password changed email
        await Email.send(foundDoctor.get().emailAddress, 'Welcome to DOCme ' + foundDoctor.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_PATIENT)
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
            },
            { 
              model: Database.Specialty,
              attributes: DatabaseAttributes.SPECIALTY
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
            },
            { 
              model: Database.Specialty,
              attributes: DatabaseAttributes.SPECIALTY
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

router.post('/:doctorId/update/specialties', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {

    Database.DoctorSpecialty
      .destroy({ where: { doctor_id: doctorId } })
      .then(async function(affectedRows) {
        
        var specialtyIds = req.body.specialtyIds;
        var specialties = specialtyIds.map((specialtyId) => { return { doctor_id: doctorId, specialty_id: specialtyId }; });

        await Database.DoctorSpecialty.bulkCreate(specialties);

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
            },
            { 
              model: Database.Specialty,
              attributes: DatabaseAttributes.SPECIALTY
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

router.post('/:doctorId/cancel/subscription', authorize, async function(req, res, next) {
  var doctorId = req.params.doctorId;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    try {

      const customer = await stripe.customers.retrieve(req.doctor.toJSON().stripeCustomerId, { expand: ['subscriptions']});
      if (!customer) {
        res.json({ isSuccess: false, errorCode: ErrorType.NO_DATA_FOUND, errorMessage: 'Stripe customer not found.' });
      } else {

        const subscription = customer.subscriptions.data[0];
        if (!subscription) {
          res.json({ isSuccess: false, errorCode: ErrorType.NO_DATA_FOUND, errorMessage: 'Stripe subscription not found.' });
        } else {
          
          const deleted = await stripe.subscriptions.del(subscription.id);

          req.doctor.stripe_customer_id = null;
          req.doctor.stripe_plan_id = null;
          req.doctor.stripe_subscription_status = null;
          await req.doctor.save();

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
              },
              { 
                model: Database.Specialty,
                attributes: DatabaseAttributes.SPECIALTY
              }
            ]
          });

          /* TODO: doctor changed email
          await Email.send(foundDoctor.get().emailAddress, 'Welcome to DOCme ' + foundDoctor.get().firstName + '!', 'Thank you for joining the DOCme platform', Email.templates.WELCOME_DOCTOR)
            .then(() => {}, error => console.error('Email error: ' + error.message))
            .catch(error => console.error('Email error: ' + error.message));
          */

          res.json({ isSuccess: true, doctor: foundDoctor });
        }
      }
    } catch (error) { 
      res.json({ isSuccess: false, errorCode: ErrorType.SERVER_PROBLEM, errorMessage: error.message });
    }
  }
});

router.get('/search', async function(req, res, next) {
  var doctorWhereClause = { is_approved: 1 };
  var practiceWhereClause = {};
  var practiceRequired = false;
  var scheduleWhereClause = {};
  var specialtyWhereClause = {};
  var specialtyRequired = false;
  
  if (req.query.query) {
    doctorWhereClause[Sequelize.Op.or] = doctorWhereClause[Sequelize.Op.or] || [];
    doctorWhereClause[Sequelize.Op.or].push(
      { first_name: { [Sequelize.Op.substring]: req.query.query } },
      { last_name: { [Sequelize.Op.substring]: req.query.query } },
      { description: { [Sequelize.Op.substring]: req.query.query } }
    );
    practiceWhereClause[Sequelize.Op.or] = practiceWhereClause[Sequelize.Op.or] || [];
    practiceWhereClause[Sequelize.Op.or].push(
      { name: { [Sequelize.Op.substring]: req.query.query } },
      { description: { [Sequelize.Op.substring]: req.query.query } }
    );
  }

  if (req.query.specialtyId) {
    specialtyWhereClause = {
      id: req.query.specialtyId
    };
    specialtyRequired = true;
  }

  if (req.query.postalCode) {
    practiceWhereClause = {
      postal_code: req.query.postalCode
    };
    practiceRequired = true;
  }

  Database.Doctor
    .findAll({
      where: doctorWhereClause,
      attributes: DatabaseAttributes.DOCTOR,
      include: [
        {
          model: Database.Image,
          attributes: DatabaseAttributes.IMAGE,
          required: false
        },
        { 
          model: Database.Practice,
          attributes: DatabaseAttributes.PRACTICE,
          where: practiceWhereClause,
          required: practiceRequired
        },
        { 
          model: Database.Schedule,
          attributes: DatabaseAttributes.SCHEDULE,
          where: scheduleWhereClause,
          required: false
        },
        { 
          model: Database.Specialty,
          attributes: DatabaseAttributes.SPECIALTY,
          where: specialtyWhereClause,
          required: specialtyRequired
        }
      ]
    })
    .then(async doctors => {
      res.json({ isSuccess: true, count: doctors.length, doctors: doctors });
    })
    .catch(error => { 
      res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
    });
});

router.get('/:id', async function(req, res, next) {
  var response = { isSuccess: false };

	var id = req.params.id;

  response.doctor = await Database.Doctor.findOne({
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
      },
      { 
        model: Database.Specialty,
        attributes: DatabaseAttributes.SPECIALTY
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

router.delete('/:id', authorize, async function(req, res, next) {
  var doctorId = req.params.id;
  if (doctorId != req.doctor.id) {
    res.sendStatus(403);
  } else {
    var doctor = req.doctor.toJSON();
    var stripeCustomerId = doctor.stripeCustomerId;
    var emailAddress = doctor.emailAddress;

    Database.Doctor
      .destroy({ where: { id: doctorId } })
      .then(async affectedRows => {     

        const customer = await stripe.customers.retrieve(stripeCustomerId, { expand: ['subscriptions']});
        if (customer) {
          const subscription = customer.subscriptions.data[0];
          if (subscription) {
            const deleted = await stripe.subscriptions.del(subscription.id);
          }
        }

        /*
        await Email.send(emailAddress, 'Your DOCme account have been deleted.', 'Sorry to see you go!', Email.templates.WELCOME_DOCTOR)
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
