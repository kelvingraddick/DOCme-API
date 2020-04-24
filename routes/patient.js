var express = require('express');
var router = express.Router();
var authenticate = require('../middleware/authenticate');
var authorize = require('../middleware/authorize');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var path = require('path');
var Database = require('../helpers/database');
var UserType = require('../constants/user-type');
var ErrorType = require('../constants/error-type');

var imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/patient')
  },
  filename: function (req, file, cb) {
    cb(null, 'patient.' + Date.now() + '.' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
})
var upload = multer({ storage: imageStorage });

router.post('/authenticate', authenticate, async function(req, res, next) {
  res.json({ isSuccess: true, token: res.token, patient: res.patient });
});

router.post('/authorize', authorize, async function(req, res, next) {
  res.json({ isSuccess: true, patient: req.patient });
});

router.post('/register', upload.single('image'), async function(req, res, next) {
  var existingPatient = await Database.Patient.findOne({ where: { email_address: req.body.emailAddress } });
  if (existingPatient) {
    res.json({ isSuccess: false, errorCode: ErrorType.EMAIL_TAKEN, errorMessage: 'This email address is already taken.' });
  } else {
    var newPatient = {
      is_active: true,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email_address: req.body.emailAddress,
      password: req.body.password,
      image_url: req.file ? (req.protocol + '://' + req.get('host') + '/images/patient/' + req.file.filename) : null
    };
    Database.Patient.create(newPatient)
      .then(patient => {
        var token = jwt.sign({ type: UserType.PATIENT }, process.env.TOKEN_SECRET, { subject: patient.id.toString(), issuer: 'DOCme', expiresIn: '90d' });
        res.json({ isSuccess: true, patient: patient, token: token });
      })
      .catch(error => { 
        res.json({ isSuccess: false, errorCode: ErrorType.DATABASE_PROBLEM, errorMessage: error.message });
      });
  }
});

module.exports = router;
