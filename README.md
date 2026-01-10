# Recipe Article Generator API v2.0 🍳

A **production-ready, scalable** Node.js/Express API for generating SEO-optimized recipe articles using Google Gemini AI with job queuing, database persistence, and comprehensive error handling.

## ⚡ What's New in v2.0

### 🏗️ Production Architecture
- ✅ **BullMQ Job Queue** with Redis - Handle thousands of concurrent jobs
- ✅ **MongoDB Persistence** - No data loss on server restart
- ✅ **Background Workers** - Async job processing with concurrency control
- ✅ **Winston Logging** - Structured logging with file rotation
- ✅ **Comprehensive Error Handling** - Custom error classes and recovery
- ✅ **Rate Limiting** - Prevent API abuse (10 jobs/15min)
- ✅ **Health Monitoring** - Real-time system status endpoints
- ✅ **Graceful Shutdown** - No interrupted jobs
- ✅ **Horizontal Scaling** - Run multiple API servers and workers

### 🚀 Key Improvements

| Feature | v1.0 (Old) | v2.0 (New) |
|---------|-----------|-----------|
| **Storage** | In-memory (volatile) | MongoDB (persistent) ✅ |
| **Queue System** | None | BullMQ + Redis ✅ |
| **Concurrent Jobs** | Unlimited (crashes) | Controlled (configurable) ✅ |
| **Scaling** | Single instance | Multi-instance + workers ✅ |
| **Error Recovery** | Basic retries | Comprehensive + auto-retry ✅ |
| **Monitoring** | Basic health | Full dashboard ✅ |
| **Logs** | Console only | Files + rotation ✅ |
| **Production Ready** | ❌ No | ✅ **Yes** |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- Redis 6.0+

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.production` to `.env` and update:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/recipe-generator
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start Services

**Option A: Development (2 terminals)**
```bash
# Terminal 1: Start API server
npm run dev

# Terminal 2: Start worker
npm run worker
```

**Option B: Production (with PM2)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

### 4. Test It

```bash
# Create a recipe generation job
curl -X POST http://localhost:3090/api/generate-recipe \
  -H "Content-Type: application/json" \
  -d '{"title": "Chocolate Chip Cookies"}'

# Check health
curl http://localhost:3090/health/detailed
```

---

## 📋 Features

### AI-Powered Generation
- **Google Gemini 2.0 Flash** for high-quality content
- **17 Specialized Sections** generated sequentially
- **Context Accumulation** - each section builds on previous content
- **AI Keyword Extraction** - removes marketing fluff from recipe names
- **SEO Optimization** - validates title/description lengths

### Job Management
- **Persistent Queue** - jobs survive server restarts
- **Progress Tracking** - real-time updates (0-100%)
- **Retry Logic** - 10 attempts per section with exponential backoff
- **Job History** - query by status, date, or title
- **Auto-cleanup** - old completed jobs deleted after 7 days

### Scalability
- **Worker Concurrency** - process multiple jobs simultaneously
- **Rate Limiting** - 100 API requests/15min, 10 job creations/15min
- **Horizontal Scaling** - run multiple API instances and workers
- **Queue Throttling** - max 10 jobs/minute per worker

### Monitoring & Logging
- **Health Endpoints** - check DB, Redis, Queue, Gemini API status
- **Structured Logs** - Winston with file rotation (10MB max, 5 files)
- **Error Tracking** - comprehensive error logging with stack traces
- **Metrics** - job counts, processing times, success rates

---

## 📁 Project Structure

```
recipe-generator/
├── src/
│   ├── server.v2.js              ✨ Production server with queue
│   ├── server.js                 📌 Legacy v1.0 (still works)
│   ├── config/
│   │   ├── database.js           ✨ MongoDB connection
│   │   ├── queue.js              ✨ BullMQ + Redis queue
│   │   ├── logger.js             ✨ Winston logger config
│   │   └── constants.js          📝 Configuration constants
│   ├── controllers/
│   │   ├── jobController.v2.js   ✨ Queue-based job management
│   │   ├── healthController.js   ✨ Health monitoring endpoints
│   │   └── generatorController.js 📝 Article generation logic
│   ├── middleware/
│   │   ├── errorHandler.js       ✨ Comprehensive error handling
│   │   └── validation.js         ✨ Input validation
│   ├── models/
│   │   ├── jobSchema.js          ✨ MongoDB job schema
│   │   └── jobModel.js           📌 Legacy in-memory model
│   ├── services/
│   │   ├── geminiService.js      📝 Gemini API wrapper
│   │   └── promptService.js      📝 17 prompt templates
│   ├── utils/
│   │   ├── errors.js             ✨ Custom error classes
│   │   ├── retry.js              📝 Retry logic
│   │   ├── keywordExtractor.js   📝 AI keyword extraction
│   │   └── htmlProcessor.js      📝 HTML/JSON processing
│   └── workers/
│       └── recipeWorker.js       ✨ Background job processor
├── logs/                         ✨ Application logs
├── .env                          📝 Environment config
├── ecosystem.config.js           ✨ PM2 configuration
├── QUICK_START.md                ✨ Quick setup guide
├── PRODUCTION_SETUP.md           ✨ Detailed production docs
└── README.md                     📝 This file
```

**Legend:** ✨ New in v2.0 | 📝 Updated | 📌 Legacy

---

## 🛠️ Installation

3. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server health status and Gemini initialization state.

### Create Recipe Generation Job
```
POST /api/generate-recipe

