# Client-Side Link Fallback System

## Overview

This system provides **instant fallback for dead links** without user-facing delays. It combines:

1. **Client-side caching** - Stores link status locally (IndexedDB/localStorage)
2. **Background validation** - Checks links asynchronously with 2-second timeout
3. **Server-side replacements** - Serves pre-calculated replacements from API cache
4. **Zero-delay UX** - Decisions made instantly from cache, validation in background

## Architecture

```
User clicks link
    ↓
[Client-side cache check] ← Fast (0ms)
    ├─ FOUND: Use cached result (alive/dead)
    └─ NOT FOUND: Start background check
    ↓
[If dead, check server replacement] ← Fast (< 100ms from cache)
    ├─ FOUND: Use replacement link
    └─ NOT FOUND: Use primary link with warning
    ↓
[Link serves to user]
```

## Files Added

### 1. `lib/client-link-cache.ts`
Local cache management for link status
- **`initLinkCache()`** - Initialize cache from localStorage on app start
- **`quickCheckLink(url)`** - Instant cache lookup + background validation
- **`prefetchLinks(urls)`** - Preload multiple links
- **`setLinkStatus(status)`** - Manually set status (from server updates)
- **`getCachedLinkStatus(url)`** - Get cached status without triggering validation

### 2. `lib/useLink.ts`
React hooks for components
- **`useLinkHealth(url, options)`** - Check link health, return smart URL
  - Returns: `{ urlToUse, status, isAlive, isDead }`
  - Automatically uses replacement if dead
  - Triggers background check
  
- **`useLinkWithFallback(primary, fallback)`** - Monitor and switch URLs
  
- **`usePrefetchLinks(urls)`** - Preload links on component mount

### 3. `app/api/products/replacement/route.ts`
API endpoint for replacement lookup
- **GET** `/api/products/replacement?asin=<ASIN>`
- Returns: `{ replacementUrl, replacementName, source }`
- Fast because it uses KV cache + dead-links.json

### 4. `components/SmartLink.tsx`
Reusable components for safe links
- **`<SmartLink />`** - Drop-in `<a>` tag replacement
- **`<SmartLinkButton />`** - Button-style link component
- Shows visual status indicator (optional)
- Handles dead link warnings

### 5. Updated: `components/ProductRecommendation.tsx`
Now uses smart link handling
- Initializes cache on mount
- Prefetches link status
- Uses replacement if available
- Tracks link status in analytics

## Usage Examples

### In React Components

```tsx
import { useLinkHealth, usePrefetchLinks } from "@/lib/useLink";

export function MyComponent() {
  // Single link with fallback
  const { urlToUse, isDead } = useLinkHealth(primaryUrl, {
    replacementUrl: secondaryUrl,
  });

  // Multiple links
  usePrefetchLinks([url1, url2, url3]);

  return (
    <a href={urlToUse} target="_blank">
      {isDead ? "Alternative Link" : "Main Link"}
    </a>
  );
}
```

### With SmartLink Component

```tsx
import SmartLink from "@/components/SmartLink";

export function ProductCard() {
  return (
    <SmartLink 
      href={amazonLink}
      fallbackHref={searchResultsLink}
      asin="B07NY4FYYQ"
      showStatus={true}
    >
      View Product
    </SmartLink>
  );
}
```

### Manual Link Caching

```tsx
import { 
  initLinkCache, 
  setLinkStatus, 
  getCachedLinkStatus 
} from "@/lib/client-link-cache";

// On app start
useEffect(() => {
  initLinkCache(); // Load from localStorage
}, []);

// After checking link status from server
useEffect(() => {
  fetch(`/api/products/replacement?asin=${asin}`)
    .then(r => r.json())
    .then(data => {
      // Update client cache with server result
      setLinkStatus({
        url: data.originalUrl,
        status: data.status,
        lastChecked: Date.now(),
      });
    });
}, [asin]);
```

## How It Works: Step by Step

### When User Hovers or Clicks Link

1. **`useLinkHealth()` hook runs**
   - Checks if URL is in memory cache
   - If cached, return that result instantly
   - If not cached, trigger background check

2. **Background check (non-blocking)**
   - HEAD request to the URL (2-second timeout)
   - Result cached in memory + localStorage
   - Component updates with new status (but link still works with primary URL)

3. **If link is dead**
   - Check server replacement API (`/api/products/replacement`)
   - If replacement found, swap to it
   - If no replacement, show warning but keep trying primary

4. **User clicks link**
   - If `urlToUse` is loaded, navigate to it
   - If still checking, use primary URL and warn if dead
   - Analytics track link status for monitoring

### Server-Side Replacement Flow

1. **Weekly cron job** validates all links
2. **Results cached in KV** with 24-hour TTL
3. **API endpoint** returns cached result instantly
4. **Client stores replacement** in local cache for 7 days

## Performance Characteristics

| Operation | Time | Blocking? |
|-----------|------|-----------|
| Cache lookup | 0-1ms | No |
| Background link check | ~1000ms | No |
| Server replacement API | 10-50ms | No |
| Total UX delay | 0ms | ✅ Non-blocking |

## Features

✅ **Zero-delay UX** - Decisions made from cache instantly
✅ **Automatic fallbacks** - Replaces dead links transparently  
✅ **Background validation** - Checks don't block user interaction
✅ **Persistent cache** - localStorage survives page reloads
✅ **Server sync** - Cron job updates cache weekly
✅ **Analytics tracking** - Monitor link status and replacements
✅ **Customizable** - Easy to add to any link in the app
✅ **Graceful fallback** - Warns user only when necessary

## Integration Checklist

- [x] `client-link-cache.ts` - Local storage management
- [x] `useLink.ts` - React hooks
- [x] `app/api/products/replacement/route.ts` - Server API
- [x] `components/SmartLink.tsx` - Reusable components
- [x] `ProductRecommendation.tsx` - Updated to use smart links
- [ ] Update other components with links (ProductShowcase, etc)
- [ ] Add analytics dashboard to monitor replacements
- [ ] Test with actual dead links

## Next Steps

1. **Update remaining link components** to use `useLinkHealth` hook
2. **Create dashboard** to visualize dead links and replacements
3. **Add webhook** from Amazon to detect price changes/deletions
4. **Implement analytics** for replacement effectiveness
5. **Monitor** link status trends in analytics

## Testing

```bash
# Build and verify no errors
npm run build

# Test in development
npm run dev

# Check Network tab in DevTools:
# 1. Links should load immediately (no delay)
# 2. Background HEAD requests should appear after
# 3. localStorage should contain link cache
```

## Cache Structure

**localStorage key:** `link-status-cache`

```json
{
  "https://www.amazon.com/dp/B07NY4FYYQ": {
    "url": "https://www.amazon.com/dp/B07NY4FYYQ",
    "status": "alive",
    "lastChecked": 1708956000000
  },
  "https://www.amazon.com/dp/DEADASIN123": {
    "url": "https://www.amazon.com/dp/DEADASIN123",
    "status": "dead",
    "lastChecked": 1708956000000
  }
}
```

**Cache TTL:** 7 days (expires old entries)
