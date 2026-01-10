# Quick Start - Production Recipe Generator v2.0

## 🎯 What Changed

Your service is now **production-ready** with:

✅ **Job Queue System** - BullMQ with Redis (handle thousands of jobs)  
✅ **Database Persistence** - MongoDB (no data loss on restart)  
✅ **Structured Logging** - Winston (track everything)  
✅ **Error Handling** - Comprehensive error recovery  
✅ **Rate Limiting** - Prevent abuse  
✅ **Health Monitoring** - Real-time system status  
✅ **Graceful Shutdown** - No interrupted jobs  
✅ **Horizontal Scaling** - Run multiple workers  

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install & Start Dependencies

**Windows:**
```powershell
# Install Redis (via Memurai)
# Download: https://www.memurai.com/get-memurai
# Or use Docker:
docker run -d -p 6379:6379 --name redis redis:latest

# Install MongoDB
# Download: https://www.mongodb.com/try/download/community
# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Mac/Linux:**
```bash
# Install via Homebrew (Mac) or apt (Linux)
brew install redis mongodb-community  # Mac
sudo apt install redis mongodb        # Ubuntu/Linux

# Start services
brew services start redis mongodb      # Mac
sudo systemctl start redis mongodb     # Linux
```

### Step 2: Verify Services

```bash
# Check Redis
redis-cli ping  # Should return: PONG

# Check MongoDB
mongosh --eval "db.adminCommand('ping')"  # Should return: { ok: 1 }
```

### Step 3: Run the Application

```bash
# Terminal 1: Start API Server
npm run dev

# Terminal 2: Start Worker
npm run worker
```

---

## 📊 Test It Out

```bash
# Create a job
curl -X POST http://localhost:3090/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"title": "Chocolate Chip Cookies"}'

# Check health
curl http://localhost:3090/health/detailed

# View all jobs
curl http://localhost:3090/api/jobs

# Get statistics
curl http://localhost:3090/api/stats
```

---

## 🏭 Production Deployment

```bash
# Install PM2 (process manager)
npm install -g pm2

# Start everything
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs

# Restart
pm2 restart all
```

---

## 🔧 Configuration

Edit `.env` file:

```env
# Gemini API
GEMINI_API_KEY=your_actual_key

# MongoDB (change if using cloud)
MONGODB_URI=mongodb://localhost:27017/recipe-generator

# Redis (change if using cloud)
REDIS_HOST=localhost
REDIS_PORT=6379

# Worker Settings
WORKER_CONCURRENCY=2  # Process 2 jobs at once
WORKER_MAX_JOBS=10     # Max 10 jobs per minute
```

---

## 📈 Scaling

### Run More Workers:
```bash
# Run 3 worker instances
pm2 scale recipe-worker 3
```

### Run Multiple API Instances:
```bash
# Run 4 API instances (load balanced)
pm2 scale recipe-api 4
```

### Increase Concurrency:
```env
# In .env
WORKER_CONCURRENCY=5  # Each worker processes 5 jobs simultaneously
```

**Current Capacity:**
- ✅ **2 workers** × **2 concurrent jobs** = **4 jobs processing simultaneously**
- ✅ **10 jobs/minute limit** prevents API abuse
- ✅ **Unlimited queue size** in Redis
- ✅ **Persistent storage** in MongoDB

---

## 🏥 Health Monitoring

Visit these URLs:

- **Basic Health**: http://localhost:3090/health
- **Detailed Health**: http://localhost:3090/health/detailed
- **Queue Stats**: http://localhost:3090/health/queue
- **Database Stats**: http://localhost:3090/health/database

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
```bash
# Make sure MongoDB is running
mongod --version
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # Mac
```

### "Redis connection error"
```bash
# Make sure Redis is running
redis-cli ping
sudo systemctl start redis  # Linux
brew services start redis   # Mac
```

### "Worker not processing jobs"
```bash
# Check worker is running
pm2 list

# View worker logs
pm2 logs recipe-worker

# Restart worker
pm2 restart recipe-worker
```

---

## 📁 File Structure

```
recipe-generator/
├── src/
│   ├── config/
│   │   ├── database.js       ✨ NEW - MongoDB connection
│   │   ├── queue.js          ✨ NEW - BullMQ configuration
│   │   └── logger.js         ✨ NEW - Winston logger
│   ├── controllers/
│   │   ├── jobController.v2.js    ✨ NEW - Queue-based controller
│   │   └── healthController.js    ✨ NEW - Health endpoints
│   ├── middleware/
│   │   ├── errorHandler.js   ✨ UPDATED - Better error handling
│   │   └── validation.js     ✨ UPDATED - Input validation
│   ├── models/
│   │   └── jobSchema.js      ✨ NEW - MongoDB schema
│   ├── workers/
│   │   └── recipeWorker.js   ✨ NEW - Background job processor
│   ├── server.v2.js          ✨ NEW - Production server
│   └── server.js             ✅ OLD - Still works (v1)
├── logs/                     ✨ NEW - Application logs
├── .env                      ✨ UPDATED - New config options
├── ecosystem.config.js       ✨ NEW - PM2 configuration
└── PRODUCTION_SETUP.md       ✨ NEW - Full documentation
```

---

## 🔄 Switching Between Versions

### Use v2.0 (Production - Recommended):
```bash
npm run dev      # API with queue
npm run worker   # Worker process
```

### Use v1.0 (Old in-memory version):
```bash
npm run dev:v1   # No queue, in-memory storage
```

---

## 🆘 Need Help?

1. **Check logs**: `tail -f logs/combined.log`
2. **Check health**: `curl http://localhost:3090/health/detailed`
3. **View PM2 status**: `pm2 status`
4. **See PRODUCTION_SETUP.md** for detailed documentation

---

## 🎯 Key Improvements

| Feature | v1.0 (Old) | v2.0 (New) |
|---------|-----------|-----------|
| **Storage** | In-memory (lost on restart) | MongoDB (persistent) |
| **Queue** | None (immediate processing) | BullMQ with Redis |
| **Concurrency** | All jobs run at once | Controlled (2 jobs) |
| **Scaling** | Single instance only | Multiple workers |
| **Error Recovery** | Basic | Comprehensive + retries |
| **Monitoring** | Basic health check | Full health dashboard |
| **Logs** | Console only | File + rotation |
| **Rate Limiting** | None | Yes (10 jobs/15min) |
| **Data Loss** | ❌ On crash | ✅ Persisted |
| **Production Ready** | ❌ No | ✅ Yes |

---

**Ready to scale! 🚀**
