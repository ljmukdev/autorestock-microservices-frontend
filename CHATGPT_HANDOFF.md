# AutoRestock Email System - ChatGPT Handoff Document

**Last Updated:** October 6, 2025  
**Status:** ✅ PRODUCTION READY - Fully functional dual-path email system  
**Project:** AutoRestock - Multi-platform reseller management platform

---

## 📋 PROJECT OVERVIEW

### What is AutoRestock?
AutoRestock is a SaaS platform for resellers who sell on multiple marketplaces (eBay, Vinted, etc.). The platform automatically ingests order confirmation emails, extracts order data, manages inventory, and provides business intelligence across all selling platforms.

### Current Phase: Email System (COMPLETE ✅)
The email ingestion system is **fully functional** and **production ready**. Users can:
1. Register and create email aliases (e.g., `ebay-jake@in.autorestock.app`)
2. Update their marketplace settings to use these aliases
3. Receive order emails at these aliases
4. AutoRestock processes the emails AND forwards clean copies to users' personal inboxes

**Key Achievement:** 100% automated - ZERO manual configuration per user.

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Flow:
```
1. User registers → Creates aliases (ebay-jake@in.autorestock.app)
2. User updates eBay/Vinted to send orders to alias
3. Order email arrives → Cloudflare Email Routing receives it
4. Cloudflare Worker → Sends full email to Email Ingestion Service
5. Email Ingestion Service:
   ├─→ Stores in MongoDB (for AutoRestock processing)
   └─→ Forwards clean copy via SMTP to user's inbox
```

### Services:

#### 1. **Frontend** (Next.js on Railway)
- Path: `frontends/app/`
- URL: `https://autorestock-frontend-production.up.railway.app`
- 6-step onboarding wizard
- User dashboard
- Testing utilities (Clear DB, Auto-Fill Form)

#### 2. **User Service** (Node.js/Express on Railway)
- Path: `microservices/AutoRestock-User-Service/`
- Handles user registration
- Creates email aliases
- Manages Cloudflare routing rules via API
- Sends test emails via SMTP
- Admin endpoints for database management

#### 3. **Email Ingestion Service** (Node.js/Express on Railway)
- Path: `microservices/email-ingestion-service/`
- Receives full emails from Cloudflare Worker
- Stores emails in MongoDB
- **Parses emails using `mailparser`** (decodes Base64, MIME, etc.)
- **Forwards clean copies to users via SMTP**
- Ready for order extraction (Phase 2)

#### 4. **Cloudflare Email Routing + Worker**
- Domain: `in.autorestock.app`
- Worker Script: `cloudflare-workers/email-router-dual.js`
- Receives emails at any `*@in.autorestock.app` address
- Sends full raw email to Email Ingestion Service
- Does NOT use `message.forward()` (to avoid manual verification)

#### 5. **MongoDB Database** (Railway)
- Service: `AutoRestockDB`
- Database: `autorestock`
- Collections:
  - `users` - User accounts
  - `tenants` - Company/tenant data
  - `aliases` - Email aliases and forwarding addresses
  - `emails` - All received emails (raw + metadata)

---

## 🔑 KEY TECHNICAL DECISIONS

### 1. **Why SMTP Forwarding Instead of Cloudflare's `message.forward()`?**
- **Problem:** Cloudflare requires manual verification of destination email addresses
- **Solution:** Use SMTP relay (Namecheap Private Email) to forward emails programmatically
- **Result:** Users can use ANY email address without verification

### 2. **Why Dual-Path (AutoRestock + User)?**
- **AutoRestock** needs full email for order data extraction
- **Users** want to see order confirmations in their inbox
- **Solution:** Store in MongoDB AND forward via SMTP

### 3. **Why `mailparser`?**
- Raw emails contain Base64, quoted-printable, MIME multipart encoding
- Direct forwarding resulted in unreadable garbage
- `mailparser` properly decodes everything and extracts clean HTML/text

### 4. **Why Cloudflare Email Routing?**
- Free tier supports unlimited emails
- Custom domain (`in.autorestock.app`)
- Workers allow custom processing logic
- Auto-scaling and reliable

---

## 📁 CRITICAL FILES

### Cloudflare Worker
**File:** `cloudflare-workers/email-router-dual.js`
```javascript
// Receives emails, sends to Email Ingestion Service
// Does NOT use message.forward() anymore
// Reads full raw email and sends as JSON
```

