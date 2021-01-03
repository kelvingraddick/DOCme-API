var sendgrid = require('@sendgrid/mail');
var WelcomePatientTemplate = require('./templates/welcome-patient');
var WelcomeDoctorTemplate = require('../email/templates/welcome-doctor');
var AppointmentBookedTemplate = require('../email/templates/appointment-booked');

const Email = {
  templates: {
    WELCOME_PATIENT: WelcomePatientTemplate,
    WELCOME_DOCTOR: WelcomeDoctorTemplate,
    APPOINTMENT_BOOKED: AppointmentBookedTemplate
  },
  send: async function(to, subject, preheader, template, fields) {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    var data = {
      to: to,
      from: process.env.SENDGRID_EMAIL_ADDRESS,
      subject: subject,
      text: preheader,
      html: _getTemplateHtml(template, fields)
    };
    return sendgrid.send(data);
  }
};

const _getTemplateHtml = function(template, fields) {
  for (var field in fields) {
    template = template.replace('{{ ' + field + ' }}', fields[field]);
  }
  return template;
};

module.exports = Email;