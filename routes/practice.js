var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Database = require('../helpers/database');
var DatabaseAttributes = require('../constants/database-attributes');

router.get('/search', async function(req, res, next) {
  var response = { isSuccess: true }

	var location = req.params.location;

  response.practices = await Database.Practice.findAll({
    attributes: DatabaseAttributes.PRACTICE,
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