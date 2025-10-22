/**
 * Simplified Cloudflare Email Worker for Debugging
 * This version has extensive logging and simpler logic
 */

export default {
  async email(message, env, ctx) {
    console.log('=== EMAIL WORKER TRIGGERED ===');
    console.log('To:', message.to);
    console.log('From:', message.from);
    console.log('Subject:', message.subject);
    
    try {
      const to = message.to.toLowerCase();
      const [localPart, domain] = to.split('@');
      
      console.log('Parsed - LocalPart:', localPart, 'Domain:', domain);
      
      // Validate domain
      if (domain !== 'in.autorestock.app') {
        console.log('ERROR: Wrong domain, rejecting');
        message.setReject(`Domain ${domain} not handled`);
        return;
      }
      
      console.log('Domain validated ✓');
      
      // Prepare webhook
      const webhook = {
        event: {
          eventType: 'EmailReceived',
          tenantAlias: localPart,
          rawMessageId: message.headers.get('message-id') || `<${Date.now()}@autorestock.app>`,
          from: message.from,
          to: to,
          subject: message.subject || '(no subject)',
          timestamp: new Date().toISOString(),
          size: message.rawSize || 0
        }
      };
      
      const ingestionUrl = env.INGESTION_SERVICE_URL;
      const webhookToken = env.CF_WEBHOOK_TOKEN;
      
      console.log('Calling:', ingestionUrl + '/inbound/cf');
      console.log('Token length:', webhookToken ? webhookToken.length : 0);
      
      // Call ingestion service
      const response = await fetch(`${ingestionUrl}/inbound/cf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookToken}`
        },
        body: JSON.stringify(webhook),
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('Response body:', JSON.stringify(result));
      
      // Check result
      if (!result.ok) {
        console.log('ERROR: Service returned ok=false');
        throw new Error('Service returned error');
      }
      
      if (!result.allowed) {
        console.log('ERROR: Alias not allowed');
        message.setReject(`Alias ${localPart} not configured`);
        return;
      }
      
      const forwardTo = result.forwardTo;
      console.log('ForwardTo address:', forwardTo);
      
      if (!forwardTo) {
        console.log('ERROR: No forwardTo address');
        message.setReject('No forwarding address configured');
        return;
      }
      
      // Forward the email
      console.log('Attempting to forward to:', forwardTo);
      await message.forward(forwardTo);
      console.log('✅ EMAIL FORWARDED SUCCESSFULLY to', forwardTo);
      
    } catch (error) {
      console.error('WORKER ERROR:', error.message);
      console.error('Stack:', error.stack);
      
      // Try fallback
      const fallback = env.DEFAULT_FORWARD_EMAIL;
      console.log('Attempting fallback to:', fallback);
      
      if (fallback) {
        try {
          await message.forward(fallback);
          console.log('✅ Forwarded to fallback:', fallback);
        } catch (e) {
          console.error('Fallback failed:', e.message);
          message.setReject('Email processing failed');
        }
      } else {
        console.log('No fallback configured, rejecting');
        message.setReject('Email processing failed');
      }
    }
  }
};









