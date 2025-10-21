# Claude.ai Testing Assistant Prompt

Copy and paste this into Claude.ai to get help testing your new eBay frontend:

---

## CONTEXT: eBay Purchases Frontend Just Deployed

I just had Cursor AI build and deploy a complete frontend for my eBay purchases microservice. The code is now live on Railway and I need help systematically testing it.

### What Was Built

**5 New React/TypeScript Components:**
1. `EbayDashboard` - Dashboard with 4 stat cards (total purchases, spending, shipped items, in-transit)
2. `EbaySyncControls` - Manual sync controls with day selection (7/30/90 days) and feedback
3. `EbayPurchaseFilters` - Search box and filters (date range, status)
4. `EbayPurchasesList` - Responsive purchases list (table on desktop, cards on mobile)
5. `EbayPurchaseDetail` - Detailed view showing all 13 purchase fields

**2 New Next.js Pages:**
- `/ebay` - Main purchases dashboard
- `/ebay/purchase/[id]` - Individual purchase detail page

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Custom UI components from `@autorestock/ui-kit`
- lucide-react icons

**Backend API (Already Working):**
- Service URL: `https://delightful-liberation-production.up.railway.app`
- Endpoints:
  - `GET /purchases?limit=100` - Fetch purchases
  - `GET /sync/purchases?days=7&limit=100` - Sync from eBay
  - `GET /oauth/status` - Check OAuth connection
- Database: MongoDB (autorestock.ebay_raw_purchases)
- Authentication: eBay OAuth (already configured)

### URLs to Test

**Frontend (deployed on Railway):**
```
https://autorestock-microservices-frontend-production.up.railway.app
```

**Key pages:**
- Home: `/`
- eBay Dashboard: `/ebay`
- Purchase Detail: `/ebay/purchase/[itemId]`
- Onboarding (OAuth): `/users/onboarding`

**Backend (already working):**
```
https://delightful-liberation-production.up.railway.app
```

### Environment Variable Set
```
NEXT_PUBLIC_EBAY_SERVICE_URL=https://delightful-liberation-production.up.railway.app
```

---

## YOUR TASK

Help me test this eBay frontend systematically. I need you to:

1. **Create a comprehensive test plan** covering:
   - Navigation and routing
   - Dashboard functionality
   - Search and filters
   - Sync controls
   - Purchase detail page
   - Responsive design (desktop/mobile)
   - Error handling
   - Edge cases

2. **Guide me through testing step-by-step** with:
   - Specific actions to perform
   - Expected results for each action
   - What to check in browser console
   - What to look for in Network tab
   - Screenshots I should take

3. **Help diagnose any issues** I find:
   - Interpret error messages
   - Suggest fixes
   - Identify if it's frontend or backend
   - Check if it's a data issue

4. **Verify integration** with the backend:
   - API calls are working
   - Data displays correctly
   - OAuth flow works
   - Session management OK

---

## TESTING SCENARIOS TO COVER

### Basic Functionality
- [ ] Home page loads
- [ ] eBay link in navigation works
- [ ] Dashboard displays stats
- [ ] Purchases list shows data
- [ ] Filters work (search, date, status)
- [ ] Sync button triggers sync
- [ ] Detail page shows purchase info
- [ ] Links to eBay work

### Data Scenarios
- [ ] Empty state (no purchases)
- [ ] Single purchase
- [ ] Multiple purchases
- [ ] Purchases with tracking
- [ ] Purchases without tracking
- [ ] Different statuses

### User Flows
- [ ] First-time user (no OAuth)
- [ ] Returning user (already connected)
- [ ] Manual sync workflow
- [ ] Search and filter workflow
- [ ] View purchase detail workflow

### Edge Cases
- [ ] Invalid purchase ID
- [ ] Network errors
- [ ] API timeout
- [ ] OAuth not connected
- [ ] Very long item titles
- [ ] Missing data fields

### Performance
- [ ] Page load times
- [ ] Filter responsiveness
- [ ] Large datasets (100+ purchases)
- [ ] Mobile performance

---

## CURRENT STATUS

- ✅ Code deployed to Railway
- ✅ Environment variable set
- ✅ Backend API working
- ✅ Build succeeded (no errors)
- ⏳ Awaiting deployment completion
- ⏳ Ready to test

---

## SPECIFIC QUESTIONS TO HELP ME WITH

1. **What's the most efficient order to test these features?**
2. **What browser dev tools should I have open?**
3. **What specific Console errors should I look for?**
4. **What Network requests should I verify?**
5. **How do I test the OAuth flow without breaking my connection?**
6. **What mobile testing tools should I use?**
7. **How do I verify the data is correct?**
8. **What constitutes a "pass" vs "fail" for each feature?**

---

## ADDITIONAL CONTEXT

**Purchase Data Structure (13 fields):**
```json
{
  "itemId": "string",
  "title": "string",
  "sellerUserID": "string",
  "price": number,
  "shippingCost": number,
  "quantity": number,
  "transactionDate": "ISO date",
  "shippedTime": "ISO date",
  "trackingNumber": "string",
  "shippingCarrier": "string",
  "itemStatus": "string",
  "orderId": "string",
  "transactionId": "string"
}
```

**Expected User Journey:**
1. User visits home page
2. Clicks "eBay Purchases" in nav
3. Sees dashboard with stats
4. Clicks "Sync Now" to fetch latest data
5. Uses filters to find specific purchases
6. Clicks a purchase to see details
7. Views tracking info and eBay links

**Known Considerations:**
- OAuth must be connected first (via `/users/onboarding`)
- Sync may take 5-10 seconds
- Mobile uses card layout instead of table
- Empty state should show friendly message
- TypeScript import warnings exist but don't affect functionality

---

## WHAT I NEED FROM YOU

Please provide:

1. **A structured test script** I can follow
2. **Specific commands/actions** for each test
3. **Expected vs actual results** template
4. **Screenshot checklist** of what to capture
5. **Issue reporting template** if I find bugs
6. **Success criteria** for deployment sign-off

Make your instructions:
- ✅ Step-by-step (numbered)
- ✅ Specific (exact URLs, exact actions)
- ✅ Visual (what to look for)
- ✅ Diagnostic (how to troubleshoot)
- ✅ Complete (cover all scenarios)

---

## EXAMPLE OF HELP I NEED

Instead of: "Test the dashboard"

Give me:
```
TEST: Dashboard Stats Cards

1. Navigate to: https://[url]/ebay
2. Wait for page to load (look for spinner to disappear)
3. Check browser console (F12) - should have NO red errors
4. Verify 4 stat cards are visible:
   - Top-left: "Total Purchases" with a number
   - Top-right: "Total Spent" with £X.XX
   - Bottom-left: "Items Shipped" with a number
   - Bottom-right: "In Transit" with a number
5. Take screenshot labeled: "dashboard-stats.png"
6. Open Network tab → Filter XHR → Look for "/purchases" request
7. Check response status: should be 200
8. Check response JSON: should have "success: true" and "purchases" array

✅ PASS if: All 4 cards display, numbers are > 0, no console errors
⚠️ MINOR if: Numbers are 0 (might be no data yet)
❌ FAIL if: Cards don't appear, console errors, API fails
```

That's the level of detail I need for EACH feature!

---

**Please start by giving me the first 5 tests to run, then we'll continue from there.**

