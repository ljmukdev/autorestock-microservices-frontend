# AutoRestock Cloudflare Email Worker

## Overview

This Cloudflare Worker handles incoming emails to `*@in.autorestock.app` and:
1. Validates the alias with the Email Ingestion Service
2. Forwards the email to the user's configured address
3. Sends email metadata to the Email Ingestion Service for processing

---

## Files

- **`email-router.js`** - Main worker script
- **`wrangler.toml`** - Worker configuration
- **`README.md`** - This file

---

## Deployment Options

### Option 1: Via Cloudflare Dashboard (Easiest)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Navigate to **Workers & Pages** → **Create Application** → **Create Worker**
4. Name it: `autorestock-email-router`
5. Click **Deploy**
6. Click **Quick Edit** and paste the contents of `email-router.js`
7. Click **Save and Deploy**

**Set Environment Variables:**
1. Go to **Settings** → **Variables**
2. Click **Add Variable** (Encrypt for secrets):
   - `INGESTION_SERVICE_URL`: `https://stockpilot-email-ingest-service-production-production.up.railway.app`
   - `CF_WEBHOOK_TOKEN`: `SH139KygDIMCCLl7j9jiBSKvprO7uekZL8ZVwa0Bgz787EjT5Pj4zG7iQY056PhJ`
   - `DEFAULT_FORWARD_EMAIL`: `development@ljmuk.co.uk` (optional fallback)

### Option 2: Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd cloudflare-workers
wrangler deploy

# Set secrets
wrangler secret put INGESTION_SERVICE_URL
# Enter: https://stockpilot-email-ingest-service-production-production.up.railway.app

wrangler secret put CF_WEBHOOK_TOKEN
# Enter: SH139KygDIMCCLl7j9jiBSKvprO7uekZL8ZVwa0Bgz787EjT5Pj4zG7iQY056PhJ

wrangler secret put DEFAULT_FORWARD_EMAIL
# Enter: development@ljmuk.co.uk
```

---

## Configure Email Routing

After deploying the worker:

1. Go to **Email** → **Email Routing** in Cloudflare Dashboard
2. Add your domain: `in.autorestock.app`
3. Configure DNS (Cloudflare will guide you):
   - MX records pointing to Cloudflare
   - SPF record
   - DKIM record
4. Create a **Custom Address** routing rule:
   - **Match:** `*@in.autorestock.app` (catch-all)
   - **Action:** Send to Worker
   - **Worker:** `autorestock-email-router`
5. Click **Save**

---

## Testing

### Test 1: Send a Test Email

```bash
# Send an email to an alias you created
# For example: ljmuk@in.autorestock.app
```

### Test 2: Check Worker Logs

1. Go to Cloudflare Dashboard → Workers → `autorestock-email-router`
2. Click on **Logs** tab (or use `wrangler tail`)
3. Look for:
   - "Processing email for: ljmuk@in.autorestock.app"
   - "Calling ingestion service..."
   - "Forwarding email to: ebay@ljmuk.co.uk"
   - "Email forwarded successfully"

### Test 3: Check Email Ingestion Service

Railway logs should show:
```
[aliases] Loaded X aliases from database
{
  "tag": "cf-inbound",
  "status": "accepted",
  "tenantAlias": "ljmuk",
  ...
}
```

### Test 4: Verify Email Delivery

Check `ebay@ljmuk.co.uk` inbox for the forwarded email.

---

## Troubleshooting

### Worker Returns "Alias not allowed"

**Cause:** Alias not found in database

**Fix:**
1. Create alias in User Service (Step 3 of onboarding)
2. Wait 60 seconds for cache refresh
3. Try again

### Worker Returns "Email processing service temporarily unavailable"

**Cause:** Email Ingestion Service not responding

**Fix:**
1. Check Railway deployment status
2. Check `INGESTION_SERVICE_URL` environment variable
3. Check `CF_WEBHOOK_TOKEN` matches between Worker and Service

### Email Not Forwarded

**Cause:** Multiple possible reasons

**Fix:**
1. Check Worker logs for errors
2. Verify `forwardTo` address in database
3. Check email routing rules in Cloudflare Dashboard
4. Verify MX records are correct

---

## Architecture

```
Email sent to: ljmuk@in.autorestock.app
    ↓
Cloudflare Email Routing receives email
    ↓
Triggers: autorestock-email-router Worker
    ↓
Worker sends webhook to Email Ingestion Service
    POST /inbound/cf
    { event: { tenantAlias: "ljmuk", ... } }
    ↓
Email Ingestion Service:
  - Queries MongoDB for alias
  - Returns: { allowed: true, forwardTo: "ebay@ljmuk.co.uk" }
    ↓
Worker forwards email to: ebay@ljmuk.co.uk
    ↓
User receives email ✅
```

---

## Monitoring

### Metrics to Watch

1. **Worker Invocations:** Should increase with each email
2. **Worker Errors:** Should be 0 or very low
3. **Ingestion Service Response Time:** Should be < 1 second
4. **Email Delivery Rate:** Should be close to 100%

### Logging

Worker logs:
```javascript
console.log('Processing email for: alias@in.autorestock.app')
console.log('Calling ingestion service...')
console.log('Ingestion service response:', result)
console.log('Forwarding email to: user@email.com')
console.log('Email forwarded successfully')
```

---

## Security

- ✅ Bearer token authentication for webhook
- ✅ Domain validation (only `in.autorestock.app`)
- ✅ Alias validation against database
- ✅ Error handling with fallback
- ✅ Environment variables encrypted
- ✅ Request timeout (10 seconds)

---

## Next Steps

1. Deploy the worker
2. Configure email routing in Cloudflare
3. Test with a real email
4. Monitor logs
5. Verify email delivery

---

**Status:** Ready to deploy  
**Estimated Time:** 15-30 minutes  
**Prerequisites:** Cloudflare account with Email Routing enabled
