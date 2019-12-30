var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Authenticator = require('../helpers/authenticator');
var Specialty = require('../models/specialty');

router.get('/search/:query', async function(req, res, next) {
  var response = { isSuccess: true }

  var query = req.params.query;
  response.specialties = await Specialty.findAll({
    where: {
      name: {
        [Sequelize.Op.startsWith]: query
      }
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.send(JSON.stringify(response));
});

module.exports = router;
