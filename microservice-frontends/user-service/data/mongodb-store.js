const mongoose = require('mongoose');
const { User, Tenant, Alias, Connection } = require('../models');

class MongoDBDataStore {
  constructor() {
    this.connected = false;
  }

  async initialize() {
    try {
      const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
      
      if (!mongoUri) {
        throw new Error('MongoDB URI not found in environment variables');
      }

      console.log('🔄 Connecting to MongoDB...');
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.connected = true;
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async save() {
    // MongoDB auto-saves, no manual save needed
    return Promise.resolve();
  }

  // User methods
  async createUser(userData) {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      return await User.findOne({ id: userId });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      updateData.updatedAt = new Date();
      return await User.findOneAndUpdate(
        { id: userId },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      return await User.find({});
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Tenant methods
  async createTenant(tenantData) {
    try {
      const tenant = new Tenant(tenantData);
      await tenant.save();
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenantById(tenantId) {
    try {
      return await Tenant.findOne({ id: tenantId });
    } catch (error) {
      console.error('Error getting tenant by ID:', error);
      throw error;
    }
  }

  async getTenantByUserId(userId) {
    try {
      return await Tenant.findOne({ userId });
    } catch (error) {
      console.error('Error getting tenant by user ID:', error);
      throw error;
    }
  }

  async updateTenant(tenantId, updateData) {
    try {
      updateData.updatedAt = new Date();
      return await Tenant.findOneAndUpdate(
        { id: tenantId },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating tenant:', error);
      throw error;
    }
  }

  async getAllTenants() {
    try {
      return await Tenant.find({});
    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }

  // Alias methods
  async createAlias(aliasData) {
    try {
      const alias = new Alias(aliasData);
      await alias.save();
      return alias;
    } catch (error) {
      console.error('Error creating alias:', error);
      throw error;
    }
  }

  async getAliasById(aliasId) {
    try {
      return await Alias.findOne({ id: aliasId });
    } catch (error) {
      console.error('Error getting alias by ID:', error);
      throw error;
    }
  }

  async getAliasesByTenantId(tenantId) {
    try {
      return await Alias.find({ tenantId });
    } catch (error) {
      console.error('Error getting aliases by tenant ID:', error);
      throw error;
    }
  }

  async updateAlias(aliasId, updateData) {
    try {
      updateData.updatedAt = new Date();
      return await Alias.findOneAndUpdate(
        { id: aliasId },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating alias:', error);
      throw error;
    }
  }

  async deleteAlias(aliasId) {
    try {
      return await Alias.findOneAndDelete({ id: aliasId });
    } catch (error) {
      console.error('Error deleting alias:', error);
      throw error;
    }
  }

  async getAllAliases() {
    try {
      return await Alias.find({});
    } catch (error) {
      console.error('Error getting all aliases:', error);
      throw error;
    }
  }

  // Connection methods
  async createConnection(connectionData) {
    try {
      const connection = new Connection(connectionData);
      await connection.save();
      return connection;
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  }

  async getConnectionById(connectionId) {
    try {
      return await Connection.findOne({ id: connectionId });
    } catch (error) {
      console.error('Error getting connection by ID:', error);
      throw error;
    }
  }

  async getConnectionsByUserId(userId) {
    try {
      return await Connection.find({ userId });
    } catch (error) {
      console.error('Error getting connections by user ID:', error);
      throw error;
    }
  }

  async updateConnection(connectionId, updateData) {
    try {
      updateData.updatedAt = new Date();
      return await Connection.findOneAndUpdate(
        { id: connectionId },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating connection:', error);
      throw error;
    }
  }

  async deleteConnection(connectionId) {
    try {
      return await Connection.findOneAndDelete({ id: connectionId });
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  }

  async getAllConnections() {
    try {
      return await Connection.find({});
    } catch (error) {
      console.error('Error getting all connections:', error);
      throw error;
    }
  }

  // Graceful shutdown
  async close() {
    if (this.connected) {
      await mongoose.connection.close();
      this.connected = false;
      console.log('📴 MongoDB connection closed');
    }
  }
}

module.exports = new MongoDBDataStore();









