var AWS = require('aws-sdk');
var WelcomePatientTemplate = require('./templates/welcome-patient');
var WelcomeDoctorTemplate = require('../email/templates/welcome-doctor');
var AppointmentBookedTemplate = require('../email/templates/appointment-booked');
var ResetPasswordRequestTemplate = require('../email/templates/reset-password-request');

const Email = {
  templates: {
    WELCOME_PATIENT: WelcomePatientTemplate,
    WELCOME_DOCTOR: WelcomeDoctorTemplate,
    APPOINTMENT_BOOKED: AppointmentBookedTemplate,
    RESET_PASSWORD_REQUEST: ResetPasswordRequestTemplate
  },
  send: async function(to, subject, preheader, template, fields) {
    console.log("About to send email with AWS SES: " + JSON.stringify({ to, subject, fields }));
    return new AWS.SES({
        apiVersion: "2010-12-01",
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
        region: process.env.AWS_SES_REGION
      })
      .sendEmail({
        Destination: { /* required */
          CcAddresses: [],
          ToAddresses: [to]
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
             Data: _getTemplateHtml(template, fields)
            },
            Text: {
             Charset: "UTF-8",
             Data: preheader
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: subject
           }
          },
        Source: process.env.AWS_SES_EMAIL_ADDRESS, /* required */
        ReplyToAddresses: [],
      })
      .promise();
  }
};

const _getTemplateHtml = function(template, fields) {
  for (var field in fields) {
    template = template.replace('{{ ' + field + ' }}', fields[field]);
  }
  return template;
};

module.exports = Email;