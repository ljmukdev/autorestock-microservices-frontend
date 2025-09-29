const fs = require('fs').promises;
const path = require('path');

class DataStore {
  constructor() {
    this.data = {
      users: [],
      tenants: [],
      aliases: [],
      connections: []
    };
    this.dataFile = path.join(__dirname, 'data.json');
  }

  async initialize() {
    try {
      // Try to load existing data
      await this.load();
      console.log('📁 Data store loaded from file');
    } catch (error) {
      // If file doesn't exist or is corrupted, start fresh
      console.log('📁 Starting with fresh data store');
      await this.save();
    }
  }

  async load() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      this.data = JSON.parse(data);
    } catch (error) {
      throw new Error('Failed to load data store');
    }
  }

  async save() {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Failed to save data store:', error);
      throw error;
    }
  }

  // User methods
  createUser(user) {
    this.data.users.push(user);
    this.save(); // Auto-save
  }

  getUserById(id) {
    return this.data.users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(user => user.email === email);
  }

  updateUser(id, updates) {
    const userIndex = this.data.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.data.users[userIndex] = { ...this.data.users[userIndex], ...updates };
      this.save();
      return this.data.users[userIndex];
    }
    return null;
  }

  deleteUser(id) {
    const userIndex = this.data.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      this.data.users.splice(userIndex, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Tenant methods
  createTenant(tenant) {
    this.data.tenants.push(tenant);
    this.save();
  }

  getTenantById(id) {
    return this.data.tenants.find(tenant => tenant.id === id);
  }

  getTenantsByUserId(userId) {
    return this.data.tenants.filter(tenant => tenant.userId === userId);
  }

  updateTenant(id, updates) {
    const tenantIndex = this.data.tenants.findIndex(tenant => tenant.id === id);
    if (tenantIndex !== -1) {
      this.data.tenants[tenantIndex] = { ...this.data.tenants[tenantIndex], ...updates };
      this.save();
      return this.data.tenants[tenantIndex];
    }
    return null;
  }

  deleteTenant(id) {
    const tenantIndex = this.data.tenants.findIndex(tenant => tenant.id === id);
    if (tenantIndex !== -1) {
      this.data.tenants.splice(tenantIndex, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Alias methods
  createAlias(alias) {
    this.data.aliases.push(alias);
    this.save();
  }

  getAliasById(id) {
    return this.data.aliases.find(alias => alias.id === id);
  }

  getAliasByValue(alias) {
    return this.data.aliases.find(a => a.alias === alias);
  }

  getAliasesByTenantId(tenantId) {
    return this.data.aliases.filter(alias => alias.tenantId === tenantId);
  }

  updateAlias(id, updates) {
    const aliasIndex = this.data.aliases.findIndex(alias => alias.id === id);
    if (aliasIndex !== -1) {
      this.data.aliases[aliasIndex] = { ...this.data.aliases[aliasIndex], ...updates };
      this.save();
      return this.data.aliases[aliasIndex];
    }
    return null;
  }

  deleteAlias(id) {
    const aliasIndex = this.data.aliases.findIndex(alias => alias.id === id);
    if (aliasIndex !== -1) {
      this.data.aliases.splice(aliasIndex, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Connection methods
  setConnection(connection) {
    const existingIndex = this.data.connections.findIndex(
      conn => conn.userId === connection.userId && conn.type === connection.type
    );
    
    if (existingIndex !== -1) {
      this.data.connections[existingIndex] = connection;
    } else {
      this.data.connections.push(connection);
    }
    this.save();
  }

  getConnectionByUserIdAndType(userId, type) {
    return this.data.connections.find(
      conn => conn.userId === userId && conn.type === type
    );
  }

  getConnectionsByUserId(userId) {
    return this.data.connections.filter(conn => conn.userId === userId);
  }

  deleteConnection(userId, type) {
    const connectionIndex = this.data.connections.findIndex(
      conn => conn.userId === userId && conn.type === type
    );
    if (connectionIndex !== -1) {
      this.data.connections.splice(connectionIndex, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Utility methods
  getAllData() {
    return this.data;
  }

  clearAllData() {
    this.data = {
      users: [],
      tenants: [],
      aliases: [],
      connections: []
    };
    this.save();
  }
}

module.exports = new DataStore();
