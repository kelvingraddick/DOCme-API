var jwt = require('jsonwebtoken');
var UserType = require('../constants/user-type');
var Database = require('../helpers/database');
var DatabaseAttributes = require('../constants/database-attributes');

async function authorize(req, res, next) {
  try {
    var authorizationHeader = req.headers['authorization'];
    var requestToken = authorizationHeader && authorizationHeader.split(' ')[1];
    var decodedToken = jwt.verify(requestToken, process.env.TOKEN_SECRET, { issuer: 'DOCme' });
    if (decodedToken) {
      if (decodedToken.type == UserType.PATIENT) {
        req.patient = await Database.Patient
          .findOne({
            where: { id: decodedToken.sub },
            attributes: DatabaseAttributes.PATIENT
          })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (req.patient) { return next(); }
        res.sendStatus(403);
      } else if (decodedToken.type == UserType.DOCTOR) {
        req.doctor = await Database.Doctor
          .findOne({
            where: { id: decodedToken.sub },
            attributes: DatabaseAttributes.DOCTOR,
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