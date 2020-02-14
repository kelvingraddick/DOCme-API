var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Authenticator = require('../helpers/authenticator');
var Doctor = require('../models/doctor');

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

  response.doctors = await Doctor.findAll({
    attributes: [
			'id',
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
    where: {
			is_approved: true
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

module.exports = router;
