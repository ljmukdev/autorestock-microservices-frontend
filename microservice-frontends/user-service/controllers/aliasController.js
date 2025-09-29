const { v4: uuidv4 } = require('uuid');
const dataStore = require('../data/store');

class AliasController {
  // Create alias for tenant
  async createAlias(req, res) {
    try {
      const { tenantId } = req.params;
      const { alias } = req.body;
      const userId = req.user.userId;

      // Verify tenant belongs to user
      const tenant = dataStore.getTenantById(tenantId);
      if (!tenant || tenant.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found or access denied'
        });
      }

      // Check if alias already exists
      const existingAlias = dataStore.getAliasByValue(alias);
      if (existingAlias) {
        return res.status(409).json({
          success: false,
          message: 'Alias already exists'
        });
      }

      // Create alias
      const aliasData = {
        id: uuidv4(),
        tenantId,
        alias,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataStore.createAlias(aliasData);

      res.status(201).json({
        success: true,
        message: 'Alias created successfully',
        alias: aliasData
      });
    } catch (error) {
      console.error('Error creating alias:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get aliases for tenant
  async getAliases(req, res) {
    try {
      const { tenantId } = req.params;
      const userId = req.user.userId;

      // Verify tenant belongs to user
      const tenant = dataStore.getTenantById(tenantId);
      if (!tenant || tenant.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found or access denied'
        });
      }

      const aliases = dataStore.getAliasesByTenantId(tenantId);

      res.json({
        success: true,
        aliases
      });
    } catch (error) {
      console.error('Error getting aliases:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete alias
  async deleteAlias(req, res) {
    try {
      const { tenantId, aliasId } = req.params;
      const userId = req.user.userId;

      // Verify tenant belongs to user
      const tenant = dataStore.getTenantById(tenantId);
      if (!tenant || tenant.userId !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found or access denied'
        });
      }

      // Check if alias exists and belongs to tenant
      const alias = dataStore.getAliasById(aliasId);
      if (!alias || alias.tenantId !== tenantId) {
        return res.status(404).json({
          success: false,
          message: 'Alias not found'
        });
      }

      dataStore.deleteAlias(aliasId);

      res.json({
        success: true,
        message: 'Alias deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting alias:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Lookup tenant by alias (public endpoint for other services)
  async lookupByAlias(req, res) {
    try {
      const { alias } = req.params;
      
      const aliasData = dataStore.getAliasByValue(alias);
      if (!aliasData) {
        return res.status(404).json({
          success: false,
          message: 'Alias not found'
        });
      }

      const tenant = dataStore.getTenantById(aliasData.tenantId);
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      res.json({
        success: true,
        tenantId: tenant.id,
        alias: aliasData.alias,
        tenantName: tenant.name
      });
    } catch (error) {
      console.error('Error looking up alias:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AliasController();
