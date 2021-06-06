var jwt = require('jsonwebtoken');
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
            where: { email_address: emailAddress, password: password },
            attributes: [
              'id',
              ['is_active', 'isActive'],
              ['first_name', 'firstName'],
              ['last_name', 'lastName'],
              ['email_address', 'emailAddress'],
              ['phone_number', 'phoneNumber'],
              'gender',
              'race',
              ['birth_date', 'birthDate'],
              ['address_line_1', 'addressLine1'],
              ['address_line_2', 'addressLine2'],
              'city',
              'state',
              ['postal_code', 'postalCode'],
              ['country_code', 'countryCode'],
              'latitude',
              'longitude',
              ['image_url', 'imageUrl'],
              ['insurance_provider_id', 'insuranceProviderId'],
              ['insurance_plan_id', 'insurancePlanId']
            ]
          })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.patient) {
          res.token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: res.patient.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
          return next();
        }
      } else if (req.body.userType == UserType.DOCTOR) {
        res.doctor = await Database.Doctor
          .findOne({
            where: { email_address: emailAddress, password: password },
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
              }
            ]
          })
          .catch((err) => { console.error(err.message); return res.sendStatus(500); });
        if (res.doctor) {
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