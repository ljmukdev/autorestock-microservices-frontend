const dataStore = require('../data/store');

class ConnectionController {
  // Set eBay connection status
  async setEbayConnection(req, res) {
    try {
      const userId = req.user.userId;
      const { connected, metadata } = req.body;

      const connection = {
        userId,
        type: 'ebay',
        connected,
        metadata: metadata || {},
        updatedAt: new Date().toISOString()
      };

      dataStore.setConnection(connection);

      res.json({
        success: true,
        message: 'eBay connection updated successfully',
        connection
      });
    } catch (error) {
      console.error('Error setting eBay connection:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Set Gmail connection status
  async setGmailConnection(req, res) {
    try {
      const userId = req.user.userId;
      const { connected, metadata } = req.body;

      const connection = {
        userId,
        type: 'gmail',
        connected,
        metadata: metadata || {},
        updatedAt: new Date().toISOString()
      };

      dataStore.setConnection(connection);

      res.json({
        success: true,
        message: 'Gmail connection updated successfully',
        connection
      });
    } catch (error) {
      console.error('Error setting Gmail connection:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get connection status for user
  async getConnectionStatus(req, res) {
    try {
      const userId = req.user.userId;
      
      const connections = dataStore.getConnectionsByUserId(userId);

      res.json({
        success: true,
        connections
      });
    } catch (error) {
      console.error('Error getting connection status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new ConnectionController();
