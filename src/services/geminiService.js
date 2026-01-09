/**
 * Gemini Service - Google Gemini API wrapper with retry logic
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_CONFIG, RETRY_CONFIG } = require('../config/constants');
const { withRetry, withTimeout } = require('../utils/retry');
const { checkNeedsRegeneration, logValidation } = require('../utils/seoValidator');
const { buildContextString, updateContext } = require('../utils/contextBuilder');
const { processHtml, processJsonWithHtml, removeMarkdownFences } = require('../utils/htmlProcessor');
const prompts = require('./promptService');

// Initialize Gemini AI
let genAI = null;
let model = null;

/**
 * Initialize the Gemini client
 */
const initializeGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️ Warning: GEMINI_API_KEY not configured. Please set it in your .env file.');
    return false;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ 
    model: GEMINI_CONFIG.model,
    generationConfig: GEMINI_CONFIG.generationConfig
  });
  
  console.log('✅ Gemini AI initialized successfully');
  return true;
};

/**
 * Clean JSON response from Gemini
 * @param {string} text - Raw response text
 * @returns {string} - Cleaned JSON string
 */
const cleanJsonResponse = (text) => {
  // Use the HTML processor to remove markdown fences
  let cleaned = removeMarkdownFences(text);
  
  // Remove any remaining whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

/**
 * Generate content using Gemini API
 * @param {string} prompt - The prompt to send
 * @param {string} sectionName - Name of the section being generated
 * @param {boolean} expectJson - Whether to expect JSON response
 * @returns {Promise<any>} - Generated content
 */
const generateContent = async (prompt, sectionName, expectJson = false) => {
  if (!model) {
    throw new Error('Gemini AI not initialized. Please set GEMINI_API_KEY in .env file.');
  }
  
  const result = await withRetry(
    async () => {
      const response = await withTimeout(
        async () => model.generateContent(prompt),
        RETRY_CONFIG.requestTimeout
      );
      
      const text = response.response.text();
      
      if (expectJson) {
        const cleaned = cleanJsonResponse(text);
        try {
          const parsed = JSON.parse(cleaned);
          // Post-process JSON that contains HTML
          return processJsonWithHtml(parsed);
        } catch (parseError) {
          console.error(`JSON parse error for ${sectionName}:`, parseError.message);
          console.error('Raw response:', text.substring(0, 500));
          throw new Error(`Invalid JSON response: ${parseError.message}`);
        }
      }
      
      // For HTML responses, process and clean
      return processHtml(text);
    },
    {
      sectionName,
      onRetry: ({ attempt, maxRetries, error }) => {
        console.log(`🔄 Retry ${attempt}/${maxRetries} for ${sectionName}: ${error.message}`);
      }
    }
  );
  
  return result.data;
};

/**
 * Generate Title & Metadata (Section 1)
 */
const generateTitleMetadata = async (input, context) => {
  const prompt = prompts.getTitleMetadataPrompt(input);
  let data = await generateContent(prompt, 'Title & Metadata', true);
  
  // Validate SEO limits
  const validation = checkNeedsRegeneration(data);
  logValidation(validation.validation, 'Title & Metadata');
  
  // If validation fails, we still proceed but log the issue
  if (validation.needsRegeneration) {
    console.warn(`⚠️ SEO validation issues: ${validation.errorSummary}`);
  }
  
  return data;
};

/**
 * Generate Introduction Story (Section 2)
 */
const generateIntroduction = async (context) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getIntroductionPrompt(contextString);
  return await generateContent(prompt, 'Introduction Story', false);
};

/**
 * Generate Personal Anecdote (Section 3)
 */
const generateAnecdote = async (context) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getAnecdotePrompt(contextString);
  return await generateContent(prompt, 'Personal Anecdote', false);
};

/**
 * Generate Why You'll Love This (Section 4)
 */
const generateWhyLove = async (context) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getWhyLovePrompt(contextString);
  return await generateContent(prompt, 'Why You\'ll Love This', false);
};

/**
 * Generate Ingredients (Section 5)
 */
const generateIngredients = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getIngredientsPrompt(contextString, title);
  return await generateContent(prompt, 'Ingredients', true);
};

/**
 * Generate Instructions (Section 6)
 */
