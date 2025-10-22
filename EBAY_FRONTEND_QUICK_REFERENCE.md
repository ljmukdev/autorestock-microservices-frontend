# eBay Frontend - Quick Reference Card 📋

## 🔗 URLs

| What | URL |
|------|-----|
| **Frontend Home** | https://autorestock-microservices-frontend-production.up.railway.app |
| **eBay Dashboard** | https://autorestock-microservices-frontend-production.up.railway.app/ebay |
| **Purchase Detail** | https://autorestock-microservices-frontend-production.up.railway.app/ebay/purchase/[itemId] |
| **Onboarding (OAuth)** | https://autorestock-microservices-frontend-production.up.railway.app/users/onboarding |
| **Backend API** | https://delightful-liberation-production.up.railway.app |
| **API Health Check** | https://delightful-liberation-production.up.railway.app/health |
| **API Purchases** | https://delightful-liberation-production.up.railway.app/purchases |

---

## 🎯 Quick Test Commands

### Test API Directly (PowerShell)
```powershell
# Check backend health
Invoke-RestMethod -Uri "https://delightful-liberation-production.up.railway.app/health"

# Get purchases
Invoke-RestMethod -Uri "https://delightful-liberation-production.up.railway.app/purchases?limit=10"

# Trigger sync
Invoke-RestMethod -Uri "https://delightful-liberation-production.up.railway.app/sync/purchases?days=7&limit=10"
```

### Test API Directly (curl)
```bash
# Check backend health
curl https://delightful-liberation-production.up.railway.app/health

# Get purchases
curl https://delightful-liberation-production.up.railway.app/purchases?limit=10

# Trigger sync
curl https://delightful-liberation-production.up.railway.app/sync/purchases?days=7
```

---

## 📊 Components Overview

| Component | Purpose | Location |
|-----------|---------|----------|
| `EbayDashboard` | 4 stat cards | `/ebay` page top |
| `EbaySyncControls` | Sync button + feedback | Below dashboard |
| `EbayPurchaseFilters` | Search + filters | Above list |
| `EbayPurchasesList` | Purchases table/cards | Main content |
| `EbayPurchaseDetail` | Full purchase info | `/ebay/purchase/[id]` |

---

## ✅ Features Checklist

- [ ] Dashboard stats (4 cards)
- [ ] Manual sync (7/30/90 days)
- [ ] Search by title/seller
- [ ] Date range filter
- [ ] Status filter
- [ ] Purchases list (responsive)
- [ ] Purchase detail page
- [ ] eBay item links
- [ ] eBay seller links
- [ ] Tracking display
- [ ] Copy-to-clipboard
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Mobile responsive

---

## 🔍 Debugging Quick Reference

### Browser Console (F12)

**No Errors Expected:**
```
✅ No red errors in console
✅ React warnings OK (yellow)
✅ API calls show in Network tab
```

**Network Tab - Look For:**
```
GET /purchases?limit=100          → 200 OK
GET /sync/purchases?days=7        → 200 OK
GET /oauth/status                 → 200 OK (if checking connection)
```

**Response Structure:**
```json
{
  "success": true,
  "count": 10,
  "purchases": [...]
}
```

---

## 🐛 Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| "No purchases found" | No OAuth or no data | Connect eBay at `/users/onboarding` then sync |
| API errors | Env var not set | Check Railway: `NEXT_PUBLIC_EBAY_SERVICE_URL` |
| 404 on `/ebay` | Deployment not complete | Wait for Railway build, check logs |
| Blank page | JavaScript error | Check browser console (F12) |
| Old data | Cache issue | Hard refresh (Ctrl+Shift+R) |
| Sync fails | Backend down | Test: `/health` endpoint |

---

## 📱 Responsive Breakpoints

| Screen Size | Layout | What Changes |
|-------------|--------|--------------|
| **Desktop** (>1024px) | Table | Full table with all columns |
| **Tablet** (768-1024px) | Table/Hybrid | Condensed table or cards |
| **Mobile** (<768px) | Cards | Card layout, stacked info |

---

## 🔐 Environment Variables

**Required on Railway:**
```
NEXT_PUBLIC_EBAY_SERVICE_URL=https://delightful-liberation-production.up.railway.app
```

**Optional (already set):**
```
NEXT_PUBLIC_USER_API_BASE=https://autorestock-user-service-production.up.railway.app
```

---

## 📦 Data Structure

**Purchase Object (13 fields):**
```typescript
{
  itemId: string              // eBay item ID
  title: string               // Item title
  sellerUserID: string        // eBay seller username
  price: number               // Item price (£)
  shippingCost: number        // Shipping cost (£)
  quantity: number            // Quantity purchased
  transactionDate: string     // ISO date
  shippedTime?: string        // ISO date (optional)
  trackingNumber?: string     // Tracking code (optional)
  shippingCarrier?: string    // Carrier name (optional)
  itemStatus: string          // Status (Despatched, Delivered, etc.)
  orderId?: string            // eBay order ID (optional)
  transactionId: string       // Transaction ID
}
```

---

## 🚀 Deployment Info

**Repository:** `ljmukdev/microservice-frontends`  
**Branch:** `main`  
**Railway Service:** Frontend Service  
**Build Command:** `pnpm -r --filter='@autorestock/*' build && pnpm build`  
**Start Command:** `pnpm start`  
**Last Deploy:** [Check Railway dashboard]

---

## 📞 Support Files

| File | Purpose |
|------|---------|
| `EBAY_FRONTEND_ANALYSIS.md` | Project analysis & tech decisions |
| `EBAY_FRONTEND_COMPLETE.md` | Complete implementation guide |
| `EBAY_FRONTEND_QUICKSTART.md` | Quick start guide |
| `EBAY_FRONTEND_TEST_GUIDE.md` | Detailed testing checklist |
| `CLAUDE_EBAY_FRONTEND_TEST_PROMPT.md` | Prompt for Claude.ai testing help |
| `CLAUDE_TEST_PROMPT_SHORT.txt` | Short version for quick paste |

---

## 🎯 Success Metrics

**Deployment is successful if:**
- ✅ All pages load without errors
- ✅ Dashboard stats display correctly
- ✅ Sync button works
- ✅ Filters function properly
- ✅ Purchase detail page accessible
- ✅ Links to eBay work
- ✅ Responsive on mobile
- ✅ No console errors

---

## 📸 Screenshot Checklist

Take these for documentation:
- [ ] Home page with eBay link
- [ ] Dashboard with stats
- [ ] Purchases list (desktop)
- [ ] Purchases list (mobile)
- [ ] Filters in action
- [ ] Purchase detail page
- [ ] Empty state
- [ ] Sync success message
- [ ] Network tab showing API calls

---

**Print this and keep it handy while testing!** 📋


