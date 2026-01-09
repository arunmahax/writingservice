# Recipe Article Generator API

A comprehensive Node.js/Express API for generating SEO-optimized recipe articles using Google Gemini AI with robust retry logic and real-time progress tracking.

## 🚀 Features

- **AI-Powered Generation**: Uses Google Gemini Pro for high-quality content
- **Sequential Section Generation**: 17 specialized sections generated in order
- **Context Accumulation**: Each section builds upon previous content
- **Retry Logic**: 10 retries with 5-second delays for reliability
- **Progress Tracking**: Real-time progress updates via API
- **SEO Validation**: Automatic validation of title and description lengths
- **Job Management**: Create, track, and retrieve generation jobs

## 📁 Project Structure

```
recipe-generator/
├── src/
│   ├── server.js                 # Main Express server
│   ├── controllers/
│   │   ├── jobController.js      # Job creation & status endpoints
│   │   └── generatorController.js # Article generation logic
│   ├── services/
│   │   ├── geminiService.js      # Gemini API wrapper with retry logic
│   │   └── promptService.js      # All 17 prompt templates
│   ├── models/
│   │   └── jobModel.js           # Job structure & validation
│   ├── utils/
│   │   ├── retry.js              # Retry logic (10 attempts, 5sec delay)
│   │   ├── seoValidator.js       # Character limits validation
│   │   └── contextBuilder.js     # Build context from previous sections
│   └── config/
│       └── constants.js          # SEO limits, retry config
├── .env                          # Environment variables
├── .env.example                  # Example environment file
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd recipe-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

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
