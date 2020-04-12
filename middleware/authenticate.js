var jwt = require('jsonwebtoken');
var IdentityType = require('../constants/identity-type');
var UserType = require('../constants/user-type');
var Database = require('../helpers/database');

async function authenticate(req, res, next) {
  try {
    if (req.body.identityType == IdentityType.DOCME) {
      var emailAddress = req.body.emailAddress;
      var password = req.body.password;
      if (req.body.userType == UserType.PATIENT) {
        res.patient = await Database.Patient
          .findOne({ where: { email_address: emailAddress, password: password } })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.patient) {
          res.token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: res.patient.id.toString(), issuer: 'DOCme', expiresIn: '3m' });
          return next();
        }
      } else if (req.body.userType == UserType.DOCTOR) {
        res.doctor = await Database.Doctor
          .findOne({ where: { email_address: emailAddress, password: password } })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.doctor) {
          res.token = jwt.sign({ type: UserType.DOCTOR }, process.env.TOKEN_SECRET, { subject: res.doctor.id.toString(), issuer: 'DOCme', expiresIn: '3m' });
          return next();
        }
      }
    }
    res.sendStatus(401);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
}

module.exports = authenticate;