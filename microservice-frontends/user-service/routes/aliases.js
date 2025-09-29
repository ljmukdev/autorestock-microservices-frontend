const express = require('express');
const { body, validationResult } = require('express-validator');
const aliasController = require('../controllers/aliasController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateAlias = [
  body('alias').trim().isLength({ min: 1 }).withMessage('Alias is required'),
  body('alias').matches(/^[a-zA-Z0-9._-]+$/).withMessage('Alias can only contain letters, numbers, dots, underscores, and hyphens'),
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
router.post('/:tenantId/aliases', authMiddleware, validateAlias, aliasController.createAlias);
router.get('/:tenantId/aliases', authMiddleware, aliasController.getAliases);
router.delete('/:tenantId/aliases/:aliasId', authMiddleware, aliasController.deleteAlias);

// Public endpoint for alias lookup (used by other services)
router.get('/alias/:alias', aliasController.lookupByAlias);

module.exports = router;
