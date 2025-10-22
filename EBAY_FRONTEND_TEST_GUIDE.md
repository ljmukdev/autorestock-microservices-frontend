# eBay Frontend - Live Testing Guide 🧪

## ✅ Deployment Status

**Code pushed to GitHub:** ✅  
**Railway will auto-deploy:** In progress...

---

## 🔧 CRITICAL: Set Environment Variable First!

Before testing, ensure this is set in **Railway Dashboard**:

1. Go to: Railway Dashboard → Frontend Service → Variables
2. Add/verify:
   ```
   NEXT_PUBLIC_EBAY_SERVICE_URL=https://delightful-liberation-production.up.railway.app
   ```
3. If you just added it, Railway will automatically redeploy

---

## 🧪 Testing Checklist

### 1. Check Railway Deployment Status

**Railway Dashboard:**
- Check "Deployments" tab
- Wait for build to complete (green checkmark)
- Check logs for any errors

**Expected Build Output:**
```
✓ Compiled successfully
Route: /ebay                     1.57 kB
Route: /ebay/purchase/[id]       1.24 kB
```

---

### 2. Test Home Page Navigation

**URL:** `https://autorestock-microservices-frontend-production.up.railway.app/`

✅ **Check:**
- [ ] "eBay Purchases" link visible in navigation
- [ ] Link is clickable
- [ ] Clicking navigates to `/ebay` page

---

### 3. Test Main eBay Dashboard

**URL:** `https://autorestock-microservices-frontend-production.up.railway.app/ebay`

✅ **Check:**
- [ ] Page loads without errors
- [ ] Navigation bar shows (AutoRestock, Home, User Onboarding, eBay Purchases)
- [ ] Page title: "eBay Purchases"
- [ ] Subtitle visible

**Dashboard Stats (4 Cards):**
- [ ] Total Purchases card
- [ ] Total Spent card
- [ ] Items Shipped card
- [ ] In Transit card

**Sync Controls:**
- [ ] "Sync eBay Purchases" section visible
- [ ] Days dropdown (7/30/90 days)
- [ ] "Sync Now" button visible
- [ ] Last sync timestamp displays

**Filters:**
- [ ] Search box visible
- [ ] Date range dropdown
- [ ] Status filter dropdown

**Purchases List:**
- [ ] Either: Table shows purchases (desktop)
- [ ] Or: Cards show purchases (mobile)
- [ ] Or: "No purchases found" message if empty

---

### 4. Test Search & Filters

**Search:**
1. Type a seller name or item title in search box
2. ✅ List filters in real-time

**Date Range:**
1. Select "Last 7 days" from dropdown
2. ✅ List updates to show only recent purchases

**Status Filter:**
1. Select "Despatched" from dropdown
2. ✅ List shows only despatched items

**Reset:**
1. Clear search and set filters to "All"
2. ✅ Full list returns

---

### 5. Test Manual Sync

1. Click "Sync Now" button
2. ✅ **Check:**
   - [ ] Button shows "Syncing..."
   - [ ] Spinning icon appears
   - [ ] Success message appears: "Successfully synced purchases with tracking data!"
   - [ ] Last sync timestamp updates
   - [ ] Purchase list refreshes

**If No Purchases Yet:**
- This is normal if eBay OAuth not connected
- Go to `/users/onboarding` first
- Connect eBay account
- Return to `/ebay` and sync

---

### 6. Test Purchase Detail View

**From List:**
1. Click "View" button on any purchase (desktop)
2. Or click a purchase card (mobile)

**URL:** `https://autorestock-microservices-frontend-production.up.railway.app/ebay/purchase/[itemId]`

✅ **Check:**
- [ ] Page loads with purchase title as heading
- [ ] Back button works
- [ ] 6 information sections display:
  - [ ] Item Information
  - [ ] Pricing
  - [ ] Seller Information
  - [ ] Dates
  - [ ] Shipping & Tracking
  - [ ] Transaction Details

**Test Links:**
- [ ] "View on eBay" opens eBay item page in new tab
- [ ] Seller username link opens eBay seller profile
- [ ] Copy buttons work (click to copy IDs/tracking)

