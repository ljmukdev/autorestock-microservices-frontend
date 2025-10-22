# Multi-Alias UX Design - Per-Platform Email Configuration

## 🎯 User Need

Users want different email addresses for different platforms:
- `ebay-orders@in.autorestock.app` → forwards to `ebay@ljmuk.co.uk`
- `vinted-sales@in.autorestock.app` → forwards to `vinted@ljmuk.co.uk`

## 🔄 Proposed Flow (6 Steps)

### Step 1: User Registration ✅ (No change)
### Step 2: Email Settings ✅ (No change)

### Step 3: Email Alias Strategy (REDESIGNED)

**Title:** How would you like to receive emails?

**Option A: One Email for Everything (Simple)**
```
┌─────────────────────────────────────────────┐
│ ○ Use one email for all platforms           │
│                                             │
│   One email address receives notifications  │
│   from all your platforms                   │
│                                             │
│   Your alias: [company-name]                │
│              @in.autorestock.app            │
│   Forwards to: [yourEmail]                  │
└─────────────────────────────────────────────┘
```

**Option B: Separate Email per Platform (Organized)**
```
┌─────────────────────────────────────────────┐
│ ● Separate email for each platform          │
│                                             │
│   Different email addresses for different   │
│   platforms - perfect for organizing        │
│                                             │
│   eBay:    ebay-[name]@in.autorestock.app   │
│   Vinted:  vinted-[name]@in.autorestock.app │
│                                             │
│   Configure forwarding on next step         │
└─────────────────────────────────────────────┘
```

**Continue Button**

---

### Step 4: Create Email Aliases (REDESIGNED)

#### If "One Email for All" selected:

```
Create Your Email Alias

Your alias: [auto-suggested]@in.autorestock.app
Forwards to: [email from Step 2]

[Create Alias] →
```

#### If "Separate Emails" selected:

```
Create Platform-Specific Email Aliases

Select which platforms you use and configure each:

┌─────────────────────────────────────────────┐
│ ☑ eBay                                      │
│   Alias: ebay-ljmuk @in.autorestock.app     │
│   Forward to: [ebay@ljmuk.co.uk         ] │
│   [Change Forwarding Email]                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ☑ Vinted                                    │
│   Alias: vinted-ljmuk @in.autorestock.app   │
│   Forward to: [vinted@ljmuk.co.uk       ] │
│   [Change Forwarding Email]                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ☐ Other Platform                            │
│   Alias: [custom]@in.autorestock.app        │
│   Forward to: [             ]               │
└─────────────────────────────────────────────┘

Default forwarding email: development@ljmuk.co.uk
(from Step 2 - used if not specified)

[Create Aliases] → (Creates all selected at once)
```

---

### Step 5: Platform Setup Instructions (UPDATED)

Shows only the platforms they selected, with their specific email:

```
Add These Emails to Your Platforms

eBay Setup
  Your eBay email: ebay-ljmuk@in.autorestock.app
  [Copy] [View Guide]
  
Vinted Setup  
  Your Vinted email: vinted-ljmuk@in.autorestock.app
  [Copy] [View Guide]

[GDPR Disclaimer]
[Signature]

[Continue →]
```

---

### Step 6: Email Test (UPDATED)

Test each platform email:

```
Test Your Email Setup

We've created X email addresses for you:

eBay: ebay-ljmuk@in.autorestock.app → ebay@ljmuk.co.uk
  [Send Test] Status: ⏳ Not tested

Vinted: vinted-ljmuk@in.autorestock.app → vinted@ljmuk.co.uk
  [Send Test] Status: ⏳ Not tested

[Continue] or [Skip]
```

---

## 📊 Backend Changes Needed

### Database Schema Update

**aliases collection - Add service field:**
```javascript
{
  tenantId: ObjectId,
  localPart: String,
  fullAddress: String,
  forwardTo: String,    // NEW - specific forwarding email
  service: String,       // NEW - 'ebay', 'vinted', 'all', etc.
  status: String,
  createdAt: Date
}
```

### API Endpoint Update

**POST /api/v1/tenants/:id/aliases** - Accept array:
```javascript
Body: {
  aliases: [
    { localPart: 'ebay-ljmuk', forwardTo: 'ebay@ljmuk.co.uk', service: 'ebay' },
    { localPart: 'vinted-ljmuk', forwardTo: 'vinted@ljmuk.co.uk', service: 'vinted' }
  ]
}
```

Or keep single endpoint and call it multiple times.

---

## 🎯 Implementation Plan

1. **Step 3:** Radio buttons for email strategy
2. **Step 4:** Dynamic alias creation based on choice
3. **Step 5:** Platform-specific setup instructions
4. **Step 6:** Multi-email testing
5. **Step 7:** Completion

---

**Want me to implement this multi-alias flow?** It's about 1-2 hours of work but gives users much more flexibility! 🚀










