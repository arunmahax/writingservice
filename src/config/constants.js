/**
 * Configuration constants for the Recipe Generator
 */

// SEO Validation Limits
const SEO_LIMITS = {
  title: {
    min: 50,
    max: 70,
    errorMessage: "Title must be 50-70 characters for SEO"
  },
  shortTitle: {
    min: 20,
    max: 50,
    errorMessage: "Short title must be 20-50 characters"
  },
  description: {
    min: 120,
    max: 160,
    errorMessage: "Description must be 120-160 characters for SEO"
  }
};

// Retry Configuration
const RETRY_CONFIG = {
  maxRetries: parseInt(process.env.MAX_RETRIES) || 10,
  retryDelay: parseInt(process.env.RETRY_DELAY) || 5000,
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT) || 30000
};

// Section Definitions with Progress Percentages
const SECTIONS = {
  title_metadata: { name: 'Title & Metadata', progress: 0, weight: 10 },
  introduction: { name: 'Introduction Story', progress: 10, weight: 10 },
  anecdote: { name: 'Personal Anecdote', progress: 15, weight: 5 },
  why_love: { name: 'Why You\'ll Love This', progress: 20, weight: 10 },
  ingredients: { name: 'Ingredients', progress: 30, weight: 15 },
  instructions: { name: 'Instructions', progress: 45, weight: 15 },
  critical_tips: { name: 'Critical Tips', progress: 55, weight: 5 },
  reflection: { name: 'Kitchen Reflection', progress: 60, weight: 5 },
  storage: { name: 'Storage Guide', progress: 65, weight: 5 },
  swaps: { name: 'Ingredient Swaps', progress: 70, weight: 5 },
  serving: { name: 'Serving Suggestions', progress: 75, weight: 5 },
  story_behind: { name: 'Story Behind', progress: 80, weight: 5 },
  pro_tips: { name: 'Pro Tips', progress: 85, weight: 5 },
  closing: { name: 'Closing Paragraph', progress: 88, weight: 2 },
  faqs: { name: 'FAQs', progress: 90, weight: 5 },
  equipment_notes: { name: 'Equipment & Notes', progress: 95, weight: 3 },
  nutrition_tags: { name: 'Nutrition & Tags', progress: 98, weight: 2 }
};

// Section Order for Sequential Generation
const SECTION_ORDER = [
  'title_metadata',
  'introduction',
  'why_love',
  'ingredients',
  'instructions',
  'critical_tips',
  'reflection',
  'storage',
  'serving',
  'pro_tips',
  'faqs',
  'equipment_notes',
  'nutrition_tags'
];

// Job Statuses
const JOB_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Section Statuses
const SECTION_STATUS = {
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Error Types
const ERROR_TYPES = {
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONTEXT_ERROR: 'CONTEXT_ERROR',
  FATAL_ERROR: 'FATAL_ERROR'
};

// OpenRouter / Claude Model Configuration
const AI_CONFIG = {
  model: process.env.AI_MODEL || 'anthropic/claude-sonnet-4',
  baseURL: 'https://openrouter.ai/api/v1',
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 16384,
};

module.exports = {
  SEO_LIMITS,
  RETRY_CONFIG,
  SECTIONS,
  SECTION_ORDER,
  JOB_STATUS,
  SECTION_STATUS,
  ERROR_TYPES,
  AI_CONFIG
};
