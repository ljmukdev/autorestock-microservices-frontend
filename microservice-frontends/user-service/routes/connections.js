const express = require('express');
const { body, validationResult } = require('express-validator');
const connectionController = require('../controllers/connectionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateConnection = [
  body('connected').isBoolean().withMessage('Connected status must be boolean'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Routes
router.post('/ebay', authMiddleware, validateConnection, connectionController.setEbayConnection);
router.post('/gmail', authMiddleware, validateConnection, connectionController.setGmailConnection);
router.get('/status', authMiddleware, connectionController.getConnectionStatus);

module.exports = router;
