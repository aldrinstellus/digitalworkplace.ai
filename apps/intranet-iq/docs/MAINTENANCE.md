# dIQ - Maintenance Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-29
**Applies To**: Intranet IQ (dIQ) Application
**Status**: ACTIVE

---

## Overview

This document outlines maintenance procedures, health checks, and operational tasks for the Intranet IQ (dIQ) application.

---

## 1. Daily Maintenance Tasks

### Health Checks

Run these checks daily:

```bash
# 1. Check application status
curl -s http://localhost:3001/diq/api/admin/health | jq

# 2. Check Elasticsearch cluster
curl -s http://localhost:9200/_cluster/health | jq '.status'

# 3. Check Supabase connection
curl -s http://localhost:3001/diq/api/admin/stats | jq '.database'

# 4. Check API response times
time curl -s http://localhost:3001/diq/api/dashboard > /dev/null
```

### Expected Results

| Check | Expected | Action if Failed |
|-------|----------|------------------|
| Application | HTTP 200 | Restart server |
| Elasticsearch | "green" or "yellow" | Check node status |
| Supabase | connected: true | Check credentials |
| Response Time | < 500ms | Check queries |

---

## 2. Weekly Maintenance Tasks

### Database Maintenance

```bash
# 1. Check database size
curl -s http://localhost:3001/diq/api/admin/stats | jq '.database.size'

# 2. Analyze slow queries (run in Supabase SQL editor)
SELECT
  calls,
  mean_time,
  query
FROM pg_stat_statements
WHERE dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
ORDER BY mean_time DESC
LIMIT 10;

# 3. Update table statistics
ANALYZE diq.articles;
ANALYZE diq.employees;
ANALYZE diq.kb_categories;
```

### Elasticsearch Maintenance

```bash
# 1. Check index sizes
curl -s http://localhost:9200/_cat/indices?v | grep diq

# 2. Force merge (run during low traffic)
curl -X POST http://localhost:9200/diq_articles/_forcemerge?max_num_segments=1

# 3. Clear caches if memory high
curl -X POST http://localhost:9200/_cache/clear
```

### Content Audit

```bash
# 1. Check for orphaned articles (no category)
curl -s "http://localhost:3001/diq/api/content?status=all" | \
  jq '[.articles[] | select(.category_id == null)] | length'

# 2. Check for draft articles older than 30 days
curl -s "http://localhost:3001/diq/api/content?status=draft" | \
  jq '[.articles[] | select(.created_at < (now - 2592000 | todate))] | length'

# 3. Check embedding coverage
curl -s http://localhost:3001/diq/api/admin/stats | jq '.embeddings.coverage'
```

---

## 3. Monthly Maintenance Tasks

### Performance Audit

Run full performance audit:

```bash
# 1. Run API performance tests
cd /Users/aldrin-mac-mini/digitalworkplace.ai/apps/intranet-iq

# Dashboard API
time curl -s http://localhost:3001/diq/api/dashboard > /dev/null
# Target: < 200ms

# Content API
time curl -s "http://localhost:3001/diq/api/content?limit=50" > /dev/null
# Target: < 300ms

# People API
time curl -s http://localhost:3001/diq/api/people > /dev/null
# Target: < 200ms

# Search API
time curl -s -X POST http://localhost:3001/diq/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "vacation policy"}' > /dev/null
# Target: < 500ms
```

### Security Audit

```bash
# 1. Check for unused API keys
# Review .env.local for any keys that should be rotated

# 2. Review RBAC permissions
curl -s http://localhost:3001/diq/api/admin/permissions | jq '.roles'

# 3. Check audit logs for suspicious activity
curl -s "http://localhost:3001/diq/api/admin/audit?days=30" | \
  jq '[.logs[] | select(.action == "permission_change" or .action == "role_change")]'
```

### Embedding Re-indexing

Re-index embeddings monthly or after major content changes:

```bash
# 1. Trigger re-indexing
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -H "Content-Type: application/json" \
  -d '{"action": "reindex", "type": "all"}'

# 2. Monitor progress
curl -s http://localhost:3001/diq/api/elasticsearch/index | jq '.status'

# 3. Verify completion
curl -s http://localhost:3001/diq/api/admin/stats | jq '.elasticsearch'
```

---

## 4. Deployment Procedures

### Pre-Deployment Checklist

- [ ] Run ESLint: `npm run lint`
- [ ] Run TypeScript check: `npm run type-check`
- [ ] Run build: `npm run build`
- [ ] Test locally: `npm run dev`
- [ ] Check all API endpoints respond

### Deployment Commands

```bash
# From monorepo root
cd /Users/aldrin-mac-mini/digitalworkplace.ai

# 1. Build dIQ
npm run build:intranet

# 2. Deploy to Vercel
cd apps/intranet-iq && vercel --prod --yes

# 3. Verify deployment
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/dashboard
# Expected: 200
```

### Post-Deployment Verification

```bash
# 1. Check production health
curl -s https://intranet-iq.vercel.app/diq/api/admin/health

# 2. Test key pages
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/dashboard  # 200
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/search     # 200
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/chat       # 200
curl -s -o /dev/null -w "%{http_code}" https://intranet-iq.vercel.app/diq/content    # 200

# 3. Test search functionality
curl -s -X POST https://intranet-iq.vercel.app/diq/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}' | jq '.results | length'
```

### Rollback Procedure

