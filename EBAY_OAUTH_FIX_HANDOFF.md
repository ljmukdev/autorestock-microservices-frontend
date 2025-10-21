# eBay OAuth 404 Redirect Issue - Fix Handoff

## 🚨 **CRITICAL ISSUE**
The eBay OAuth integration is still causing 404 errors when redirecting back from eBay service to the frontend onboarding page.

## 📍 **Current Problem**
- User clicks "Connect eBay Account" 
- Redirects to eBay service OAuth (`delightful-liberation-production.up.railway.app/oauth/login`)
- eBay OAuth completes successfully
- **BUT** redirects back to `/users/undefined` causing 404 error
- Should redirect to `/users/onboarding` instead

## 🔧 **What We've Tried**
1. ✅ Updated frontend to pass `redirect_uri` parameter to eBay service
2. ✅ Modified eBay service to store redirect URI in session
3. ✅ Updated eBay service callback to redirect back to frontend
4. ✅ Added express-session support to eBay service
5. ✅ Frontend handles OAuth success/error parameters

## 📂 **Key Files Modified**

### Frontend (Next.js App)
- `frontends/app/packages/ui-user/src/components/EbayOAuth.tsx`
- Passes redirect URI: `?redirect_uri=${encodeURIComponent(window.location.origin + '/users/onboarding')}`

### eBay Service (Microservice)
- `microservices/ebay-service/controllers/authController.js`
- `microservices/ebay-service/index.js` (added express-session)
- `microservices/ebay-service/package.json` (added express-session dependency)

## 🎯 **Root Cause Analysis**
The issue appears to be that the eBay service is not properly handling the redirect URI parameter or the session is not persisting the redirect URI correctly.

## 🔍 **Debugging Steps Needed**
1. **Check eBay service logs** - Is the redirect_uri parameter being received?
2. **Verify session storage** - Is the redirect URI being stored in session?
3. **Test OAuth flow** - Does the callback have access to the stored redirect URI?
4. **Check eBay Dev Portal** - Is the redirect URI configured correctly in eBay's OAuth settings?

## 🛠 **Potential Fixes to Try**

### Option 1: Debug Session Storage
```javascript
// In authController.js, add logging:
console.log('Received redirect_uri:', req.query.redirect_uri);
console.log('Session data:', req.session);
```

### Option 2: Use URL Parameter Instead of Session
```javascript
// Pass redirect URI through eBay OAuth state parameter
const state = JSON.stringify({ redirectUri: redirectUri });
// Then parse it back in callback
```

### Option 3: Hardcode Redirect URI
```javascript
// Temporarily hardcode the redirect URI in callback
const redirectUri = 'https://autorestock-microservices-frontend-production.up.railway.app/users/onboarding';
```

### Option 4: Check eBay OAuth Configuration
- Verify eBay Dev Portal has correct redirect URI configured
- Ensure eBay service environment variables are set correctly

## 🚀 **Service URLs**
- **Frontend**: `https://autorestock-microservices-frontend-production.up.railway.app`
- **eBay Service**: `https://delightful-liberation-production.up.railway.app`
- **Expected Redirect**: `/users/onboarding`

## 📋 **Testing Checklist**
- [ ] Check eBay service logs for redirect_uri parameter
- [ ] Verify session is storing redirect URI correctly
- [ ] Test OAuth flow end-to-end
- [ ] Confirm eBay Dev Portal redirect URI configuration
- [ ] Check if CORS is blocking the redirect

## 🎯 **Expected Outcome**
After successful eBay OAuth:
1. User should be redirected back to `/users/onboarding` (not `/users/undefined`)
2. Frontend should show "eBay account connected" status
3. OAuth success should be handled properly
4. No 404 errors should occur

## 🔗 **Related Files**
- `frontends/app/packages/ui-user/src/components/EbayOAuth.tsx`
- `microservices/ebay-service/controllers/authController.js`
- `microservices/ebay-service/index.js`
- `microservices/ebay-service/utils/ebayClient.js`

## 💡 **Next Steps**
1. Debug the eBay service to see if redirect_uri is being received
2. Check session storage and persistence
3. Verify eBay OAuth configuration
4. Test the complete OAuth flow
5. Fix the redirect URI handling

This is a critical issue blocking the onboarding flow. The eBay OAuth integration must work properly for users to complete the setup process.


