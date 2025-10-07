# Cloudflare Email Integration Plan

## 📋 Overview

Integration between User Service aliases, Cloudflare Email Routing, and the Email Ingestion Service.

**Goal:** When a user creates an alias (e.g., `ljmuk@in.autorestock.app`), emails sent to that address should be:
1. Received by Cloudflare Email Routing
2. Forwarded to the user's configured forwarding email
3. Sent to the Email Ingestion Service for processing
4. Parsed and routed to appropriate microservices (Sales, Purchases, etc.)

---

## 🏗 Current Architecture

### ✅ What's Already Built

#### 1. **User Service** (`AutoRestock-User-Service`)
- ✅ User registration with alias creation
- ✅ Alias storage in MongoDB (`aliases` collection)
- ✅ Endpoint: `POST /api/v1/tenants/:tenantId/aliases`
- ✅ Returns: `{ id, tenantId, alias, fullAddress, isActive }`

#### 2. **Email Ingestion Service** (`email-ingestion-service`)
- ✅ Two server modes:
  - `app.js` - Full-featured with MongoDB, email processing
  - `src/index.js` - Lightweight Cloudflare/Mailgun router
- ✅ Cloudflare webhook endpoint: `/inbound/cf`
- ✅ Idempotency handling (prevents duplicate processing)
- ✅ Alias allowlist checking (via `ALIAS_MAP` env var)
- ✅ Event bus for routing to downstream services
- ✅ Email parsing and classification

#### 3. **Existing Cloudflare Integration**
- ✅ Route: `POST /inbound/cf` (in `src/routes/cf.js`)
- ✅ Bearer token authentication (`CF_WEBHOOK_TOKEN`)
- ✅ Alias resolution (`src/lib/aliases.js`)
- ✅ Event fan-out (`src/lib/eventBus.js`)

---

## 🔌 Integration Components Needed

### Component 1: Cloudflare Worker (Email Routing)

**Purpose:** Intercept emails sent to `@in.autorestock.app` and forward them

**What it needs to do:**
1. Receive email at Cloudflare
2. Extract alias from `to` address
3. Forward email to user's configured forwarding address
4. Send webhook to Email Ingestion Service with email metadata
5. Handle bounces and errors

**Status:** ⚠️ **NEEDS TO BE CREATED**

---

### Component 2: Alias Sync Mechanism

**Purpose:** Keep Email Ingestion Service updated with active aliases

**Current State:**
- Email Ingestion Service uses `ALIAS_MAP` environment variable
- Format: `{"alias": "forwardTo@email.com"}`
- Mode: `ALIAS_MODE=map` (only accept known aliases)

**Options:**

#### Option A: Database Integration (RECOMMENDED)
- Email Ingestion Service queries User Service MongoDB directly
- Shared database connection
- Real-time alias availability

#### Option B: API Integration
- Email Ingestion Service calls User Service API
- GET `/api/v1/tenants/:tenantId/aliases`
- Caches results with TTL

#### Option C: Webhook Notification
- User Service sends webhook when alias created/updated
- Email Ingestion Service updates local cache

**Status:** ⚠️ **NEEDS TO BE IMPLEMENTED**

---

### Component 3: Email Ingestion Endpoint Updates

**Current:** `/inbound/cf` accepts Cloudflare webhooks but needs to:
1. ✅ Validate alias exists in User Service
2. ❌ Store full email content in MongoDB
3. ❌ Parse email for order/invoice data
4. ❌ Route to appropriate microservices

**Status:** ⚠️ **NEEDS ENHANCEMENT**

---

## 📝 Implementation Plan

### Phase 1: Connect Existing Components (1-2 hours)

#### Step 1.1: Configure Email Ingestion Service to Read Aliases from User Service DB

**File:** `microservices/email-ingestion-service/src/lib/aliases.js`

```javascript
const { MongoClient } = require('mongodb');

let aliasCache = new Map();
let lastCacheUpdate = 0;
const CACHE_TTL = 60000; // 1 minute

async function fetchAliasesFromDB() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('autorestock');
    const aliases = await db.collection('aliases')
      .find({ status: 'provisioned' })
      .toArray();
    
    // Build map: localPart -> forwardTo
    const map = {};
    for (const alias of aliases) {
      // Need to look up tenant to get forwardTo email
      const tenant = await db.collection('tenants').findOne({ _id: alias.tenantId });
      const user = await db.collection('users').findOne({ tenantId: alias.tenantId });
      
      if (user && user.forwardingEmail) {
        map[alias.localPart] = user.forwardingEmail;
      }
    }
    
    return map;
  } finally {
    await client.close();
  }
}

async function resolveAlias(tenantAlias) {
  const alias = String(tenantAlias || '').toLowerCase().trim();
  
  // Check cache age
  const now = Date.now();
  if (now - lastCacheUpdate > CACHE_TTL) {
    const freshMap = await fetchAliasesFromDB();
    aliasCache = new Map(Object.entries(freshMap));
    lastCacheUpdate = now;
  }
  
  const forwardTo = aliasCache.get(alias);
  if (forwardTo) {
    return { allowed: true, forwardTo, mode: 'database' };
  }
  
  return { allowed: false, forwardTo: null, mode: 'database' };
}

module.exports = { resolveAlias };
```

