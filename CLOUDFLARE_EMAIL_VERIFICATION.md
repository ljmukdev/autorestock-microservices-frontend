# Cloudflare Email Verification - How It Works

## 🔄 Automated Destination Address Creation

When a user creates email aliases in AutoRestock, the system now **automatically**:

### Step 1: User Creates Alias (Step 3 in Onboarding)
```
User selects "Separate per platform"
Enters forwarding emails:
- eBay → ebay@ljmuk.co.uk
- Vinted → vinted@ljmuk.co.uk
```

### Step 2: Backend Creates Destination Addresses
```javascript
// For each forwarding email:
POST https://api.cloudflare.com/client/v4/zones/{zone_id}/email/routing/addresses
{
  "email": "vinted@ljmuk.co.uk"
}

Response:
{
  "success": true,
  "result": {
    "email": "vinted@ljmuk.co.uk",
    "verified": false,  // ← Not verified yet
    "created": "2025-10-02T10:30:00Z"
  }
}
```

### Step 3: Cloudflare Sends Verification Email
```
To: vinted@ljmuk.co.uk
Subject: Verify your email address for Cloudflare Email Routing
Body: Click here to verify this email for email forwarding...
```

### Step 4: User Verifies Email
User checks their inbox at `vinted@ljmuk.co.uk` and clicks the verification link.

### Step 5: Routing Rule Becomes Active
Once verified, the routing rule activates:
```
vinted-ljmuk@in.autorestock.app → vinted@ljmuk.co.uk ✅ Active
```

---

## 📧 User Experience

### What Users See:

**During Alias Creation (Step 3):**
```
✅ Aliases created! 
📧 Verification emails sent to: vinted@ljmuk.co.uk
Please check your inbox and click the verification links from Cloudflare 
before emails can be forwarded.
```

**What Users Need To Do:**
1. Check inbox at the forwarding email addresses
2. Look for email from Cloudflare
3. Click verification link
4. Return to onboarding and continue

---

## ⚙️ Technical Flow

```
User creates alias
  ↓
Backend calls: createDestinationAddress("vinted@ljmuk.co.uk")
  ↓
Cloudflare API creates destination address
  ↓
Cloudflare sends verification email → vinted@ljmuk.co.uk
  ↓
Backend creates routing rule (pending verification)
  ↓
User clicks verification link in email
  ↓
Cloudflare marks destination as verified
  ↓
Routing rule becomes fully active ✅
```

---

## 🎯 Benefits

✅ **Fully Automated** - No manual Cloudflare dashboard work  
✅ **Scalable** - Works for unlimited users  
✅ **Secure** - Cloudflare verifies ownership of destination emails  
✅ **Clean** - Users can use any existing email addresses  

---

## ⚠️ Important Notes

1. **Verification Required:** Users MUST click the verification link in their inbox for forwarding to work
2. **Check Spam:** Cloudflare verification emails may go to spam initially
3. **Timing:** Verification emails arrive within 1-2 minutes
4. **Already Verified:** If an email was verified before, no new verification needed

---

## 🔧 API Endpoints Used

**Create Destination Address:**
```
POST /zones/{zone_id}/email/routing/addresses
Authorization: Bearer {API_TOKEN}
Body: { "email": "destination@example.com" }
```

**Create Routing Rule:**
```
POST /zones/{zone_id}/email/routing/rules
Authorization: Bearer {API_TOKEN}
Body: {
  "matchers": [{ "type": "literal", "field": "to", "value": "alias@in.autorestock.app" }],
  "actions": [{ "type": "forward", "value": ["destination@example.com"] }],
  "enabled": true
}
```

---

## ✅ Current Status: PRODUCTION READY

The system now handles destination address creation and verification automatically with proper user guidance.








