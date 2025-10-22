# eBay Purchases Frontend - Project Analysis & Implementation Plan

## 1. Tech Stack Analysis ✅

### Frontend Framework
- **Next.js 14** (App Router with `src/app/` directory)
- **React 18.2**
- **TypeScript**

### UI Components & Styling
- **Custom UI Kit**: `@autorestock/ui-kit` workspace package
- **Tailwind CSS** for styling (evident from className usage)
- **Available Components**:
  - Button, Input, Card, Alert, Loading, Toast
  - Layout components: Container, Flex, Grid, Stack
  - lucide-react for icons

### Routing Pattern
- Next.js App Router: `src/app/[route]/page.tsx`
- Example: `/users/onboarding` → `src/app/users/onboarding/page.tsx`

### API Integration Pattern
- **Native Fetch API** (no Axios/React Query detected)
- Pattern: Direct fetch calls in components
- Environment variables: `NEXT_PUBLIC_*` prefix for client-side access

---

## 2. Project Structure 📁

```
frontends/app/
├── src/
│   └── app/
│       ├── page.tsx                    # Home page with nav
│       └── users/
│           └── onboarding/
│               └── page.tsx            # Onboarding flow
├── packages/
│   ├── ui-user/                        # User-specific components
│   │   └── src/
│   │       └── components/
│   │           ├── OnboardingWizard.tsx
│   │           ├── EbayOAuth.tsx
│   │           └── ...
│   └── (shared via workspace)
└── package.json
```

---

## 3. Implementation Plan 🎯

### Folder Structure
```
frontends/app/src/app/
├── ebay/                               # NEW
│   ├── page.tsx                        # Main eBay dashboard
│   ├── purchases/
│   │   └── page.tsx                    # Purchases list view
│   └── purchase/
│       └── [id]/
│           └── page.tsx                # Purchase detail view
```

### Component Structure
```
packages/ui-user/src/components/
├── EbayDashboard.tsx                   # NEW - Stats & overview
├── EbayPurchasesList.tsx               # NEW - Purchases table
├── EbayPurchaseDetail.tsx              # NEW - Single purchase view
├── EbayPurchaseFilters.tsx             # NEW - Filters & search
└── EbaySyncControls.tsx                # NEW - Sync buttons
```

---

## 4. UI Design System Match 🎨

### Color Scheme (from onboarding page)
- Primary: `blue-600`, `blue-700`
- Success: `green-600`, `green-50`
- Warning: `yellow-600`, `yellow-50`
- Error: `red-600`, `red-50`
- Neutral: `gray-50`, `gray-500`, `gray-900`

### Layout Pattern
```tsx
<div className="min-h-screen bg-gray-50">
  <nav className="bg-white shadow-sm border-b">
    {/* Navigation */}
  </nav>
  
  <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</div>
```

### Component Pattern (from EbayOAuth)
- Use `Card` wrapper with manual header/content divs
- Use `Button` from ui-kit
- Use lucide-react icons
- Tailwind utility classes for spacing

---

## 5. API Integration Strategy 🔌

### Environment Variable
Add to `frontends/app/env.production`:
```bash
NEXT_PUBLIC_EBAY_SERVICE_URL=https://delightful-liberation-production.up.railway.app
```

### Fetch Pattern
```tsx
const ebayServiceUrl = process.env.NEXT_PUBLIC_EBAY_SERVICE_URL;

const response = await fetch(`${ebayServiceUrl}/purchases?limit=10`, {
  credentials: 'include', // Important for session cookies
  headers: {
    'Accept': 'application/json'
  }
});

const data = await response.json();
```

---

## 6. Navigation Integration 🧭

Update `frontends/app/src/app/page.tsx` to include eBay link:

```tsx
<li>
  <Link href="/ebay" className="nav-link">
    eBay Purchases
  </Link>
</li>
```

---

## 7. Features to Implement ✨

### Phase 1: Basic Display
- ✅ Purchases list table
- ✅ Purchase detail page
- ✅ Basic stats (total purchases, total spent)
- ✅ Loading states

### Phase 2: Filtering & Search
- ✅ Date range filter (7/30/90 days, All)
- ✅ Status filter
- ✅ Search by title/seller
- ✅ Sort by date/price

### Phase 3: Sync Features
- ✅ Manual sync button
- ✅ Sync progress indicator
- ✅ Last sync timestamp
- ✅ Toast notifications

### Phase 4: Advanced Features
- ✅ Tracking link integration
- ✅ Seller eBay profile link
- ✅ Export to CSV
- ✅ Pagination

---

## 8. Key Decisions 🎯

### Should this be a separate page or integrated?
**Answer**: Separate section under `/ebay` route
- Matches existing pattern (`/users/onboarding`)
- Allows for future expansion (analytics, seller insights)
- Cleaner navigation structure

### Authentication Handling
- Already handled by eBay service OAuth (existing `EbayOAuth` component)
- Check connection status on page load
- Redirect to OAuth if not connected

---

## 9. Implementation Order 📝

1. ✅ Create basic page structure (`/ebay/page.tsx`)
2. ✅ Build `EbayPurchasesList` component
3. ✅ Add API integration with fetch
4. ✅ Implement filtering & search
5. ✅ Add purchase detail view (`/ebay/purchase/[id]`)
6. ✅ Build sync controls
7. ✅ Add stats dashboard
8. ✅ Update navigation
9. ✅ Add loading/error states
10. ✅ Test and polish

---

## 10. No Backend Changes Required ✅

- Backend API is already complete and working
- Frontend will consume existing endpoints
- OAuth integration already exists in `EbayOAuth.tsx`
- Session handling already configured in eBay service

---

**Ready to build!** 🚀



