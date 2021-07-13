var express = require('express');
var router = express.Router();
var Database = require('../helpers/database');

router.post('/webhook', async function(req, res, next) {
  let event = req.body;
  let session = event && event.data && event.data.object;
  console.info("Got Stripe event: " + JSON.stringify(event));
  
  switch (event && event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
    case 'invoice.payment_succeeded': {
      updateDoctor(session);
      break;
    }
    case 'checkout.session.async_payment_failed':
    case 'invoice.payment_failed': {
      updateDoctor(session);
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

  let customerId = session.customer;
  let clientReferenceId = session.client_reference_id;
  let subscriptionStatus = session.subscription && session.subscription.status;

  let doctor = await Database.Appointment.findOne({ where: { id: clientReferenceId } })
    .catch(error => console.error('Error finding doctor from Stripe client reference ID: ' + error.message));
  if (!doctor) return;

  doctor.stripe_customer_id = customerId;
  doctor.stripe_plan_id = 
  doctor.stripe_subscription_status = subscriptionStatus;
}

module.exports = router;
