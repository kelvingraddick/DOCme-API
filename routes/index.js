var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');

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

module.exports = router;
