var express = require('express');
var router = express.Router();
var https = require('https');
var Sequelize = require('sequelize');
var InsuranceCarrier = require('../models/insurance-carrier');
var InsurancePlan = require('../models/insurance-plan');

router.get('/carriers/search/:query', async function(req, res, next) {
  var response = { isSuccess: true }

  var query = req.params.query;
  response.insuranceCarriers = await InsuranceCarrier.findAll({
    attributes: [ 'id', ['external_id', 'externalId'], 'name' ],
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

router.get('/plans/search/:query', async function(req, res, next) {
  var response = { isSuccess: true }

  var query = req.params.query;
  response.insurancePlans = await InsurancePlan.findAll({
    attributes: [ 'id', ['insurance_carrier_id', 'insuranceCarrierId'], ['external_id', 'externalId'], 'name' ],
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

router.get('/carrier/:carrierId/plans/', async function(req, res, next) {
  var response = { isSuccess: true }

  var carrierId = req.params.carrierId;
  response.insurancePlans = await InsurancePlan.findAll({
    attributes: [ 'id', ['insurance_carrier_id', 'insuranceCarrierId'], ['external_id', 'externalId'], 'name' ],
    where: {
      insurance_carrier_id: carrierId
    }
  }).catch((error) => {
    response.isSuccess = false;
    response.errorMessage = error.message;
  });

  res.json(response);
});

router.post('/sync', async function(req, res, next) {
  var carrierResponse = { isSuccess: true }

  https.get('https://api.betterdoctor.com/2016-03-01/insurances?user_key=' + process.env.BETTER_DOCTOR_USER_KEY, (betterDoctorResponse) => {
    let data = '';
    betterDoctorResponse.on('data', (chunk) => {
      data += chunk;
    });
    betterDoctorResponse.on('end', () => {
      var pendingDatabaseCarriers = [];
      var pendingDatabasePlans = [];

      var betterDoctorCarriers = JSON.parse(data).data;
      for (var i = 0; i < betterDoctorCarriers.length; i++) {
        var betterDoctorCarrier = betterDoctorCarriers[i];
        pendingDatabaseCarriers.push({
          external_id: betterDoctorCarrier.uid,
          name: betterDoctorCarrier.name
        });
        var betterDoctorPlans = betterDoctorCarrier.plans;
        for (var j = 0; j < betterDoctorPlans.length; j++) {
          var betterDoctorPlan = betterDoctorPlans[j];
          pendingDatabasePlans.push({
            carrier_uid: betterDoctorCarrier.uid,
            plan_uid: betterDoctorPlan.uid,
            name: betterDoctorPlan.name
          });
        }
      }

      InsuranceCarrier.destroy({ truncate: true });
      console.log("CURRENT CARRIERS DELETED FROM DATABASE");
      InsuranceCarrier.bulkCreate(pendingDatabaseCarriers)
      .then(() => {
        console.log("NEW CARRIERS INSERTED INTO DATABASE");
        return InsuranceCarrier.findAll();
      }).then(newDatabaseCarriers => {
          for (var k = 0; k < pendingDatabasePlans.length; k++) {
            var newDatabaseCarrier = getItemFromArray(newDatabaseCarriers, "external_id", pendingDatabasePlans[k].carrier_uid);
            if (newDatabaseCarrier) {
              pendingDatabasePlans[k].insurance_carrier_id = newDatabaseCarrier.id;
              pendingDatabasePlans[k].carrier_uid = undefined;
              pendingDatabasePlans[k].external_id = pendingDatabasePlans[k].plan_uid;
              pendingDatabasePlans[k].plan_uid = undefined;
            }
          }

          InsurancePlan.destroy({ truncate: true });
          console.log("CURRENT PLANS DELETED FROM DATABASE");
          InsurancePlan.bulkCreate(pendingDatabasePlans)
          .then(() => {
            console.log("NEW PLANS INSERTED INTO DATABASE");
            res.send(JSON.stringify(carrierResponse));
          })
          .catch(error => { onError(error, res); });

      })
      .catch(error => { onError(error, res); });

    });
  }).on("error", (error) => {
    onError(error, res);
  });
});

function getItemFromArray(array, key, value) {
  for (var i = 0; i < array.length; i++) {
      if (array[i] && array[i][key] == value) {
          return array[i];
      }
  }
}

function onError(error, res) {
  var response = {
    isSuccess: false,
    errorMessage: error && error.message
  };
  res.send(JSON.stringify(response));
}

module.exports = router;