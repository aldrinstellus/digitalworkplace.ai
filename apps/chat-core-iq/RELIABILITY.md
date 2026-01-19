# City of Doral - Reliability Guide

## Auto-Restart Feature

The `start.sh` script now includes **automatic server restart** capability:

### How It Works
- Monitors both servers every 30 seconds
- Auto-restarts if a server dies (up to 10 attempts)
- Health checks via HTTP to detect stuck ports
- Logs all restart events with timestamps

### Restart Limits
- **Max restarts per server**: 10
- After 10 failed restarts, manual intervention required

---

## Health Check API

**Endpoint**: `GET http://localhost:3000/api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-04T12:52:54.990Z",
  "services": {
    "nextjs": true,
    "knowledgeBase": true,
    "faqData": true
  },
  "uptime": 6149.63
}
```

**Status Codes**:
- `200` - All services healthy
- `503` - Degraded (some services down)

---

## Quick Recovery Commands

### If homepage (port 8888) is down:
```bash
cd "/Users/aldrin-mac-mini/cityofdoral/Website Scrapped"
python3 -m http.server 8888 &
open http://localhost:8888/Home/index.html
```

### If Next.js (port 3000) is down:
```bash
cd /Users/aldrin-mac-mini/cityofdoral
npm run dev &
```

### Kill stuck processes:
```bash
lsof -ti:8888 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Full restart:
```bash
./start.sh
```

---

## API Endpoints Status

| Endpoint | Purpose | CORS |
|----------|---------|------|
| `/api/health` | Health check | No |
| `/api/settings` | Widget settings | Yes |
| `/api/chat` | AI chatbot | Yes |
| `/api/knowledge` | Knowledge search | Yes |
| `/api/faqs` | FAQ data | Yes |

---

## Known Console Errors (Non-Critical)

These 404 errors are **expected** and don't affect functionality:

1. **External CDN resources** (googleapis, monsido, etc.)
   - Cause: Scraped site references external resources
   - Impact: None on chatbot/FAQ functionality

2. **jQuery not defined**
   - Cause: CDN jQuery not loading
   - Impact: Some original site features may not work
   - Our widgets use vanilla JS and work fine

---

## Monitoring Logs

| Log File | Purpose |
|----------|---------|
| `/tmp/nextjs-cityofdoral.log` | Next.js server logs |
| `/tmp/static-cityofdoral.log` | Static server logs |

### View live logs:
```bash
tail -f /tmp/nextjs-cityofdoral.log
tail -f /tmp/static-cityofdoral.log
```

---

## Reliability Checklist

Before deployment, verify:

- [ ] `./start.sh` runs without errors
- [ ] http://localhost:8888/Home/index.html loads
- [ ] http://localhost:3000/admin loads
- [ ] Chat widget opens and responds
- [ ] FAQ accordion expands
- [ ] `/api/health` returns healthy
- [ ] No CORS errors in console

---

## Emergency Contacts

If servers fail repeatedly, check:

1. **Port conflicts**: `lsof -i :3000 -i :8888`
2. **Disk space**: `df -h`
3. **Memory**: `top -l 1 | head -10`
4. **Node version**: `node --version` (should be 18+)
5. **Python version**: `python3 --version` (should be 3.x)

---

*Last Updated: 2026-01-04*
