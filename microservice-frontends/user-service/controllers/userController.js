const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'autorestock-jwt-secret-key';

class UserController {
  // Create a simple user (MVP endpoint)
  async createUser(req, res) {
    try {
      const { email, name } = req.body;

      // Check if user already exists
      const existingUser = dataStore.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user and tenant
      const userId = uuidv4();
      const tenantId = uuidv4();
      
      const user = {
        id: userId,
        email,
        name,
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const tenant = {
        id: tenantId,
        userId,
        name: `${name}'s Tenant`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataStore.createUser(user);
      dataStore.createTenant(tenant);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          userId,
          tenantId,
          email,
          name
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Register user with full details (for frontend registration)
  async registerUser(req, res) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        businessName,
        businessType,
        industry,
        platforms,
        inventorySize,
        timezone,
        terms,
        marketing
      } = req.body;

      // Check if user already exists
      const existingUser = dataStore.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user and tenant
      const userId = uuidv4();
      const tenantId = uuidv4();
      
      const user = {
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        businessName,
        businessType,
        industry,
        platforms: platforms || [],
        inventorySize,
        timezone,
        termsAccepted: terms,
        marketingOptIn: marketing,
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const tenant = {
        id: tenantId,
        userId,
        name: businessName || `${firstName} ${lastName}'s Business`,
        businessType,
        industry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataStore.createUser(user);
      dataStore.createTenant(tenant);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId, 
          tenantId, 
          email 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          businessName,
          tenantId
        },
        token
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get current user from JWT token
  async getCurrentUser(req, res) {
    try {
      const user = dataStore.getUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = dataStore.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove sensitive data
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new UserController();
