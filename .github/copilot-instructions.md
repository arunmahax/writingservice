<!-- Custom instructions for the Recipe Article Generator project -->

## Project Overview
This is a Recipe Article Generator API built with Node.js, Express, and OpenRouter AI (Claude Sonnet).

## Key Technologies
- Node.js with Express.js
- OpenRouter AI (Claude Sonnet via OpenAI-compatible API)
- BullMQ + Redis queue-based job storage

## Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: OpenRouter API integration and prompt templates
- **Models**: Job structure and validation
- **Utils**: Retry logic, SEO validation, context building
- **Config**: Constants and configuration

## Important Patterns
- Sequential section generation with context accumulation
- Retry logic: 10 attempts with 5-second delays
- SEO validation for title (50-70 chars) and description (120-160 chars)
- Async job processing with progress tracking

## Running the Project
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

## Testing
Use Postman to test endpoints:
- POST /api/generate-recipe - Create job
- GET /api/job-status/:jobId - Check progress
- GET /api/job-result/:jobId - Get result

## Environment
Set OPENROUTER_API_KEY in .env file before running.
