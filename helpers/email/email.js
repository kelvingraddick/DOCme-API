var sendgrid = require('@sendgrid/mail');
var WelcomeTemplate = require('../email/templates/welcome');

const Email = {
  templates: {
    WELCOME: WelcomeTemplate
  },
  send: async function(to, subject, preheader, html) {
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    var data = {
      to: to,
      from: process.env.SENDGRID_EMAIL_ADDRESS,
      subject: subject,
      text: preheader,
      html: html
    };
    return sendgrid.send(data);
  }
};

module.exports = Email;