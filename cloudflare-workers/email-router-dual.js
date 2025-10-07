/**
 * Cloudflare Email Worker - Dual Path
 * 1. Sends full email to AutoRestock Email Ingestion Service for processing
 * 2. Forwards copy to user's personal inbox
 */

export default {
  async email(message, env, ctx) {
    console.log('=== DUAL-PATH EMAIL WORKER ===');
    console.log('To:', message.to);
    console.log('From:', message.from);
    console.log('Subject:', message.subject);
    
    try {
      const to = message.to.toLowerCase();
      const [localPart, domain] = to.split('@');
      
      // Validate domain
      if (domain !== 'in.autorestock.app') {
        console.log('ERROR: Wrong domain, rejecting');
        message.setReject(`Domain ${domain} not handled`);
        return;
      }
      
      console.log('✓ Domain validated');
      
      // Get forwarding address from Email Ingestion Service
      const ingestionUrl = env.INGESTION_SERVICE_URL;
      const webhookToken = env.CF_WEBHOOK_TOKEN;
      
      console.log('Step 1: Getting forwarding address from ingestion service...');
      
      const lookupResponse = await fetch(`${ingestionUrl}/inbound/cf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookToken}`
        },
        body: JSON.stringify({
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
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      const lookupResult = await lookupResponse.json();
      console.log('Ingestion service response:', lookupResult);
      
      if (!lookupResult.ok || !lookupResult.allowed) {
        console.log('ERROR: Alias not allowed or service error');
        message.setReject(`Alias ${localPart} not configured`);
        return;
      }
      
      const forwardTo = lookupResult.forwardTo;
      if (!forwardTo) {
        console.log('ERROR: No forwarding address');
        message.setReject('No forwarding address configured');
        return;
      }
      
      console.log('✓ Forwarding address:', forwardTo);
      
      // Get readable stream of email content
      const reader = message.raw.getReader();
      const chunks = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Combine chunks into full email
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const fullEmail = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        fullEmail.set(chunk, offset);
        offset += chunk.length;
      }
      
      const emailText = new TextDecoder().decode(fullEmail);
      console.log('✓ Full email extracted, size:', emailText.length, 'bytes');
      
      // Step 2: Send FULL email to Email Ingestion Service for processing
      console.log('Step 2: Sending full email to ingestion service...');
      
      ctx.waitUntil(
        fetch(`${ingestionUrl}/inbound/inbound/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${webhookToken}`
          },
          body: JSON.stringify({
            alias: localPart,
            from: message.from,
            to: to,
            subject: message.subject,
            rawEmail: emailText,
            headers: Object.fromEntries(message.headers),
            timestamp: new Date().toISOString(),
            userId: lookupResult.userId,
            tenantId: lookupResult.tenantId
          })
        }).catch(err => {
          console.error('Failed to send to ingestion service:', err.message);
        })
      );
      
      console.log('✓ Email sent to ingestion service (async)');
      
      // Step 3: Email Ingestion Service will forward via SMTP
      // We don't use message.forward() because it requires Cloudflare destination verification
      // SMTP forwarding happens automatically in the Email Ingestion Service
      console.log('✓ Email Ingestion Service will forward to user via SMTP:', forwardTo);
      
      console.log('=== DUAL-PATH COMPLETE ===');
      
      // Accept the email (don't reject it)
      // The forwarding will be handled by Email Ingestion Service via SMTP
      
    } catch (error) {
      console.error('WORKER ERROR:', error.message);
      console.error('Stack:', error.stack);
      message.setReject('Email processing failed');
    }
  }
};

