var jwt = require('jsonwebtoken');
var UserType = require('../constants/user-type');
var Patient = require('../models/patient');
var Doctor = require('../models/doctor');

async function authorize(req, res, next) {
  try {
    var authorizationHeader = req.headers['authorization'];
    var requestToken = authorizationHeader && authorizationHeader.split(' ')[1];
    var decodedToken = jwt.verify(requestToken, process.env.TOKEN_SECRET, { issuer: 'DOCme' });
    if (decodedToken) {
      if (decodedToken.type == UserType.PATIENT) {
        req.patient = await Patient
          .findOne({ where: { id: decodedToken.sub } })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (req.patient) { return next(); }
        res.sendStatus(403);
      } else if (decodedToken.type == UserType.DOCTOR) {
        req.doctor = await Doctor
          .findOne({ where: { id: decodedToken.sub } })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (req.doctor) { return next(); }
        res.sendStatus(403);
      }
    }
    res.sendStatus(401);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
}

module.exports = authorize;