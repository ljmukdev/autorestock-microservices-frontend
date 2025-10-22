# eBay Frontend - Quick Start Guide 🚀

## What You Have Now

A complete eBay purchases frontend that connects to your working microservice at:
`https://delightful-liberation-production.up.railway.app`

**No backend changes were made - your eBay microservice is untouched!**

---

## Files Created (Summary)

### 5 New UI Components
1. `EbayDashboard.tsx` - Stats overview
2. `EbaySyncControls.tsx` - Sync button with feedback
3. `EbayPurchaseFilters.tsx` - Search & filters
4. `EbayPurchasesList.tsx` - Purchases table/cards
5. `EbayPurchaseDetail.tsx` - Single purchase view

### 2 New Pages
1. `/ebay` - Main purchases dashboard
2. `/ebay/purchase/[id]` - Purchase detail page

---

## Build & Deploy (3 Steps)

### Step 1: Build Locally
```bash
cd frontends/app

# Install dependencies (if needed)
pnpm install

# Build UI packages
pnpm -r --filter='@autorestock/*' build

# Build Next.js app
pnpm build
```

### Step 2: Set Environment Variable on Railway
In Railway dashboard → Frontend Service → Variables:
```
NEXT_PUBLIC_EBAY_SERVICE_URL=https://delightful-liberation-production.up.railway.app
```

### Step 3: Deploy
```bash
git add .
git commit -m "feat: Add eBay purchases frontend with dashboard, filters, and detail views"
git push origin main
```

Railway will auto-deploy!

---

## Test Locally First (Optional)

```bash
# Set environment variable
$env:NEXT_PUBLIC_EBAY_SERVICE_URL="https://delightful-liberation-production.up.railway.app"

# Run dev server
pnpm dev

# Open browser
http://localhost:3000/ebay
```

---

## After Deployment - Test These

✅ **Navigation**
- Home page → "eBay Purchases" link visible
- Click link → `/ebay` page loads

✅ **Dashboard**
- See 4 stat cards (Total Purchases, Total Spent, etc.)
- Numbers populate from API

✅ **Purchases List**
- See table of purchases (or "No purchases" if empty)
- Each row shows: Title, Seller, Date, Price, Status, Tracking

✅ **Filters**
- Search box filters by title/seller
- Date range dropdown (7/30/90 days, All)
- Status filter dropdown

✅ **Sync**
- Click "Sync Now" button
- See "Syncing..." message
- See success/error toast
- Purchases update

✅ **Purchase Detail**
- Click "View" on any purchase
- Navigate to `/ebay/purchase/[itemId]`
- See all 13 fields in organized sections
- Click "View on eBay" → Opens eBay item page
- Click seller name → Opens eBay seller profile

---

## Troubleshooting

### "No purchases found"
- Check if eBay OAuth is connected (`/users/onboarding`)
- Try manual sync (Sync Now button)
- Check backend at: `https://delightful-liberation-production.up.railway.app/purchases`

### API errors
- Verify `NEXT_PUBLIC_EBAY_SERVICE_URL` is set on Railway
- Check backend is running: `https://delightful-liberation-production.up.railway.app/health`

### Build errors
- Run `pnpm install` again
- Check Node.js version (should be 18+)
- Clear `.next` folder and rebuild

---

## What's Next?

Your eBay frontend is ready! You can now:

1. **View all purchases** from eBay with tracking data
2. **Sync manually** or wait for automatic 2-hour syncs
3. **Filter and search** purchases easily
4. **Track package status** with carrier info
5. **Link directly** to eBay items and sellers

---

## Architecture

```
Frontend (Next.js)
    ↓ fetch()
eBay Microservice (Express)
    ↓ OAuth + API calls
eBay API
    ↓
MongoDB (ebay_raw_purchases)
```

**Data Flow:**
1. User visits `/ebay`
2. Frontend calls `${NEXT_PUBLIC_EBAY_SERVICE_URL}/purchases`
3. Backend returns data from MongoDB
4. Frontend displays in table/cards
5. User can sync to fetch latest from eBay

---

## Links

- **Frontend URLs:**
  - Main page: `https://[your-frontend-url]/ebay`
  - Detail: `https://[your-frontend-url]/ebay/purchase/[itemId]`

- **Backend URLs:**
  - Service: `https://delightful-liberation-production.up.railway.app`
  - Purchases API: `.../purchases?limit=100`
  - Sync API: `.../sync/purchases?days=7`
  - Health: `.../health`
  - Diagnostics: `.../diag`

---

## Need Help?

Check these docs:
- `EBAY_FRONTEND_COMPLETE.md` - Full implementation details
- `EBAY_FRONTEND_ANALYSIS.md` - Project analysis
- `EBAY_OAUTH_FIX_HANDOFF.md` - OAuth integration details

---

**🎉 Enjoy your new eBay purchases tracking frontend!**



