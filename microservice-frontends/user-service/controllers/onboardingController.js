const dataStore = require('../data/store');

class OnboardingController {
  // Get onboarding status
  async getOnboardingStatus(req, res) {
    try {
      const userId = req.user.userId;
      const tenantId = req.user.tenantId;

      // Get user's connections
      const connections = dataStore.getConnectionsByUserId(userId);
      
      // Get user's aliases
      const aliases = dataStore.getAliasesByTenantId(tenantId);

      // Determine onboarding status
      const hasEbayConnection = connections.some(conn => conn.type === 'ebay' && conn.connected);
      const hasGmailConnection = connections.some(conn => conn.type === 'gmail' && conn.connected);
      const hasAlias = aliases.length > 0;

      // Calculate completion percentage
      let completedSteps = 0;
      const totalSteps = 3; // eBay, Gmail, Alias

      if (hasEbayConnection) completedSteps++;
      if (hasGmailConnection) completedSteps++;
      if (hasAlias) completedSteps++;

      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

      // Determine status
      let status = 'incomplete';
      if (completionPercentage === 100) {
        status = 'complete';
      } else if (completionPercentage > 0) {
        status = 'in_progress';
      }

      res.json({
        success: true,
        onboarding: {
          status,
          completionPercentage,
          steps: {
            ebayConnection: {
              completed: hasEbayConnection,
              required: true
            },
            gmailConnection: {
              completed: hasGmailConnection,
              required: true
            },
            aliasSetup: {
              completed: hasAlias,
              required: true
            }
          },
          connections: {
            ebay: hasEbayConnection,
            gmail: hasGmailConnection
          },
          aliases: aliases.map(alias => ({
            id: alias.id,
            alias: alias.alias,
            createdAt: alias.createdAt
          }))
        }
      });
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new OnboardingController();
