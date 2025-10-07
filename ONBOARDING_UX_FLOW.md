# AutoRestock Onboarding UX Flow - Complete Design

## 🎯 Current Flow (What We Have)

**4 Steps:**
1. ✅ User Registration (with company info)
2. ✅ Email Settings (forwarding email)
3. ✅ Create Alias (auto-suggested)
4. ✅ Onboarding Status (completion)

---

## 🚀 Enhanced Flow (What We Need)

**6 Steps:**
1. User Registration
2. Email Settings
3. Create Alias
4. **Platform Configuration** ← NEW
5. **Test Email Delivery** ← NEW
6. Onboarding Complete

---

## 📋 Step 4: Platform Configuration (NEW)

### Purpose
Guide users to add their AutoRestock email to their selling platforms

### UI Design

**Title:** Add Your Email to Selling Platforms

**Content:**
```
Your AutoRestock email address is ready:
  📧 [alias]@in.autorestock.app

This email will forward to: [forwardingEmail]

To start receiving order notifications, add this email address to your platforms:
```

**Platform Cards (Show relevant ones based on user selection):**

#### Card 1: eBay Setup
```
┌─────────────────────────────────────────────┐
│ eBay                                    [?] │
├─────────────────────────────────────────────┤
│ Add this email to receive eBay notifications│
│                                             │
│ Your email: testuser@in.autorestock.app    │
│ [Copy Email] [View Guide]                   │
│                                             │
│ Quick Steps:                                │
│ 1. Go to eBay Account Settings              │
│ 2. Navigate to Communication Preferences    │
│ 3. Add email: testuser@in.autorestock.app   │
│ 4. Verify the email                         │
│                                             │
│ ☐ I've added this email to eBay             │
└─────────────────────────────────────────────┘
```

#### Card 2: Vinted Setup
```
┌─────────────────────────────────────────────┐
│ Vinted                                  [?] │
├─────────────────────────────────────────────┤
│ Add this email to receive Vinted notifications│
│                                             │
│ Your email: testuser@in.autorestock.app    │
│ [Copy Email] [View Guide]                   │
│                                             │
│ Quick Steps:                                │
│ 1. Go to Vinted Settings                    │
│ 2. Navigate to Notifications                │
│ 3. Add email: testuser@in.autorestock.app   │
│                                             │
│ ☐ I've added this email to Vinted           │
└─────────────────────────────────────────────┘
```

**Continue Button:**
- Enabled if at least one platform checkbox is checked
- Button: "Continue to Email Test →"

---

## 📋 Step 5: Test Email Delivery (NEW)

### Purpose
Let users test that email forwarding is working before they finish

### UI Design

**Title:** Test Your Email Setup

**Content:**
```
Let's make sure everything is working correctly.

We'll send a test email to verify your setup:

  From: noreply@autorestock.app
  To: [alias]@in.autorestock.app
  Expected in: [forwardingEmail]

This test will:
  ✓ Verify Cloudflare is receiving emails
  ✓ Confirm forwarding is working
  ✓ Check your email delivery
```

**Test Section:**
```
┌─────────────────────────────────────────────┐
│ Email Delivery Test                         │
├─────────────────────────────────────────────┤
│                                             │
│ [Send Test Email]  [Waiting for test...]   │
│                                             │
│ Status: Waiting for you to send test email │
│                                             │
│ Or send an email from any address to:      │
│ testuser@in.autorestock.app                 │
│                                             │
│ Check your inbox at: user@example.com       │
│                                             │
│ [I Received the Test Email ✓]              │
│ [Skip This Step]                            │
└─────────────────────────────────────────────┘
```

**Progress Indicators:**
- 🟡 Sending test email...
- 🔵 Test email sent! Check your inbox
- 🟢 Test successful! Email forwarding is working
- 🔴 Test failed - need help?

---

## 📋 Step 6: Onboarding Complete (Enhanced)

### UI Design

**Title:** 🎉 You're All Set!

