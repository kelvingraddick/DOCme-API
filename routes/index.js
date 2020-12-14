var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');
var Email = require('../helpers/email/email');

/* GET home page. */
router.get('/', function(req, res, next) {
  Database
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
  res.render('index', { title: 'Express' });
});

/* Test email. */
router.post('/test/email', async function(req, res, next) {
  await Email.send('kelvingraddick@gmail.com', 'Welcome to DOCme!', 'Thank you for joining DOCme', Email.templates.WELCOME)
    .then(
      () => res.json({ isSuccess: true }),
      error => res.json({ isSuccess: false, message: error.message })
    )
    .catch(error => res.json({ isSuccess: false, message: error.message }))
});

module.exports = router;
