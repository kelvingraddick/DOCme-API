var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Database = require('../helpers/database');
var Authenticator = require('../helpers/authenticator');

router.get('/signin', async function(req, res, next) {
  var authentication = await Authenticator(req, res);
  if (!authentication.isSuccess) return; 

  res.send(JSON.stringify({ isSuccess: true, patient: authentication.patient }));
});

router.get('/search', async function(req, res, next) {
  var response = { isSuccess: true }

	var specialtyId = req.params.specialtyId;
	var location = req.params.location;
	var date = req.params.date;
	var insuranceCarrierId = req.params.insuranceCarrierId;
	var insurancePlanId = req.params.insurancePlanId;

  response.doctors = await Database.Doctor.findAll({
    attributes: [
      'id',
      ['practice_id', 'practiceId'],
			['is_approved', 'isApproved'],
			['first_name', 'firstName'],
			['last_name', 'lastName'],
			['email_address', 'emailAddress'],
			['phone_number', 'phoneNumber'],
			['image_url', 'imageUrl'],
			'description',
			'gender',
			['birth_date', 'birthDate'],
      ['npi_number', 'npiNumber']
    ],
    include: [
      { 
        model: Database.Practice,
        attributes: [
          'id',
          'name',
          'description',
          'website',
          ['email_address', 'emailAddress'],
          ['phone_number', 'phoneNumber'],
          ['fax_number', 'faxNumber'],
          ['address_line_1', 'addressLine1'],
          ['address_line_2', 'addressLine2'],
          'city',
          'state',
          ['postal_code', 'postalCode'],
          ['country_code', 'countryCode'],
          'latitude',
          'longitude',
          ['image_url', 'imageUrl']
        ]
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
    attributes: [
      'id',
      ['practice_id', 'practiceId'],
			['is_approved', 'isApproved'],
			['first_name', 'firstName'],
			['last_name', 'lastName'],
			['email_address', 'emailAddress'],
			['phone_number', 'phoneNumber'],
			['image_url', 'imageUrl'],
			'description',
			'gender',
			['birth_date', 'birthDate'],
      ['npi_number', 'npiNumber']
    ],
    include: [
      { 
        model: Database.Practice,
        attributes: [
          'id',
          'name',
          'description',
          'website',
          ['email_address', 'emailAddress'],
          ['phone_number', 'phoneNumber'],
          ['fax_number', 'faxNumber'],
          ['address_line_1', 'addressLine1'],
          ['address_line_2', 'addressLine2'],
          'city',
          'state',
          ['postal_code', 'postalCode'],
          ['country_code', 'countryCode'],
          'latitude',
          'longitude',
          ['image_url', 'imageUrl']
        ]
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
