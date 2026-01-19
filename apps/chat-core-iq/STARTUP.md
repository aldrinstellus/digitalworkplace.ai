# CITY OF DORAL - STARTUP GUIDE

## PRIMARY URL
```
http://localhost:8888/Home/index.html
```

---

## HOW TO START (Choose One)

### Quick Start (Recommended)
```bash
./start.sh
```

### Alternative
```bash
npm run start-all
```

---

## WHAT IT DOES

The `start.sh` script:
1. Kills any processes using ports 3000 and 8888
2. Starts Next.js backend on port 3000 (chat API)
3. Starts static site server on port 8888 (website)
4. Opens browser to http://localhost:8888/Home/index.html
5. Monitors both servers and shows status

---

## IMPORTANT PORTS

| Port | Service | URL |
|------|---------|-----|
| **8888** | Website with Chatbot | http://localhost:8888/Home/index.html |
| 3000 | Chat API & Admin | http://localhost:3000/admin |

---

## IF SOMETHING BREAKS

### Kill stuck processes:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8888 | xargs kill -9
```

### View logs:
```bash
cat /tmp/nextjs-cityofdoral.log
cat /tmp/static-cityofdoral.log
```

### Restore from savepoint:
```bash
cp savepoints/20260103_primary_entry_point/start.sh ./start.sh
chmod +x start.sh
./start.sh
```

---

## REMEMBER

- **Port 8888** = Main website (what users see)
- **Port 3000** = Backend API (chatbot needs this)
- **Both must run** for chatbot to work
- **start.sh handles everything** - just run it!
