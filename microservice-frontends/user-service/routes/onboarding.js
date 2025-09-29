const express = require('express');
const onboardingController = require('../controllers/onboardingController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Routes
router.get('/status', authMiddleware, onboardingController.getOnboardingStatus);

module.exports = router;
