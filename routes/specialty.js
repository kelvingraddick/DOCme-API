var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
var Database = require('../helpers/database');

router.get('/list', async function(req, res, next) {
  var response = { isSuccess: true }

  response.specialties = await Database.Specialty.findAll()
    .catch((error) => {
      response.isSuccess = false;
      response.errorMessage = error.message;
    });

  res.json(response);
});

router.get('/search/:query', async function(req, res, next) {
  var response = { isSuccess: true }

  var query = req.params.query;
  response.specialties = await Database.Specialty.findAll({
    where: {
      name: {
        [Sequelize.Op.startsWith]: query
      }
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

module.exports = router;
