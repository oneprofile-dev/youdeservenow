# Amazon Dead Links Strategy & Implementation

## Problem Statement

**Current Situation (April 21, 2026):**
- 54 of 76 product links are dead (71% failure rate)
- Lost affiliate revenue on majority of recommendations
- Poor user experience with broken links
- Negative SEO impact

## Solution Overview

A **multi-layered approach** to automatically validate, monitor, and replace dead Amazon affiliate links.

### Architecture

```
Weekly Cron Job → Link Validation → Dead Link Detection
                ↓
        Replacement Engine
                ↓
        KV Store Cache
                ↓
    Product Recommendation API
                ↓
        User sees live link
```

## Implementation Files

### 1. Link Health System (`lib/link-health.ts`)
- **`validateAmazonLink()`** - Check if ASIN is alive (with caching)
- **`validateMultipleLinks()`** - Batch validate with concurrency control
- **`findReplacementCandidate()`** - Find best match using metadata
- **`logLinkReplacement()`** - Track replacement events
- **`getLinkHealthStats()`** - Retrieve health statistics

### 2. Cron Job (`app/api/cron/check-links/route.ts`)
- Runs weekly (Monday 2 AM UTC)
- Validates all 76 product links
- Identifies dead links and finds replacements
- Updates KV store with results
- Sends optional Slack notification

**Configuration (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/check-links",
      "schedule": "0 2 * * 1"
    }
  ]
}
```

### 3. Products Library Enhancement (`lib/products-with-fallback.ts`)
- **`getProductByAsin()`** - Auto-fallback to replacement
- **`getProductsByCategory()`** - Filter out dead links
- **`getProductByAsinCached()`** - Memory + KV caching
- **`isProductAvailable()`** - Check if link is live

## Key Features

### ✓ Automatic Validation
- HEAD requests with 3-retry exponential backoff
- 24-hour cache to minimize API calls
- Graceful timeout handling (5 seconds)

### ✓ Smart Replacement Logic
- Matches by category (40%)
- Keyword/name similarity (40%)
- Price proximity (20%)
- Requires 50+ points confidence score

### ✓ Persistent Caching
- KV store for replacement map
- 7-day TTL to balance freshness and performance
- Memory cache for hot items

### ✓ Monitoring & Logging
- Track all replacements with timestamps
- Log data source and confidence score
- Health statistics dashboard
- Optional Slack notifications

### ✓ Zero Infrastructure
- Uses Vercel's built-in cron jobs
- No additional servers or dependencies
- Leverages existing KV store
- Scales automatically

## Integration Steps

### Step 1: Enable Vercel Cron (1 hour)
```bash
# Update vercel.json
vercel env pull
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-links",
      "schedule": "0 2 * * 1"
    }
  ]
}
```

### Step 2: Deploy (5 minutes)
```bash
git add .
git commit -m "Add link health monitoring system"
git push origin main
vercel deploy --prod
```

### Step 3: Test Manually (10 minutes)
```bash
# Test the endpoint
curl -X POST https://youdeservenow.com/api/cron/check-links \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Step 4: Monitor Results (ongoing)
```bash
# Check link health status
curl https://youdeservenow.com/api/cron/check-links
```

## Performance Targets

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Dead Links | 54 (71%) | <15 (20%) | 30 days |
| Auto-Replacements | 0 | >80% of dead | 30 days |
| Response Time (product lookup) | N/A | <10ms (cached) | 7 days |
| Cron Job Duration | N/A | <30s | ongoing |
| User-Facing Broken Links | High | <2% | 30 days |

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Vercel Cron | Free | Included with Pro plan |
| KV Store | Free (existing) | 250 commands/day free |
| Bandwidth | Free | Same as existing |
| **Total** | **$0** | No additional costs |

## Future Enhancements

### Phase 2: Advanced Matching
- Use Gemini API to match product descriptions
- ML-based confidence scoring
- Category-specific matching rules

### Phase 3: Dynamic Recommendations
- Real-time Amazon search for best matches
- Price comparison integration
- Trending products overlay

### Phase 4: Admin Dashboard
- Dead link management UI
- Replacement approval workflow
- Manual override capability
- A/B testing of replacements

## Monitoring & Alerts

### KV Keys
- `link-health:stats` - Current health statistics
- `dead-links:current` - Array of dead ASINs
- `link-replacements:map` - Dead → Replacement mapping
- `link-replacements:YYYY-MM-DD` - Daily replacement log

### Slack Integration (Optional)
Set environment variable:
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Cron job will send weekly reports with:
- Number of alive/dead links
- Replacements found
- Confidence scores
- Trending issues

## Troubleshooting

### Links Still Showing as Dead
- Check if cron job is running: `GET /api/cron/check-links`
- Verify KV store has data: `redis-cli get dead-links:current`
- Check replacement map: `redis-cli get link-replacements:map`

### Cron Not Running
- Verify `vercel.json` configuration
- Check Vercel deployment logs
- Ensure `CRON_SECRET` is set in environment

### Poor Replacement Matches
- Lower confidence threshold in `findReplacementCandidate()`
- Add category-specific rules
- Review matched products manually

## Security

- Cron endpoint protected with Bearer token
- No sensitive data in logs
- Cache doesn't expose ASIN mappings
- Safe fallback to original if replacement fails

## Next Steps

1. ✅ Review this strategy document
2. ⬜ Deploy link health system (this week)
3. ⬜ Monitor for 7 days
4. ⬜ Adjust confidence thresholds based on results
5. ⬜ Add admin dashboard (next sprint)

---

**Created:** April 21, 2026
**Status:** Ready for implementation
**Effort:** ~4 hours for full integration
