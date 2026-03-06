const express            = require('express');
const router             = express.Router();
const DonationController = require('../controllers/donationController');


// These are called by payment gateways - no auth middleware needed
// Secure them via IP whitelisting at the server/nginx level instead

// POST /api/payments/airtel/callback
router.post('/airtel/callback', DonationController.airtelCallback);

// POST /api/payments/tnm/callback
router.post('/tnm/callback', DonationController.tnmCallback);



module.exports = router;
