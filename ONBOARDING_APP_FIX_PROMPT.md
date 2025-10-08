# Fix Next.js Onboarding App Build Errors

## Problem
The Next.js onboarding app at `frontends/app/` is failing to build with TypeScript errors. Components are using `CardHeader`, `CardTitle`, `CardContent` as JSX elements, but these don't exist in our `@autorestock/ui-kit` package.

## What Exists
Our `@autorestock/ui-kit` package ONLY exports:
- `Card` - a simple card wrapper component
- `Button`
- `Input`
- `Alert`
- `Loading`
- `Toast`
- Layout components (`Container`, `Flex`, `Grid`, `Stack`)

**Note:** There is NO `CardHeader`, `CardTitle`, `CardContent`, or `Progress` component.

## What Needs to be Fixed
The following component files in `frontends/app/packages/ui-user/src/components/` are using these non-existent components as JSX elements:

1. **CsvImport.tsx** - Lines 125-131, 266
2. **EbayOAuth.tsx** - Uses CardHeader, CardTitle, CardContent
3. **EmailSetup.tsx** - Uses CardHeader, CardTitle, CardContent
4. **MarketplaceEmailConnection.tsx** - Uses CardHeader, CardTitle, CardContent
5. **UserRegistration.tsx** - Uses CardHeader, CardTitle, CardContent
6. **OnboardingWizard.tsx** - Already partially fixed

## Solution Required
Replace all JSX usage of `<CardHeader>`, `<CardTitle>`, and `<CardContent>` with simple `<div>` elements with appropriate Tailwind CSS classes.

### Pattern to Replace:
```tsx
<Card className="...">
  <CardHeader>
    <CardTitle className="...">
      Title content
    </CardTitle>
  </CardHeader>
  <CardContent className="...">
    Main content
  </CardContent>
</Card>
```

### Replace With:
```tsx
<Card className="...">
  <div className="p-6 border-b">
    <div className="...">
      Title content
    </div>
  </div>
  <div className="p-6">
    Main content
  </div>
</Card>
```

## Files to Fix

### 1. frontends/app/packages/ui-user/src/components/CsvImport.tsx
- Lines 125-131: Replace CardHeader/CardTitle wrapper
- Line 131-266: Replace CardContent wrapper
- Keep all the inner content exactly as is

### 2. frontends/app/packages/ui-user/src/components/EbayOAuth.tsx
- Find and replace all CardHeader/CardTitle/CardContent usage
- Maintain all className attributes and content

### 3. frontends/app/packages/ui-user/src/components/EmailSetup.tsx
- Find and replace all CardHeader/CardTitle/CardContent usage
- Maintain all className attributes and content

### 4. frontends/app/packages/ui-user/src/components/MarketplaceEmailConnection.tsx
- Find and replace all CardHeader/CardTitle/CardContent usage
- Maintain all className attributes and content

### 5. frontends/app/packages/ui-user/src/components/UserRegistration.tsx
- Find and replace all CardHeader/CardTitle/CardContent usage
- Maintain all className attributes and content

## Important Notes
1. **Do NOT remove** any of the inner content or logic
2. **Keep all className attributes** - just move them to the div elements
3. **Preserve all other props** and event handlers
4. The `Card` component itself is fine - only the sub-components need replacing
5. After fixing, the app should build with `pnpm build`

## Current Build Error Example
```
./packages/ui-user/src/components/CsvImport.tsx:125:8
Type error: Cannot find name 'CardHeader'.

  123 |   return (
  124 |     <Card className="w-full max-w-2xl mx-auto">
> 125 |       <CardHeader>
      |        ^
  126 |         <CardTitle className="flex items-center space-x-2">
```

## Directory Structure
```
frontends/app/
├── packages/
│   ├── ui-kit/          (has Card, Button, Input, etc.)
│   └── ui-user/         (has the broken components)
│       └── src/
│           └── components/
│               ├── CsvImport.tsx          ❌ NEEDS FIX
│               ├── EbayOAuth.tsx          ❌ NEEDS FIX
│               ├── EmailSetup.tsx         ❌ NEEDS FIX
│               ├── MarketplaceEmailConnection.tsx  ❌ NEEDS FIX
│               ├── UserRegistration.tsx   ❌ NEEDS FIX
│               └── OnboardingWizard.tsx   ✅ PARTIALLY FIXED
```

## Success Criteria
After the fixes:
1. `pnpm build` should complete successfully in `frontends/app/`
2. No TypeScript errors about missing Card sub-components
3. All component functionality preserved
4. UI should look the same (using Tailwind classes for styling)

## Please Provide
For each file, provide the complete corrected version with all CardHeader/CardTitle/CardContent replaced with appropriate div elements.

