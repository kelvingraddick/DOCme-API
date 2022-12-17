var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var IdentityType = require('../constants/identity-type');
var UserType = require('../constants/user-type');
var Database = require('../helpers/database');
var DatabaseAttributes = require('../constants/database-attributes');

async function authenticate(req, res, next) {
  try {
    if (req.body.identityType == IdentityType.DOCME) {
      var emailAddress = req.body.emailAddress;
      var password = req.body.password;
      if (req.body.userType == UserType.PATIENT) {
        res.patient = await Database.Patient
          .findOne({
            where: { email_address: emailAddress },
            attributes: [...DatabaseAttributes.PATIENT, 'password']
          })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.patient &&
            await bcrypt.compare(password, res.patient.password)) {
          res.patient.password = undefined;
          res.token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: res.patient.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
          return next();
        }
      } else if (req.body.userType == UserType.DOCTOR) {
        res.doctor = await Database.Doctor
          .findOne({
            where: { email_address: emailAddress },
            attributes: [...DatabaseAttributes.DOCTOR, 'password'],
            include: [
              {
                model: Database.Image,
                attributes: DatabaseAttributes.IMAGE
              },
              { 
                model: Database.Practice,
                attributes: DatabaseAttributes.PRACTICE
              },
              { 
                model: Database.Schedule,
                attributes: DatabaseAttributes.SCHEDULE
              },
              { 
                model: Database.Specialty,
                attributes: DatabaseAttributes.SPECIALTY
              }
            ]
          })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.doctor &&
            await bcrypt.compare(password, res.doctor.password)) {
          res.doctor.password = undefined;
          res.token = jwt.sign({ type: UserType.DOCTOR }, process.env.TOKEN_SECRET, { subject: res.doctor.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
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