### Email Ingestion - Main Processing
**File:** `microservices/email-ingestion-service/routes/process.js`
```javascript
// Receives full email from Worker
// 1. Stores in MongoDB
// 2. Parses with mailparser
// 3. Forwards via SMTP to user
```

### Email Ingestion - Cloudflare Webhook
**File:** `microservices/email-ingestion-service/routes/cloudflare.js`
```javascript
// Receives alias lookup requests from Worker
// Returns forwarding email address
```

### User Service - Alias Creation
**File:** `microservices/AutoRestock-User-Service/routes/emailAliases.js`
```javascript
// Creates aliases in MongoDB
// Creates Cloudflare routing rules via API
```

### User Service - Cloudflare Integration
**File:** `microservices/AutoRestock-User-Service/services/cloudflareEmailRouting.js`
```javascript
// Manages Cloudflare API calls
// Creates routing rules (NOT destination addresses)
```

### Frontend - Onboarding
**File:** `frontends/app/src/app/users/onboarding/page.tsx`
```javascript
// 6-step wizard
// Includes Clear DB and Auto-Fill buttons for testing
```

### Frontend - Email Configuration
**File:** `frontends/app/packages/ui-user/src/widgets/EmailConfiguration.tsx`
```javascript
// Step 2: Email forwarding configuration
// Single email OR separate per platform
```

---

## 🔐 ENVIRONMENT VARIABLES

### User Service (Railway)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=<MongoDB connection from AutoRestockDB>
MONGODB_URI=<Same as DATABASE_URL>

# Cloudflare API
CLOUDFLARE_ZONE_ID=82dd495afb9526e8b2223d4cf81af2ef
CLOUDFLARE_EMAIL=development@ljmuk.co.uk
CLOUDFLARE_API_KEY=<Global API Key - full access>
CLOUDFLARE_API_TOKEN=<Zone Edit Token - limited access>

# SMTP (Namecheap Private Email)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@autorestock.app
SMTP_PASS=<Password from Namecheap>
SMTP_FROM=AutoRestock <noreply@autorestock.app>

# JWT
JWT_SECRET=<Secure random string>
```

### Email Ingestion Service (Railway)
```bash
NODE_ENV=production
PORT=3001

# MongoDB
MONGODB_URI=<From AutoRestockDB.MONGO_URL>

# Cloudflare Worker Authentication
CF_WEBHOOK_TOKEN=<Secure random token - must match Worker env>

# Alias Mode
ALIAS_MODE=database

# SMTP (same as User Service)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@autorestock.app
SMTP_PASS=<Password from Namecheap>
SMTP_FROM=AutoRestock <noreply@autorestock.app>
```

### Cloudflare Worker (Environment Variables)
Set in Cloudflare Dashboard → Workers & Pages → email-router → Settings → Variables
```bash
INGESTION_SERVICE_URL=<Railway URL for Email Ingestion Service>
CF_WEBHOOK_TOKEN=<Same token as Email Ingestion Service>
```

### Frontend (Railway)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=<User Service Railway URL>
# Example: https://autorestock-user-service-production.up.railway.app
```

---

## 🔄 EMAIL FLOW (DETAILED)

### Step 1: Email Arrives
```
From: ebay@ebay.com
To: ebay-jake@in.autorestock.app
Subject: Your item sold!
```