Body:
{
  "title": "Pumpkin Oatmeal Cream Pies",
  "image1": "https://example.com/image1.jpg",
  "image2": "https://example.com/image2.jpg",
  "featuredImage": "https://example.com/featured.jpg",
  "categories": "Baking (cat_123) Breakfast (cat_456)",
  "authors": "Chef Name (auth_123)"
}

Response:
{
  "success": true,
  "jobId": "job_1767900655462_abc123",
  "message": "Recipe generation started",
  "statusUrl": "/api/job-status/job_1767900655462_abc123"
}
```

### Check Job Progress
```
GET /api/job-status/:jobId

Response:
{
  "jobId": "job_1767900655462_abc123",
  "status": "generating",
  "progress": 65,
  "currentSection": "Ingredient Swaps",
  "sections": {
    "title_metadata": { "status": "completed" },
    "introduction": { "status": "completed" },
    ...
  }
}
```

### Get Job Result
```
GET /api/job-result/:jobId

Response (when complete):
{
  "success": true,
  "jobId": "job_1767900655462_abc123",
  "status": "completed",
  "result": {
    "title": "...",
    "description": "...",
    "ingredients": [...],
    "instructions": [...],
    "content": "...",
    ...
  }
}
```

### List All Jobs
```
GET /api/jobs
```

### Delete Job
```
DELETE /api/job/:jobId
```

## 📝 Generated Sections

The API generates 17 sections sequentially:

1. **Title & Metadata** - SEO-optimized title, description, timing
2. **Introduction Story** - Personal, nostalgic introduction
3. **Personal Anecdote** - Humorous mistake story
4. **Why You'll Love This** - 6 compelling bullet points
5. **Ingredients** - Grouped with commentary
6. **Instructions** - Step-by-step with tips
7. **Critical Tips** - "You Must Know" section
8. **Kitchen Reflection** - Sensory experience paragraph
9. **Storage Instructions** - How to store the recipe
10. **Ingredient Swaps** - Substitution guide
11. **Serving Suggestions** - Presentation and pairing ideas
12. **Story Behind** - Cultural/historical context
13. **Pro Tips** - Advanced techniques
14. **Closing Paragraph** - Warm sign-off
15. **FAQs** - 5 common questions with answers
16. **Equipment & Notes** - Tools needed and key notes
17. **Nutrition & Tags** - Calories, macros, SEO tags

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MAX_RETRIES` | Max retry attempts | 10 |
| `RETRY_DELAY` | Delay between retries (ms) | 5000 |
| `REQUEST_TIMEOUT` | Request timeout (ms) | 30000 |

### SEO Limits

| Field | Min | Max |
|-------|-----|-----|
| Title | 50 | 70 |
| Short Title | 20 | 50 |
| Description | 120 | 160 |

## 🧪 Testing with Postman

### Test 1: Create Job
```
POST http://localhost:3000/api/generate-recipe
Body: {"title": "Pumpkin Oatmeal Cream Pies"}
Expected: 200, jobId returned
```

### Test 2: Check Progress
```
GET http://localhost:3000/api/job-status/{jobId}
Expected: status "generating", progress 0-100%
```

### Test 3: Get Result
```
GET http://localhost:3000/api/job-result/{jobId}
Expected: 200, complete JSON structure
```

## 📊 Output Format

The final JSON output includes:

```json
{
  "title": "SEO-optimized title",
  "shortTitle": "Concise title",
  "description": "Meta description",
  "prepTime": "30 Minutes",
  "cookTime": "30 Minutes",
  "totalTime": "60 Minutes",
  "difficulty": "Intermediate",
  "cuisine": "American",
  "dietary": "None",
  "servings": "12 Servings",
  "category": "category_id",
  "author": "author_id",
  "image": "featured_image_url",
  "ingredients": [
    {
      "group": "Group Name",
      "items": ["ingredient 1", "ingredient 2"]
    }
  ],
  "instructions": [
    {
      "step": 1,
      "title": "Step Title",
      "content": "Instructions..."
    }
  ],
  "content": "Full HTML content with all sections",
  "equipment": "mixing bowls, stand mixer...",
  "notes": "Important recipe notes...",
  "nutrition_calories": "350",
  "nutrition_totalFat": "18g",
  "nutrition_totalCarbs": "45g",
  "nutrition_protein": "4g",
  "allergies": "Dairy, Eggs, Gluten",
  "tags": "baking,dessert,cookies...",
  "faqs": [
    {
      "question": "Question?",
      "answer": "Answer..."
    }
  ]
}
```

## 🔄 Retry Logic

- **Max Attempts**: 10
- **Delay**: 5 seconds (fixed)
- **Retryable Errors**: Network errors, timeouts, rate limits
- **Non-Retryable**: Invalid API key, malformed requests

## 📜 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
