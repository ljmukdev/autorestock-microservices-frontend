/**
 * Cloudflare Email Worker for AutoRestock
 * 
 * Purpose: 
 * - Receives emails sent to *@in.autorestock.app
 * - Validates alias with Email Ingestion Service
 * - Forwards email to user's configured address
 * - Sends webhook to Email Ingestion Service for processing
 * 
 * Environment Variables Required:
 * - INGESTION_SERVICE_URL: https://stockpilot-email-ingest-service-production-production.up.railway.app
 * - CF_WEBHOOK_TOKEN: SH139KygDIMCCLl7j9jiBSKvprO7uekZL8ZVwa0Bgz787EjT5Pj4zG7iQY056PhJ
 * - DEFAULT_FORWARD_EMAIL: fallback@example.com (optional)
 */

export default {
  async email(message, env, ctx) {
    try {
      // Extract email details
      const to = message.to.toLowerCase();
      const from = message.from;
      const subject = message.subject || '(no subject)';
      const messageId = message.headers.get('message-id') || `<${Date.now()}@autorestock.app>`;
      
      // Parse recipient address
      const [localPart, domain] = to.split('@');
      
      // Validate domain
      if (domain !== 'in.autorestock.app') {
        console.log(`Rejecting email for unknown domain: ${domain}`);
        message.setReject(`Domain ${domain} not handled by this worker`);
        return;
      }
      
      console.log(`Processing email for: ${localPart}@${domain}`);
      
      // Prepare webhook payload
      const webhook = {
        event: {
          eventType: 'EmailReceived',
          tenantAlias: localPart,
          rawMessageId: messageId,
          from: from,
          to: to,
          subject: subject,
          timestamp: new Date().toISOString(),
          size: message.rawSize || 0
        }
      };
      
      // Call Email Ingestion Service
      const ingestionUrl = env.INGESTION_SERVICE_URL || 'https://stockpilot-email-ingest-service-production-production.up.railway.app';
      const webhookToken = env.CF_WEBHOOK_TOKEN || '';
      
      console.log(`Calling ingestion service: ${ingestionUrl}/inbound/cf`);
      
      try {
        const response = await fetch(`${ingestionUrl}/inbound/cf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webhookToken}`
          },
          body: JSON.stringify(webhook),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        const result = await response.json();
        console.log('Ingestion service response:', JSON.stringify(result));
        
        // Check if alias is allowed
        if (!result.ok || !result.allowed) {
          const reason = result.reason || 'Alias not configured';
          console.log(`Alias not allowed: ${localPart} - ${reason}`);
          message.setReject(`Email address ${localPart}@in.autorestock.app is not configured. Reason: ${reason}`);
          return;
        }
        
        // Get forward address
        const forwardTo = result.forwardTo;
        
        if (!forwardTo) {
          console.log(`No forward address for alias: ${localPart}`);
          message.setReject(`No forwarding address configured for ${localPart}@in.autorestock.app`);
          return;
        }
        
        // Forward email
        console.log(`Forwarding email to: ${forwardTo}`);
        await message.forward(forwardTo);
        console.log(`Email forwarded successfully to ${forwardTo}`);
        
      } catch (fetchError) {
        // If ingestion service fails, still try to forward the email
        console.error('Ingestion service error:', fetchError.message);
        
        const fallbackEmail = env.DEFAULT_FORWARD_EMAIL;
        
        if (fallbackEmail) {
          console.log(`Falling back to: ${fallbackEmail}`);
          await message.forward(fallbackEmail);
        } else {
          // No fallback configured, reject the email
          message.setReject('Email processing service temporarily unavailable');
        }
      }
      
    } catch (error) {
      // Catch-all error handler
      console.error('Worker error:', error.message);
      console.error('Stack:', error.stack);
      
      // Try to forward to fallback if available
      const fallbackEmail = env.DEFAULT_FORWARD_EMAIL;
      if (fallbackEmail) {
        try {
          await message.forward(fallbackEmail);
        } catch (forwardError) {
          console.error('Fallback forward failed:', forwardError.message);
          message.setReject('Email processing failed');
        }
      } else {
        message.setReject('Email processing failed');
      }
    }
  }
};