### Step 2: Cloudflare Worker Processes
1. Validates domain is `in.autorestock.app`
2. Extracts alias (`ebay-jake`)
3. Calls Email Ingestion Service `/inbound/cf` to verify alias and get forwarding email
4. Reads full raw email stream (including all headers, body, attachments)
5. Sends to `/inbound/process` with full raw email content
6. Returns success (doesn't use `message.forward()`)

### Step 3: Email Ingestion Service
1. **Stores in MongoDB:**
   ```javascript
   {
     alias: 'ebay-jake',
     from: 'ebay@ebay.com',
     to: 'ebay-jake@in.autorestock.app',
     subject: 'Your item sold!',
     rawEmail: '<full MIME email>',
     headers: {...},
     timestamp: '2025-10-06T...',
     userId: '...',
     tenantId: '...'
   }
   ```

2. **Parses Email:**
   ```javascript
   const parsed = await simpleParser(rawEmail);
   // Extracts: html, text, subject, from, date
   ```

3. **Forwards via SMTP:**
   ```javascript
   await transporter.sendMail({
     from: 'AutoRestock <noreply@autorestock.app>',
     to: 'jake@example.com', // User's personal email
     subject: parsed.subject,
     text: '--- Forwarded by AutoRestock ---\n...',
     html: '<div>...</div>' // Clean formatted email
   });
   ```

### Step 4: User Receives Clean Email
- Arrives in user's inbox
- Has AutoRestock forwarding header
- Contains original email content (properly formatted)
- No encoding issues or raw text

---

## 🚀 DEPLOYMENT GUIDE

### Deploy User Service:
```bash
cd microservices/AutoRestock-User-Service
git add .
git commit -m "Update User Service"
git push origin main
# Railway auto-deploys
```

### Deploy Email Ingestion Service:
```bash
cd microservices/email-ingestion-service
git add .
git commit -m "Update Email Ingestion"
git push origin main
# Railway auto-deploys
```

### Deploy Frontend:
```bash
cd frontends/app
git add .
git commit -m "Update Frontend"
git push origin main
# Railway auto-deploys
```

### Deploy Cloudflare Worker:
```bash
cd cloudflare-workers
npx wrangler deploy email-router-dual.js
# Or use Cloudflare Dashboard → Workers & Pages → email-router → Edit code
```

### Update Cloudflare Worker via Dashboard:
1. Go to: https://dash.cloudflare.com
2. Workers & Pages → email-router
3. Edit code → Paste `email-router-dual.js` content
4. Save and Deploy

---

## 📊 DATABASE SCHEMA

### Collection: `users`
```javascript
{
  _id: ObjectId,
  email: "jake@example.com",
  password: "hashed",
  firstName: "Jake",
  lastName: "Smith",
  tenantId: ObjectId, // Reference to tenant
  createdAt: Date
}
```

### Collection: `tenants`
```javascript
{
  _id: ObjectId,
  companyName: "LJMUK Ltd",
  vatNumber: "GB123456789",
  isVatRegistered: true,
  userId: ObjectId, // Reference to user
  createdAt: Date
}
```

### Collection: `aliases`
```javascript
{
  _id: ObjectId,
  localPart: "ebay-jake",
  domain: "in.autorestock.app",
  forwardTo: "jake@example.com", // User's personal email
  platform: "ebay",
  userId: ObjectId,
  tenantId: ObjectId,
  cloudflareRuleId: "abc123...", // Cloudflare routing rule ID
  cloudflareRuleCreated: true,
  isActive: true,
  createdAt: Date
}
```

### Collection: `emails`
```javascript
{
  _id: ObjectId,
  alias: "ebay-jake",
  from: "ebay@ebay.com",
  to: "ebay-jake@in.autorestock.app",
  subject: "Your item sold!",
  rawEmail: "MIME-Version: 1.0\n...", // Full raw email
  headers: {
    "message-id": "<...>",
    "content-type": "text/html",
    // ... all headers
  },
  timestamp: Date,
  userId: ObjectId,
  tenantId: ObjectId,
  processed: false, // For Phase 2: order extraction
  createdAt: Date
}
```

---

## 🧪 TESTING

### Manual Test Flow:
1. **Clear Database:** Click "Clear DB" button in frontend (top right)
2. **Auto-Fill Form:** Click "Auto-Fill Form" button (populates test data)
3. **Register User:** Complete 6-step onboarding
4. **Send Test Email:** Click "Send Test Email" in Step 5
5. **Check Inbox:** Email should arrive in ~2-3 seconds
6. **Verify MongoDB:** Check `emails` collection for stored email

### Test Email via User Service API:
```bash
curl -X POST https://autorestock-user-service.up.railway.app/api/v1/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ebay-jake@in.autorestock.app",
    "subject": "Test Order",
    "body": "This is a test order email"
  }'
```

### Send Real Email to Test:
```
From: Your personal email
To: ebay-jake@in.autorestock.app
Subject: Test Email
Body: Testing AutoRestock email system
```

Should arrive:
1. ✅ In MongoDB `emails` collection
2. ✅ In user's personal inbox (forwarded, clean format)

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Emails not arriving
**Check:**
1. Cloudflare Worker logs (Cloudflare Dashboard → Workers → email-router → Logs)
2. Email Ingestion Service logs (Railway → email-ingestion-service → Logs)
3. MongoDB `emails` collection (should have entry)
4. User's spam/junk folder

### Issue 2: Emails arrive in raw format
**Solution:** Already fixed with `mailparser`
- Check that `mailparser` is installed: `npm list mailparser`
- Verify `process.js` uses `simpleParser(rawEmail)`

### Issue 3: SMTP errors
**Check:**
1. SMTP credentials in environment variables
2. Namecheap Private Email is active
3. SPF records configured (see below)

### Issue 4: Cloudflare routing rules not created
**Check:**
1. `CLOUDFLARE_API_KEY` (must be Global API Key, not token)
2. `CLOUDFLARE_ZONE_ID` correct
3. User Service logs for API errors

### Issue 5: Alias lookup failing
**Check:**
1. MongoDB connection in Email Ingestion Service
2. Database name is explicitly `autorestock`: `client.db('autorestock')`
3. `aliases` collection has entries

---

## 🔧 DNS CONFIGURATION

### Cloudflare DNS Records for `in.autorestock.app`:
```
Type: MX
Name: in.autorestock.app
Content: route1.mx.cloudflare.net
Priority: 42

Type: TXT (SPF)
Name: in.autorestock.app
Content: v=spf1 include:_spf.mx.cloudflare.net ~all
```

### SPF for Sending (to avoid spam):
```
Type: TXT
Name: autorestock.app
Content: v=spf1 include:mail.privateemail.com ~all
```

---

## 📈 CURRENT STATUS

### What's Working ✅
- User registration (6-step wizard)
- Email alias creation (unlimited per user)
- Cloudflare routing rule creation (automated via API)
- Email reception at Cloudflare
- Email forwarding to Email Ingestion Service
- Email storage in MongoDB
- Email parsing with mailparser (clean decoding)
- SMTP forwarding to users (clean formatted emails)
- Multi-platform support (eBay, Vinted)
- Separate forwarding emails per platform
- GDPR compliance (consent, disclaimers)
- Test email functionality
- Clear DB utility for testing
- Auto-Fill Form utility for testing

### What's NOT Working ❌
- None! System is fully functional 🎉

### Known Limitations:
- Emails may go to spam initially (user must whitelist)
- No email dashboard yet (Phase 2)
- No order data extraction yet (Phase 2)

---

## 🚀 PHASE 2 ROADMAP

### Short-term:
1. **Order Extraction Engine:**
   - Parse order data from email bodies
   - Extract: order ID, buyer, item, price, fees, shipping
   - Store in `orders` collection

2. **Email Dashboard:**
   - View all emails in AutoRestock UI
   - Search/filter emails
   - Manual order extraction for edge cases

3. **Whitelist Instructions:**
   - Improve spam prevention
   - Gmail/Outlook/Yahoo specific guides

### Medium-term:
4. **Inventory Management:**
   - Track stock across platforms
   - Auto-update on sales
   - Low stock alerts

5. **Financial Reporting:**
   - Revenue by platform
   - Fee analysis
   - Profit margins

6. **Multi-user Tenants:**
   - Team accounts
   - Role-based access

---

## 💡 IMPORTANT NOTES

### Authentication Tokens:
- **Cloudflare API Token:** Limited permissions (Zone Edit)
- **Cloudflare Global API Key:** Full access (needed for routing rules)
- **CF_WEBHOOK_TOKEN:** Secure random string, shared between Worker and Email Ingestion Service

### MongoDB Connection:
- Always use database name: `client.db('autorestock')`
- Railway provides `MONGO_URL` variable in AutoRestockDB service
- Connection string format: `mongodb://default:xxx@mongodb.railway.internal:27017`

### SMTP Configuration:
- Namecheap Private Email: $9.88/year (current setup)
- Supports 3 mailboxes: `noreply@`, `support@`, `admin@`
- Alternative: SendGrid, Mailgun, AWS SES (for scaling)

### Cloudflare Worker:
- Deployed separately from Railway services
- Must be updated via Wrangler CLI or Cloudflare Dashboard
- Environment variables set in Cloudflare Dashboard

### Email Parsing:
- `mailparser` is CRITICAL for proper formatting
- Handles: Base64, quoted-printable, MIME multipart, attachments
- Without it, emails arrive as raw encoded text

---

## 📞 EXTERNAL SERVICES

### Cloudflare
- **Account:** development@ljmuk.co.uk
- **Domain:** autorestock.app
- **Email Domain:** in.autorestock.app
- **Worker:** email-router
- **Zone ID:** 82dd495afb9526e8b2223d4cf81af2ef

### Namecheap
- **Domain:** autorestock.app
- **Private Email:** noreply@autorestock.app
- **SMTP:** mail.privateemail.com:587

### Railway
- **Project:** AutoRestock
- **Services:**
  - autorestock-frontend-production
  - autorestock-user-service-production
  - email-ingestion-service-production
  - AutoRestockDB (MongoDB)

### MongoDB
- **Database:** autorestock
- **Provider:** Railway (MongoDB service)
- **Collections:** users, tenants, aliases, emails

---

## 🎯 KEY ACHIEVEMENTS

### Technical:
✅ Eliminated manual Cloudflare destination verification  
✅ Implemented dual-path email delivery  
✅ Proper email parsing and formatting  
✅ Automated routing rule creation via API  
✅ Scalable architecture (unlimited users)  
✅ GDPR compliant data handling  

### Business:
✅ Zero manual work per new customer  
✅ Professional user experience  
✅ Multi-platform support  
✅ Foundation for order extraction (Phase 2)  

---

## 📚 USEFUL COMMANDS

### Check MongoDB Data:
```javascript
// In Railway MongoDB terminal or MongoDB Compass:
use autorestock
db.users.find()
db.tenants.find()
db.aliases.find()
db.emails.find().sort({createdAt: -1}).limit(5)
```

### Clear All Data (Testing):
```javascript
use autorestock
db.users.deleteMany({})
db.tenants.deleteMany({})
db.aliases.deleteMany({})
db.emails.deleteMany({})
```

### Check Service Logs:
```bash
# Railway Dashboard → Service → Logs
# Or via CLI:
railway logs -s autorestock-user-service-production
railway logs -s email-ingestion-service-production
```

### Test SMTP:
```bash
# Using nodemailer-cli (if installed):
nodemailer-test \
  --host mail.privateemail.com \
  --port 587 \
  --user noreply@autorestock.app \
  --pass <password> \
  --from noreply@autorestock.app \
  --to your@email.com \
  --subject "Test" \
  --body "Testing SMTP"
```

---

## 🎓 CONTEXT FOR AI ASSISTANTS

### Project Goals:
The end goal is a **fully automated reseller management platform** that:
1. Ingests order emails from multiple marketplaces
2. Extracts order data automatically
3. Manages inventory across platforms
4. Provides business intelligence and reporting
5. Requires ZERO manual configuration per customer

### Current State:
**Phase 1 (Email Ingestion) is COMPLETE.**  
The system can:
- Register unlimited users
- Create unlimited email aliases
- Receive ALL emails at those aliases
- Store emails in MongoDB for processing
- Forward clean copies to users' inboxes

**Next Phase:**
Build order extraction engine to parse email bodies and extract structured data.

### Technical Principles:
1. **Automation First:** Never require manual configuration
2. **Dual-Path:** AutoRestock AND users get emails
3. **Scalability:** Must work for 1 or 100,000 users
4. **User Experience:** Simple, clean, professional
5. **Data Privacy:** GDPR compliant, transparent

### Constraints:
- Must use Cloudflare Email Routing (already set up)
- Must not require manual email verification per user
- Must work with any user email provider
- Must preserve original email formatting
- Must store full raw emails for processing

---

## ✅ SYSTEM COMPLETE - READY FOR PRODUCTION

**Status:** Production Ready  
**Automated:** 100%  
**Manual Work Per Customer:** ZERO  
**Scalability:** Unlimited  

**The email system is fully functional and ready for customer onboarding!** 🚀

---

## 📞 QUICK REFERENCE

### Service URLs:
- **Frontend:** https://autorestock-frontend-production.up.railway.app
- **User Service:** https://autorestock-user-service-production.up.railway.app
- **Email Ingestion:** https://email-ingestion-service-production.up.railway.app
- **Cloudflare Worker:** email-router.ljmuk.workers.dev (internal)

### Key Files to Know:
1. `cloudflare-workers/email-router-dual.js` - Email reception
2. `microservices/email-ingestion-service/routes/process.js` - Email processing
3. `frontends/app/src/app/users/onboarding/page.tsx` - User onboarding
4. `microservices/AutoRestock-User-Service/routes/emailAliases.js` - Alias creation

### Most Common Tasks:
1. **Add new platform:** Update platform list in onboarding wizard
2. **Fix email formatting:** Modify `process.js` SMTP template
3. **Debug email flow:** Check Cloudflare Worker logs → Email Ingestion logs → MongoDB
4. **Add new feature:** Follow existing pattern in microservices

---

**END OF HANDOFF DOCUMENT**

*Last verified working: October 6, 2025*  
*If you have questions, check the logs first, then review this document.*