```bash
# If issues found, rollback to previous deployment
vercel rollback --yes

# Verify rollback
curl -s https://intranet-iq.vercel.app/diq/api/admin/health
```

---

## 5. Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| API Response Time | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| Elasticsearch Health | yellow | red |
| Database Connections | > 80% pool | > 95% pool |
| Memory Usage | > 80% | > 95% |

### Log Locations

```
# Application logs (Vercel)
vercel logs intranet-iq --follow

# Elasticsearch logs
docker logs elasticsearch-node1 --follow

# Local development logs
npm run dev  # Logs to stdout
```

### Alert Configuration

Set up alerts for:
1. API endpoint failures (5xx errors)
2. Elasticsearch cluster status changes
3. High response times (> 2s)
4. Authentication failures
5. Rate limit breaches

---

## 6. Backup & Recovery

### Data Backup

```bash
# 1. Export Supabase data (run weekly)
# Use Supabase dashboard: Project Settings > Database > Backups

# 2. Export Elasticsearch indices
curl -X POST "http://localhost:9200/_snapshot/diq_backup/snapshot_$(date +%Y%m%d)"

# 3. Backup environment variables
cp .env.local .env.local.backup.$(date +%Y%m%d)
```

### Recovery Procedures

```bash
# Restore from Supabase backup
# Use Supabase dashboard: Project Settings > Database > Restore

# Restore Elasticsearch index
curl -X POST "http://localhost:9200/_snapshot/diq_backup/snapshot_YYYYMMDD/_restore"

# Re-index all content after restore
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -d '{"action": "reindex", "type": "all"}'
```

---

## 7. Troubleshooting Guide

### Common Issues

#### Search Not Returning Results

```bash
# 1. Check Elasticsearch status
curl http://localhost:9200/_cluster/health

# 2. Check index document count
curl http://localhost:9200/diq_articles/_count

# 3. Re-index if needed
curl -X POST http://localhost:3001/diq/api/elasticsearch/index \
  -d '{"action": "reindex", "type": "articles"}'
```

#### AI Assistant Not Responding

```bash
# 1. Check Anthropic API key
echo $ANTHROPIC_API_KEY | head -c 10

# 2. Test API directly
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-sonnet-4-20250514", "max_tokens": 10, "messages": [{"role": "user", "content": "Hello"}]}'

# 3. Check chat API logs
vercel logs intranet-iq --filter="/api/chat"
```

#### Slow Page Loads

```bash
# 1. Check React Query cache status
# Open browser DevTools > Application > Session Storage > tanstack-query

# 2. Check API response times
curl -w "%{time_total}s\n" -o /dev/null -s http://localhost:3001/diq/api/dashboard

# 3. Check for N+1 queries in logs
# Look for multiple sequential database calls

# 4. Verify parallel query optimization
# Dashboard API should use Promise.all()
```

#### Authentication Issues

```bash
# 1. Check Clerk status
# Visit https://status.clerk.com

# 2. Verify Clerk keys
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | head -c 20
echo $CLERK_SECRET_KEY | head -c 10

# 3. Clear auth cookies and retry
# Browser: DevTools > Application > Cookies > Clear
```

---

## 8. Scheduled Tasks

### Cron Jobs (Production)

| Task | Schedule | Command |
|------|----------|---------|
| Health Check | Every 5 min | `curl /api/admin/health` |
| Index Refresh | Daily 2 AM | Re-index Elasticsearch |
| Backup | Weekly Sun 3 AM | Supabase backup |
| Audit Log Cleanup | Monthly 1st | Delete logs > 90 days |

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/health",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/index-refresh",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 9. Environment Variables

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Provider
ANTHROPIC_API_KEY=

# Elasticsearch (optional - for advanced search)
ELASTICSEARCH_URL=
ELASTICSEARCH_API_KEY=

# OpenAI (for embeddings)
OPENAI_API_KEY=
```

### Variable Rotation Schedule

| Variable | Rotation Frequency | Last Rotated |
|----------|-------------------|--------------|
| CLERK_SECRET_KEY | Annually | 2026-01-01 |
| ANTHROPIC_API_KEY | Annually | 2026-01-01 |
| OPENAI_API_KEY | Annually | 2026-01-01 |
| ELASTICSEARCH_API_KEY | Annually | 2026-01-01 |

---

## 10. Documentation Updates

### When to Update Docs

Update these files when:

| File | Update When |
|------|-------------|
| `CLAUDE.md` | Project structure changes, new features |
| `SAVEPOINT.md` | End of each session, major milestones |
| `CHANGELOG.md` | New version released |
| `context.md` | Design system changes |
| `docs/MAINTENANCE.md` | New maintenance procedures |
| `docs/QUERY_DETECTION_STANDARDS.md` | Search algorithm changes |

### Documentation Checklist

After major changes:
- [ ] Update CLAUDE.md with new file locations
- [ ] Update SAVEPOINT.md with current state
- [ ] Add entry to CHANGELOG.md
- [ ] Update context.md if UI changed
- [ ] Update this file if procedures changed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-29 | Initial release |

---

**Related Documents**:
- `/apps/intranet-iq/CLAUDE.md` - Project instructions
- `/apps/intranet-iq/SAVEPOINT.md` - Session state
- `/apps/intranet-iq/CHANGELOG.md` - Version history
- `/apps/intranet-iq/docs/QUERY_DETECTION_STANDARDS.md` - Search standards
- `/docs/QUERY_DETECTION_STANDARDS.md` - Global standards

**Maintained by**: Digital Workplace AI Team