#### Step 1.2: Update Environment Variables

**File:** `microservices/email-ingestion-service/.env` (or Railway)

```bash
# Use same MongoDB as User Service
MONGODB_URI=<same-as-user-service>

# Cloudflare webhook authentication
CF_WEBHOOK_TOKEN=<secure-random-token>

# Event routing
EVENT_BUS_URL=https://your-downstream-service.up.railway.app/webhooks/email
EVENT_BUS_TOKEN=<service-token>

# Alias mode (switch from ALIAS_MAP to database)
ALIAS_MODE=database
```

#### Step 1.3: Deploy Email Ingestion Service

```bash
cd microservices/email-ingestion-service
# Ensure Procfile points to correct entry
echo "web: node src/index.js" > Procfile
git add .
git commit -m "Configure database alias resolution"
git push origin main
```

---

### Phase 2: Create Cloudflare Worker (30-60 minutes)

#### Step 2.1: Create Worker Script

**File:** `cloudflare-email-worker.js` (create new)

```javascript
/**
 * Cloudflare Email Worker
 * Handles incoming emails to @in.autorestock.app
 */

export default {
  async email(message, env, ctx) {
    const { to, from, subject } = message;
    
    // Extract alias from "to" address
    const toAddress = to.toLowerCase();
    const [localPart, domain] = toAddress.split('@');
    
    if (domain !== 'in.autorestock.app') {
      // Not our domain, reject
      message.setReject('Domain not handled');
      return;
    }
    
    // Prepare webhook payload
    const webhook = {
      event: {
        eventType: 'EmailReceived',
        tenantAlias: localPart,
        rawMessageId: message.headers.get('message-id'),
        from: from,
        to: toAddress,
        subject: subject,
        timestamp: new Date().toISOString(),
        size: message.rawSize
      }
    };
    
    // Send to ingestion service
    try {
      const response = await fetch(env.INGESTION_SERVICE_URL + '/inbound/cf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CF_WEBHOOK_TOKEN}`
        },
        body: JSON.stringify(webhook)
      });
      
      const result = await response.json();
      
      if (!result.ok || !result.allowed) {
        // Alias not allowed, reject email
        message.setReject(`Alias ${localPart} not configured`);
        return;
      }
      
      // Forward to user's email
      if (result.forwardTo) {
        await message.forward(result.forwardTo);
      }
      
    } catch (error) {
      console.error('Webhook error:', error);
      // Still forward email even if webhook fails
      message.forward(env.DEFAULT_FORWARD_EMAIL);
    }
  }
};
```

#### Step 2.2: Deploy to Cloudflare

1. Go to Cloudflare Dashboard
2. Navigate to **Email Routing** → **Email Workers**
3. Create new worker with above script
4. Set environment variables:
   - `INGESTION_SERVICE_URL`: Your email ingestion service URL
   - `CF_WEBHOOK_TOKEN`: Same token as in ingestion service
   - `DEFAULT_FORWARD_EMAIL`: Fallback email address

5. Configure routing rule:
   - Match: `*@in.autorestock.app`
   - Action: Send to Worker (your new worker)

---

### Phase 3: Enhanced Email Processing (1-2 hours)

#### Step 3.1: Store Full Email Content

**File:** `microservices/email-ingestion-service/src/routes/cf.js`

Enhance to store email in MongoDB when received:

```javascript
router.post('/', express.json({ limit: '512kb' }), async (req, res) => {
  // ... existing token validation ...
  
  const payload = req.body || {};
  const event = payload.event || {};
  
  // ... existing idempotency check ...
  
  // Alias allowlist
  const aliasInfo = await resolveAlias(event.tenantAlias);
  if (!aliasInfo.allowed) {
    return res.status(202).json({
      ok: true,
      dropped: true,
      reason: 'Alias not allowed',
      idempotencyKey: idKey
    });
  }
  
  // NEW: Store email metadata in MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('autorestock-emails');
    await db.collection('emails').insertOne({
      messageId: event.rawMessageId,
      from: event.from,
      to: event.to,
      subject: event.subject,
      tenantAlias: event.tenantAlias,
      forwardedTo: aliasInfo.forwardTo,
      receivedAt: new Date(event.timestamp),
      processed: false,
      createdAt: new Date()
    });
  } finally {
    await client.close();
  }
  
  // Attach resolved forward address
  event.forwardAddress = aliasInfo.forwardTo;
  event.allowed = true;
  
  // Fan-out to downstream services
  const result = await fanOutEvent(event).catch(err => ({ ok: false, error: err.message }));
  
  return res.status(200).json({
    ok: true,
    allowed: true,
    forwardTo: aliasInfo.forwardTo,
    idempotencyKey: idKey,
    fanOut: result
  });
});
```

---

## 🧪 Testing Plan

### Test 1: Alias Creation
```bash
# Create user with alias
POST https://autorestock-user-service-production.up.railway.app/api/v1/tenants/:tenantId/aliases
Body: { "localPart": "test123" }