**Content:**
```
Your AutoRestock account is fully configured and ready to use.

Setup Summary:
  ✓ Account created
  ✓ Email forwarding configured
  ✓ Email alias created: [alias]@in.autorestock.app
  ✓ Platforms configured
  ✓ Email delivery tested

Your AutoRestock Email:
  📧 [alias]@in.autorestock.app
  → Forwards to: [forwardingEmail]

Next Steps:
  • Start receiving order notifications automatically
  • View your dashboard to see processed emails
  • Configure additional settings

[Go to Dashboard →]  [Download Setup Guide PDF]
```

---

## 🛠 Implementation Components

### Frontend Components Needed

**1. PlatformConfiguration.tsx** (New)
```typescript
interface Platform {
  id: string;
  name: string;
  icon: string;
  setupSteps: string[];
  helpUrl: string;
}

interface Props {
  alias: string;
  forwardingEmail: string;
  selectedPlatforms: string[];
  onComplete: (configuredPlatforms: string[]) => void;
}
```

**2. EmailDeliveryTest.tsx** (New)
```typescript
interface Props {
  alias: string;
  forwardingEmail: string;
  onTestSuccess: () => void;
  onSkip: () => void;
}

// Features:
// - Send test email button
// - Real-time status checking
// - Manual confirmation option
```

**3. OnboardingComplete.tsx** (Enhanced)
```typescript
interface Props {
  user: User;
  alias: EmailAlias;
  platforms: string[];
  onGoToDashboard: () => void;
}
```

### Backend Endpoints Needed

**1. Send Test Email**
```javascript
POST /api/v1/test-email
Body: { userId, aliasId }
Response: { success: true, messageSent: true }

// Sends email from: noreply@autorestock.app
// To: user's alias
// Subject: "AutoRestock Email Test"
```

**2. Check Test Email Status**
```javascript
GET /api/v1/test-email/status?userId={id}
Response: { 
  testSent: true,
  timestamp: "2025-10-01...",
  received: false 
}

// Could check Email Ingestion Service logs
```

---

## 📝 Platform Setup Guides

### eBay Guide
```markdown
# Adding AutoRestock Email to eBay

1. Log into eBay.com
2. Click "My eBay" → "Account Settings"
3. Navigate to "Communication Preferences"
4. Under "Email notifications", click "Edit"
5. Add your AutoRestock email: [alias]@in.autorestock.app
6. eBay will send a verification email
7. Check your forwarding inbox and click verify

✅ Done! You'll now receive eBay notifications
```

### Vinted Guide
```markdown
# Adding AutoRestock Email to Vinted

1. Open Vinted app or website
2. Go to Settings
3. Select "Notifications"
4. Add email: [alias]@in.autorestock.app
5. Vinted will send verification email
6. Click the link to verify

✅ Done! You'll now receive Vinted notifications
```

---

## 🎨 Updated Onboarding Progress UI

```
┌──────┬──────┬──────┬──────┬──────┬──────┐
│  1   │  2   │  3   │  4   │  5   │  6   │
│ User │Email │Alias │Plat- │ Test │Done! │
│      │      │      │forms │Email │      │
└──────┴──────┴──────┴──────┴──────┴──────┘
```

---

## 🚀 Quick Implementation Priority

### Immediate (30 min):
1. Add Step 4: Platform Configuration component
2. Add Step 5: Email Test component  
3. Update Step 6: Enhanced completion screen
4. Update onboarding page to show 6 steps

### Short-term (1 hour):
1. Create test email endpoint
2. Add platform setup guides
3. Add copy-to-clipboard functionality
4. Add PDF export for setup guide

---

## 📊 User Flow Example

```
Sarah registers → Company: "Sarah's Vintage Shop"
  ↓
Step 1: Creates account
  ↓
Step 2: Sets forwarding: sarah@gmail.com
  ↓
Step 3: Gets alias: sarahs-vintage-shop@in.autorestock.app
  ↓
Step 4: Selects platforms: eBay, Vinted
  → Shows setup instructions for each
  → Checkboxes to confirm added
  ↓
Step 5: Tests email delivery
  → Clicks "Send Test Email"
  → Receives test in sarah@gmail.com
  → Clicks "I Received It"
  ↓
Step 6: Complete! 
  → Shows summary
  → Button to dashboard
  ↓
Sarah's ready to receive orders! ✅
```

---

**Want me to implement Steps 4, 5, and 6 now?** This will complete the UX! 🎯




