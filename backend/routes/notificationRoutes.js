const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const webpush = require('web-push');
// Define route for sending notifications
router.post('/send', (req, res) => {
  const { token, title, body } = req.body;

  notificationController.sendNotification(token, title, body)
    .then((response) => {
      res.status(200).json({ success: true, response });
    })
    .catch((error) => {
      res.status(500).json({ success: false, error: error.message });
    });
});
const publicVapidKey ="BCRbpEfvWnIpgTDNzx0OXushJ2Cje_GFMwxi88afoxaTfFIsauJ3jTycqKCGDhMXnovk7C4QpwNIt7H4uJ6FrAQ";
const privateVapidKey = "awxhAir0_8t7Ad5fhaN2_z9zG3Js8qdRdbpnhW5ZtuA";
webpush.setVapidDetails("mailto:test@test.com",
publicVapidKey,privateVapidKey);
router.post("/subscribe", (req, res) => {
  console.log("subscribe hitted");
const { subscription, title, message } = req.body;
const payload = JSON.stringify({ title, message });
webpush.sendNotification(subscription, payload)
.catch((err) => console.error("err", err));
res.status(200).json({ success: true });
});
module.exports = router;
