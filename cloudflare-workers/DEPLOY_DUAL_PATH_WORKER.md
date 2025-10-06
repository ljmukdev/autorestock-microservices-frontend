# Deploy Dual-Path Email Worker

## 🎯 What This Worker Does:

1. **Receives email** at Cloudflare
2. **Sends full email** to AutoRestock Email Ingestion Service (for processing)
3. **Forwards copy** to user's personal inbox
4. **Both happen simultaneously!**

---

## 📋 Deployment Steps:

### Step 1: Update Cloudflare Worker

1. **Go to:** Cloudflare Dashboard → Workers & Pages → **email-router**
2. **Click:** "Edit Code" or "Quick Edit"
3. **Replace all code** with the contents of `email-router-dual.js`
4. **Click:** "Save and Deploy"

### Step 2: Verify Environment Variables

Make sure these are set in the Worker:

```
INGESTION_SERVICE_URL=https://autorestock-email-ingestion-service-production.up.railway.app
CF_WEBHOOK_TOKEN=<your-webhook-token>
```

### Step 3: Create Email Ingestion Endpoint

We need to add a new endpoint `/inbound/process` to the Email Ingestion Service that:
- Accepts full email content
- Stores it in MongoDB
- Processes order data
- Returns success

---

## 🔄 Email Flow:

```
eBay → ebay-jake@in.autorestock.app
  ↓
Cloudflare Worker receives
  ↓
  ├─→ POST full email to Email Ingestion Service
  │    ↓
  │   Store in MongoDB
  │    ↓
  │   Extract order data
  │    ↓
  │   Process inventory/sales
  │
  └─→ Forward copy to jake@ljmuk.co.uk
       ↓
      User gets email in inbox
```

---

## ✅ Benefits:

- ✅ AutoRestock processes every order automatically
- ✅ Users still receive emails in their inbox
- ✅ Complete audit trail in database
- ✅ Can build email dashboard later (Phase 2)
- ✅ No spam issues (users get original emails)

---

## 🚀 Ready to Deploy?

Say YES and I'll:
1. Deploy the new Cloudflare Worker
2. Create the `/inbound/process` endpoint
3. Update Email Ingestion Service
4. Test the complete flow