# Verify in MongoDB
db.aliases.findOne({ localPart: 'test123' })
```

### Test 2: Email Ingestion Service Alias Resolution
```bash
# Test the /inbound/cf endpoint
POST https://your-email-ingestion-service.up.railway.app/inbound/cf
Headers: { "Authorization": "Bearer YOUR_CF_WEBHOOK_TOKEN" }
Body: {
  "event": {
    "eventType": "EmailReceived",
    "tenantAlias": "test123",
    "rawMessageId": "<test@example.com>",
    "from": "sender@example.com",
    "to": "test123@in.autorestock.app",
    "subject": "Test Email"
  }
}

# Should return: { "ok": true, "allowed": true, "forwardTo": "user@email.com" }
```

### Test 3: End-to-End Email Flow
```bash
# Send real email to: test123@in.autorestock.app
# Expected:
# 1. Cloudflare receives email
# 2. Worker calls ingestion service
# 3. Ingestion service validates alias
# 4. Email forwarded to user
# 5. Metadata stored in MongoDB
# 6. Event routed to downstream services
```

---

## 📊 Data Flow Diagram

```
User creates alias in Frontend
    ↓
POST /api/v1/tenants/:id/aliases
    ↓
Stored in MongoDB (aliases collection)
    ↓
Email sent to: alias@in.autorestock.app
    ↓
Cloudflare Email Routing receives email
    ↓
Cloudflare Worker extracts alias
    ↓
Worker sends webhook to Email Ingestion Service
    POST /inbound/cf with event data
    ↓
Email Ingestion Service:
  - Queries MongoDB for alias
  - Validates alias exists and is active
  - Stores email metadata
  - Returns forward address to Worker
    ↓
Cloudflare Worker forwards email to user's address
    ↓
Email Ingestion Service fans out to microservices:
  - Sales Service (if order email)
  - Purchases Service (if invoice email)
  - Accounting Service (if financial)
```

---

## 🚀 Deployment Checklist

- [ ] Deploy Email Ingestion Service with database alias resolution
- [ ] Set environment variables in Railway
- [ ] Create and deploy Cloudflare Worker
- [ ] Configure Cloudflare Email Routing rules
- [ ] Test alias creation in User Service
- [ ] Test webhook endpoint manually
- [ ] Send test email end-to-end
- [ ] Verify email forwarding works
- [ ] Verify metadata stored in MongoDB
- [ ] Verify event routing to downstream services

---

## 🔐 Security Considerations

1. **Webhook Authentication:** Use strong Bearer tokens
2. **Alias Validation:** Always check against database before forwarding
3. **Rate Limiting:** Prevent abuse of email endpoints
4. **Email Content:** Don't log sensitive email content
5. **MongoDB Access:** Restrict to read-only for alias lookups
6. **CORS:** Configure properly for webhook endpoints

---

## 📚 Environment Variables Reference

### User Service
```bash
MONGODB_URI=mongodb://...
CF_ROUTING_DOMAIN=in.autorestock.app
```

### Email Ingestion Service
```bash
MONGODB_URI=mongodb://... (same as User Service)
CF_WEBHOOK_TOKEN=<secure-token>
ALIAS_MODE=database
EVENT_BUS_URL=https://downstream.railway.app/webhooks/email
EVENT_BUS_TOKEN=<service-token>
```

### Cloudflare Worker
```bash
INGESTION_SERVICE_URL=https://email-ingestion.railway.app
CF_WEBHOOK_TOKEN=<same-as-ingestion-service>
DEFAULT_FORWARD_EMAIL=fallback@example.com
```

---

**Status:** Ready for implementation  
**Estimated Time:** 3-4 hours total  
**Priority:** High - Core functionality




