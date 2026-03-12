const express = require('express');
const router = express.Router();
const { sendBulkEmails } = require('../controllers/emailController');

// Route to send bulk emails
router.post('/send-bulk', sendBulkEmails);

module.exports = router;
