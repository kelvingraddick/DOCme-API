var jwt = require('jsonwebtoken');
var UserType = require('../constants/user-type');
var Database = require('../helpers/database');

async function authorize(req, res, next) {
  try {
    var authorizationHeader = req.headers['authorization'];
    var requestToken = authorizationHeader && authorizationHeader.split(' ')[1];
    var decodedToken = jwt.verify(requestToken, process.env.TOKEN_SECRET, { issuer: 'DOCme' });
    if (decodedToken) {
      if (decodedToken.type == UserType.PATIENT) {
        req.patient = await Database.Patient
          .findOne({ where: { id: decodedToken.sub }, attributes: { exclude: ['password'] } })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (req.patient) { return next(); }
        res.sendStatus(403);
      } else if (decodedToken.type == UserType.DOCTOR) {
        req.doctor = await Database.Doctor
          .findOne({ where: { id: decodedToken.sub }, attributes: { exclude: ['password'] } })
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