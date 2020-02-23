var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Database = require('../helpers/database');

router.get('/search', async function(req, res, next) {
  var response = { isSuccess: true }

	var location = req.params.location;

  response.practices = await Database.Practice.findAll({
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
    ],
    where: {
			//is_approved: true
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

module.exports = router;