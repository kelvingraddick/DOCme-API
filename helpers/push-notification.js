const OneSignal = require('onesignal-node');  
const OneSignalClient = new OneSignal.Client(process.env.ONE_SIGNAL_APP_ID, process.env.ONE_SIGNAL_API_KEY);

const PushNotification = {
  send: async function(message, subtitle, userId) {
    const notification = {
      contents: { 'en': message },
      subtitle: { 'en': subtitle },
      include_external_user_ids: [ userId ]
    };
    return OneSignalClient.createNotification(notification);
  }
};

module.exports = PushNotification;