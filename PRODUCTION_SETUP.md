# Recipe Article Generator v2.0.0 - Production Setup Guide

## 🏗️ Architecture Overview

The service now uses a **scalable, production-ready architecture**:

### Core Components:
1. **Express.js API** - REST API for job management
2. **MongoDB** - Persistent job storage and results
3. **Redis + BullMQ** - Job queue for async processing
4. **Worker Process** - Background job processing
5. **Winston** - Structured logging
6. **Helmet + Rate Limiting** - Security

### Flow:
```
Client → API → MongoDB (save job) → Redis Queue → Worker → Gemini AI → MongoDB (save result)
```

---

## 📋 Prerequisites

### Required Software:
- **Node.js** 18+ 
- **MongoDB** 4.4+
- **Redis** 6.0+

### Installation:

#### Windows:
```powershell
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Install Redis (via Memurai - Windows-compatible)
# Download from: https://www.memurai.com/get-memurai

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Linux/Mac:
```bash
# Install MongoDB
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community # macOS

# Install Redis
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS
```

---

## ⚙️ Configuration

### 1. Environment Variables

Copy `.env.production` to `.env` and configure:

```bash
cp .env.production .env
```

**Critical Settings:**
```env
# Required
GEMINI_API_KEY=your_actual_gemini_api_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/recipe-generator

# Redis  
REDIS_HOST=localhost
REDIS_PORT=6379

# Worker Settings
WORKER_CONCURRENCY=2  # Process 2 jobs simultaneously
WORKER_MAX_JOBS=10     # Max 10 jobs per minute
```

### 2. MongoDB Setup

```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or with Docker
docker start mongodb
```

### 3. Redis Setup

```bash
# Start Redis
redis-server

# Or with Docker
docker start redis

# Verify Redis is running
redis-cli ping  # Should return: PONG
```

---

## 🚀 Running the Service

### Development Mode:

```bash
# Install dependencies (already done)
npm install

# Run API server (dev mode with auto-reload)
npm run dev

# In a separate terminal, run the worker
npm run worker
```

### Production Mode:

```bash
# Start MongoDB and Redis first

# Start API server
npm start

# Start worker (in separate process/terminal)
npm run worker:prod
```

### Using PM2 (Recommended for Production):

```bash
# Install PM2 globally
npm install -g pm2

# Start API and Worker together
pm2 start ecosystem.config.js

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all

# Stop
pm2 stop all
```

---

## 📦 PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'recipe-api',
      script: './src/server.v2.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3090
      }
    },
    {
      name: 'recipe-worker',
      script: './src/workers/recipeWorker.js',
      instances: 1,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

---

## 🔍 Health Monitoring

### Endpoints:

```bash
# Basic health
curl http://localhost:3090/health

# Detailed health (includes DB, Redis, Queue status)
curl http://localhost:3090/health/detailed

# Queue stats
curl http://localhost:3090/health/queue

# Database stats
curl http://localhost:3090/health/database

# Kubernetes readiness
curl http://localhost:3090/ready

# Kubernetes liveness
curl http://localhost:3090/alive
```

---

## 📊 API Usage

### 1. Create Recipe Generation Job

```bash
curl -X POST http://localhost:3090/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{
    "title": "High Protein Overnight Oats"
  }'
```

**Response:**
```json
{
  "success": true,
  "jobId": "job_1736543210000_abc123",
  "status": "queued",
  "message": "Job created and queued for processing",
  "statusUrl": "/api/job-status/job_1736543210000_abc123",
  "resultUrl": "/api/job-result/job_1736543210000_abc123"
}
```

### 2. Check Job Status

```bash
curl http://localhost:3090/api/job-status/job_1736543210000_abc123
```

**Response:**
```json
{
  "success": true,
  "job": {
    "jobId": "job_1736543210000_abc123",
    "status": "generating",
    "progress": 45,
    "currentSection": "instructions",
    "sections": { ... }
  }
}
```

### 3. Get Result (when completed)

```bash
curl http://localhost:3090/api/job-result/job_1736543210000_abc123
```

### 4. List All Jobs

```bash
curl http://localhost:3090/api/jobs?status=completed&limit=20&page=1
```

### 5. Get Statistics

```bash
curl http://localhost:3090/api/stats
```

---

## 🛡️ Security Features

### Implemented:
- ✅ **Helmet** - Security headers
- ✅ **Rate Limiting** - 100 requests/15min per IP
- ✅ **Job Creation Limit** - 10 jobs/15min per IP
- ✅ **Input Validation** - Express-validator
- ✅ **CORS** - Configurable origins
- ✅ **Graceful Shutdown** - Drains connections properly

### Rate Limits:
```
General API: 100 requests / 15 minutes
Job Creation: 10 jobs / 15 minutes
```

---

## 📈 Scalability

### Current Capacity:
- **Concurrent Jobs**: 2 (configurable via `WORKER_CONCURRENCY`)
- **Queue Limit**: 10 jobs/minute (configurable via `WORKER_MAX_JOBS`)
- **Job Storage**: MongoDB (unlimited with proper indexing)
- **Auto-cleanup**: Completed jobs deleted after 7 days

### Horizontal Scaling:

```bash
# Run multiple worker instances
pm2 scale recipe-worker +2  # Add 2 more workers

# Run API in cluster mode (PM2)
pm2 scale recipe-api 4  # 4 API instances
```

### Vertical Scaling:

Increase worker concurrency:
```env
WORKER_CONCURRENCY=5  # Process 5 jobs at once
WORKER_MAX_JOBS=20     # 20 jobs per minute
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/recipe-generator
```

### Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Check Redis logs
redis-cli INFO
```

### Jobs Stuck in Queue
```bash
# Check worker is running
pm2 list

# View worker logs
pm2 logs recipe-worker

# Clear stalled jobs (via API)
curl http://localhost:3090/health/queue
```

### High Memory Usage
```bash
# Monitor memory
pm2 monit

# Reduce worker concurrency
WORKER_CONCURRENCY=1

# Enable job cleanup
# Completed jobs auto-delete after 7 days
```

---

## 📝 Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Errors only

View logs:
```bash
# Tail combined log
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# With PM2
pm2 logs
```

---

## 🔄 Migration from v1.0

If upgrading from the old in-memory version:

1. Install new dependencies (already done)
2. Start MongoDB and Redis
3. Update `.env` with new variables
4. Run database migrations (none needed for fresh start)
5. Switch to `server.v2.js`
6. Start worker process

---

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Winston Logging](https://github.com/winstonjs/winston)
- [PM2 Process Manager](https://pm2.keymetrics.io/)

---

## 🆘 Support

For issues:
1. Check logs in `logs/` directory
2. Verify all services running: `curl http://localhost:3090/health/detailed`
3. Check queue stats: `curl http://localhost:3090/health/queue`

---

**Version**: 2.0.0  
**Last Updated**: January 2026