const generateInstructions = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getInstructionsPrompt(contextString, title);
  return await generateContent(prompt, 'Instructions', true);
};

/**
 * Generate Critical Tips (Section 7)
 */
const generateCriticalTips = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getCriticalTipsPrompt(contextString);
  return await generateContent(prompt, 'Critical Tips', false);
};

/**
 * Generate Kitchen Reflection (Section 8)
 */
const generateReflection = async (context) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getReflectionPrompt(contextString);
  return await generateContent(prompt, 'Kitchen Reflection', false);
};

/**
 * Generate Storage Instructions (Section 9)
 */
const generateStorage = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getStoragePrompt(contextString, title);
  return await generateContent(prompt, 'Storage Instructions', false);
};

/**
 * Generate Ingredient Swaps (Section 10)
 */
const generateSwaps = async (context, title) => {
  const contextString = buildContextString(context);
  const ingredientsJson = context.ingredients?.json || [];
  const prompt = prompts.getSwapsPrompt(contextString, ingredientsJson);
  return await generateContent(prompt, 'Ingredient Swaps', false);
};

/**
 * Generate Serving Suggestions (Section 11)
 */
const generateServing = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getServingPrompt(contextString, title);
  return await generateContent(prompt, 'Serving Suggestions', false);
};

/**
 * Generate Story Behind (Section 12)
 */
const generateStoryBehind = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getStoryBehindPrompt(contextString, title);
  return await generateContent(prompt, 'Story Behind', false);
};

/**
 * Generate Pro Tips (Section 13)
 */
const generateProTips = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getProTipsPrompt(contextString);
  return await generateContent(prompt, 'Pro Tips', false);
};

/**
 * Generate Closing Paragraph (Section 14)
 */
const generateClosing = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getClosingPrompt(contextString, title);
  return await generateContent(prompt, 'Closing Paragraph', false);
};

/**
 * Generate FAQs (Section 15)
 */
const generateFaqs = async (context, title) => {
  const contextString = buildContextString(context);
  const ingredientsJson = context.ingredients?.json || [];
  const prompt = prompts.getFaqsPrompt(contextString, ingredientsJson);
  return await generateContent(prompt, 'FAQs', true);
};

/**
 * Generate Equipment & Notes (Section 16)
 */
const generateEquipmentNotes = async (context, title) => {
  const contextString = buildContextString(context);
  const prompt = prompts.getEquipmentNotesPrompt(contextString);
  return await generateContent(prompt, 'Equipment & Notes', true);
};

/**
 * Generate Nutrition & Tags (Section 17)
 */
const generateNutritionTags = async (context, title) => {
  const contextString = buildContextString(context);
  const ingredientsJson = context.ingredients?.json || [];
  const servings = context.servings || '4-6 Servings';
  const prompt = prompts.getNutritionTagsPrompt(contextString, ingredientsJson, servings);
  return await generateContent(prompt, 'Nutrition & Tags', true);
};

/**
 * Select best category using AI
 * @param {string} recipeTitle - The recipe title
 * @param {Array} categories - Array of {name, id} objects
 * @returns {Promise<string>} - Selected category ID
 */
const selectBestCategory = async (recipeTitle, categories) => {
  if (!categories || categories.length === 0) {
    return '';
  }
  
  if (categories.length === 1) {
    return categories[0].id;
  }
  
  const prompt = prompts.getCategorySelectionPrompt(recipeTitle, categories);
  const result = await generateContent(prompt, 'Category Selection', true);
  
  console.log(`🎯 AI selected category: ${result.selectedId} - ${result.reason}`);
  
  return result.selectedId || categories[0].id;
};

/**
 * Check if Gemini is initialized
 */
const isInitialized = () => {
  return model !== null;
};

module.exports = {
  initializeGemini,
  isInitialized,
  generateContent,
  generateTitleMetadata,
  generateIntroduction,
  generateAnecdote,
  generateWhyLove,
  generateIngredients,
  generateInstructions,
  generateCriticalTips,
  generateReflection,
  generateStorage,
  generateSwaps,
  generateServing,
  generateStoryBehind,
  generateProTips,
  generateClosing,
  generateFaqs,
  generateEquipmentNotes,
  generateNutritionTags,
  selectBestCategory
};
