# Redis-Only Installation Guide

## ✅ What You Need

**Only 1 dependency:** Redis

## Installation Options

### Option 1: Windows Redis (Easiest)

1. **Download Redis for Windows:**
   - Visit: https://github.com/tporadowski/redis/releases
   - Download: `Redis-x64-5.0.14.1.zip`
   - Extract to: `C:\Redis`

2. **Start Redis:**
   ```powershell
   cd C:\Redis
   .\redis-server.exe
   ```
   
   Keep this window open!

### Option 2: Memurai (Redis Alternative for Windows)

1. **Download:**
   - Visit: https://www.memurai.com/get-memurai
   - Download and install MSI

2. **Start:**
   - Automatically runs as Windows service on port 6379

### Option 3: WSL (If you have Linux subsystem)

```powershell
wsl
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
```

## Start the Service

Once Redis is running:

### Terminal 1 - Start API Server
```powershell
npm run dev
```

### Terminal 2 - Start Worker
```powershell
npm run worker
```

## Test It

```powershell
# Health check
curl http://localhost:3090/health

# Create job
curl -X POST http://localhost:3090/api/generate-recipe `
  -H "Content-Type: application/json" `
  -d '{\"title\": \"Chocolate Cake Recipe\"}'
```

## Features

✅ **Handles unlimited concurrent requests** (queued in Redis)  
✅ **No database required** (jobs stored in Redis via BullMQ)  
✅ **Error handling & retry** (3 attempts per job)  
✅ **Job persistence** (as long as Redis is running)  
❌ **Data lost on Redis restart** (acceptable for queue-only)

## Architecture

```
Client Request → API Server → Redis Queue → Worker Process → Redis (stores result)
```

All job data is stored in Redis. When Redis restarts, jobs are lost (but this is normal for queue-only systems).