**Test Data:**
- [ ] All 13 fields visible:
  - Item ID, Title, Quantity, Status
  - Item Price, Shipping Cost, Total Cost
  - Seller Username
  - Purchase Date, Shipped Date
  - Tracking Number, Shipping Carrier
  - Transaction ID, Order ID

---

### 7. Test Responsive Design

**Desktop (> 1024px):**
- [ ] Table layout for purchases
- [ ] All columns visible
- [ ] Horizontal scroll if needed

**Tablet (768px - 1024px):**
- [ ] Table adjusts or switches to cards
- [ ] Filters stack nicely

**Mobile (< 768px):**
- [ ] Card layout for purchases
- [ ] All information visible
- [ ] Easy to tap and navigate
- [ ] Navigation hamburger (if applicable)

---

### 8. Test Edge Cases

**Empty State:**
1. If no purchases exist
2. ✅ Shows: "No purchases found" with package icon

**Loading State:**
1. Refresh page
2. ✅ Shows: Loading spinner with "Loading purchases..."

**Error State:**
1. Turn off internet or break API URL
2. ✅ Shows: Error message gracefully

**Invalid Purchase ID:**
1. Visit: `/ebay/purchase/INVALID_ID`
2. ✅ Shows: "Purchase Not Found" error page
3. ✅ "Back to Purchases" button works

---

## 🐛 Troubleshooting

### "No purchases found"
**Cause:** eBay OAuth not connected or no data synced  
**Fix:**
1. Go to `/users/onboarding`
2. Connect eBay account via OAuth
3. Return to `/ebay` and click "Sync Now"

### API errors / Can't fetch data
**Cause:** Environment variable not set or eBay service down  
**Fix:**
1. Check Railway Variables: `NEXT_PUBLIC_EBAY_SERVICE_URL` is set
2. Test eBay service directly: `https://delightful-liberation-production.up.railway.app/health`
3. Check eBay service logs in Railway

### Page not found (404)
**Cause:** Deployment not complete or wrong URL  
**Fix:**
1. Check Railway deployment finished
2. Verify URL is correct
3. Check Railway logs for errors

### Build failed on Railway
**Cause:** Missing dependencies or TypeScript errors  
**Fix:**
1. Check Railway build logs
2. Common issue: Environment variable not set
3. Re-push if needed: `git push origin main --force` (only if safe)

---

## 📊 Test Results Template

Copy this and fill it out:

```
## eBay Frontend Test Results

**Date:** [Date/Time]
**Tester:** [Your Name]
**Frontend URL:** https://autorestock-microservices-frontend-production.up.railway.app

### Deployment
- [ ] Railway build succeeded
- [ ] No deployment errors
- [ ] Environment variable set

### Navigation
- [ ] eBay link visible on home page
- [ ] Navigation to /ebay works

### Dashboard
- [ ] Stats cards display correctly
- [ ] Sync controls work
- [ ] Filters function properly
- [ ] Purchases list displays

### Detail View
- [ ] Purchase detail page loads
- [ ] All fields visible
- [ ] Links work correctly
- [ ] Back button functions

### Responsive
- [ ] Desktop view works
- [ ] Mobile view works

### Issues Found
[List any issues or bugs]

### Overall Status
- [ ] ✅ PASS - Ready for use
- [ ] ⚠️ MINOR ISSUES - Usable with caveats
- [ ] ❌ FAIL - Needs fixes
```

---

## 🎯 Success Criteria

The deployment is successful if:

✅ All pages load without errors  
✅ Navigation works  
✅ Dashboard displays stats  
✅ Sync button functions  
✅ Filters work  
✅ Purchase detail page accessible  
✅ Links to eBay work  
✅ Responsive on mobile  

---

## 📞 Next Steps After Testing

### If Everything Works ✅
1. Mark deployment as complete
2. Document any learnings
3. Consider phase 2 enhancements (see EBAY_FRONTEND_COMPLETE.md)

### If Issues Found ⚠️
1. Document specific errors
2. Check Railway logs
3. Test API endpoints directly
4. Fix and redeploy

---

**Happy Testing!** 🚀



