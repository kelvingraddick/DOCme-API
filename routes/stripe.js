var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');

router.post('/webhook', async function(req, res, next) {
  const event = req.body;
  const session = event && event.data && event.data.object;
  console.info("Got Stripe event: " + JSON.stringify(event));
  
  switch (event && event.type) {
    case 'invoice.payment_succeeded': {
      await updateDoctor(session);
      break;
    }
    case 'invoice.payment_failed': {
      await updateDoctor(session);
      break;
    }
    default:
      console.info("Unhandled Stripe event type: " + event && event.type);
  }

  res.status(200).send();
});

const updateDoctor = async (session) => {
  console.log("Updating doctor Stripe details: ", session);
  if (!session) return;

  const customerId = session.customer;
  const customerEmail = session.customer_email;
  const subscriptionId = session.subscription;

  let doctor = await Database.Doctor.findOne({ where: { email_address: customerEmail } })
    .catch(error => console.error('Error finding doctor from Stripe customer email (' + customerEmail + '): ' + error.message));
  if (!doctor) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    .catch(error => console.error('Error finding Stripe subscription with ID (' + subscriptionId + '): ' + error.message));
  if (!subscription) return;

  doctor.stripe_customer_id = customerId;
  doctor.stripe_plan_id = session.lines && session.lines.data && session.lines.data[0] && session.lines.data[0].plan && session.lines.data[0].plan.id;
  doctor.stripe_subscription_status = subscription.status;
  await doctor.save();
}

module.exports = router;
