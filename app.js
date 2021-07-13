var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var patientRouter = require('./routes/patient');
var doctorRouter = require('./routes/doctor');
var practiceRouter = require('./routes/practice');
var specialtyRouter = require('./routes/specialty');
var insuranceRouter = require('./routes/insurance.js');
var appointmentRouter = require('./routes/appointment.js');
var stripeRouter = require('./routes/stripe.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/patient', patientRouter);
app.use('/doctor', doctorRouter);
app.use('/practice', practiceRouter);
app.use('/specialty', specialtyRouter);
app.use('/insurance', insuranceRouter);
app.use('/appointment', appointmentRouter);
app.use('/stripe', stripeRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
