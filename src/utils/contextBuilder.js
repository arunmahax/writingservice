/**
 * Context Builder utility for accumulating section data
 */

/**
 * Build context string from accumulated sections
 * @param {Object} context - The context object with all generated sections
 * @returns {string} - Formatted context string for prompts
 */
const buildContextString = (context) => {
  let contextParts = [];
  
  // Recipe Overview (always included if available)
  if (context.title || context.description || context.cuisine || context.difficulty) {
    contextParts.push('RECIPE OVERVIEW:');
    if (context.title) contextParts.push(`Title: ${context.title}`);
    if (context.shortTitle) contextParts.push(`Short Title: ${context.shortTitle}`);
    if (context.description) contextParts.push(`Description: ${context.description}`);
    if (context.cuisine) contextParts.push(`Cuisine: ${context.cuisine}`);
    if (context.difficulty) contextParts.push(`Difficulty: ${context.difficulty}`);
    if (context.dietary) contextParts.push(`Dietary: ${context.dietary}`);
    if (context.prepTime) contextParts.push(`Prep Time: ${context.prepTime}`);
    if (context.cookTime) contextParts.push(`Cook Time: ${context.cookTime}`);
    if (context.totalTime) contextParts.push(`Total Time: ${context.totalTime}`);
    if (context.servings) contextParts.push(`Servings: ${context.servings}`);
    contextParts.push('');
  }
  
  // Introduction Story
  if (context.introduction) {
    contextParts.push('INTRODUCTION STORY:');
    contextParts.push(context.introduction);
    contextParts.push('');
  }
  
  // Personal Anecdote
  if (context.anecdote) {
    contextParts.push('PERSONAL ANECDOTE:');
    contextParts.push(context.anecdote);
    contextParts.push('');
  }
  
  // Why You'll Love This
  if (context.whyLove) {
    contextParts.push('WHY READERS WILL LOVE IT:');
    contextParts.push(context.whyLove);
    contextParts.push('');
  }
  
  // Ingredients
  if (context.ingredients) {
    contextParts.push('INGREDIENTS:');
    if (context.ingredients.json) {
      contextParts.push(JSON.stringify(context.ingredients.json, null, 2));
    } else if (context.ingredients.html) {
      contextParts.push(context.ingredients.html);
    }
    contextParts.push('');
  }
  
  // Instructions
  if (context.instructions) {
    contextParts.push('COOKING INSTRUCTIONS:');
    if (context.instructions.json) {
      contextParts.push(JSON.stringify(context.instructions.json, null, 2));
    } else if (context.instructions.html) {
      contextParts.push(context.instructions.html);
    }
    contextParts.push('');
  }
  
  // Critical Tips
  if (context.criticalTips) {
    contextParts.push('CRITICAL TIPS:');
    contextParts.push(context.criticalTips);
    contextParts.push('');
  }
  
  // Kitchen Reflection
  if (context.reflection) {
    contextParts.push('KITCHEN REFLECTION:');
    contextParts.push(context.reflection);
    contextParts.push('');
  }
  
  // Storage Instructions
  if (context.storage) {
    contextParts.push('STORAGE INSTRUCTIONS:');
    contextParts.push(context.storage);
    contextParts.push('');
  }
  
  // Ingredient Swaps
  if (context.swaps) {
    contextParts.push('INGREDIENT SUBSTITUTIONS:');
    contextParts.push(context.swaps);
    contextParts.push('');
  }
  
  // Serving Suggestions
  if (context.serving) {
    contextParts.push('SERVING SUGGESTIONS:');
    contextParts.push(context.serving);
    contextParts.push('');
  }
  
  // Story Behind
  if (context.storyBehind) {
    contextParts.push('STORY BEHIND THE RECIPE:');
    contextParts.push(context.storyBehind);
    contextParts.push('');
  }
  
  // Pro Tips
  if (context.proTips) {
    contextParts.push('PRO TIPS:');
    contextParts.push(context.proTips);
    contextParts.push('');
  }
  
  // Closing
  if (context.closing) {
    contextParts.push('CLOSING PARAGRAPH:');
    contextParts.push(context.closing);
    contextParts.push('');
  }
  
  // FAQs
  if (context.faqs) {
    contextParts.push('FREQUENTLY ASKED QUESTIONS:');
    if (context.faqs.json) {
      contextParts.push(JSON.stringify(context.faqs.json, null, 2));
    }
    contextParts.push('');
  }
  
  return contextParts.join('\n');
};

/**
 * Create initial context from input data
 * @param {Object} input - The input data (title, images, etc.)
 * @returns {Object} - Initial context object
 */
const createInitialContext = (input) => {
  return {
    inputTitle: input.title,
    featuredImage: input.featuredImage,
    image1: input.image1,
    image2: input.image2,
    categories: input.categories,
    authors: input.authors
  };
};

/**
 * Update context with section data
 * @param {Object} context - The current context object
 * @param {string} sectionKey - The key of the section to update
 * @param {any} data - The data to add
 * @returns {Object} - Updated context object
 */
const updateContext = (context, sectionKey, data) => {
  const updatedContext = { ...context };
  
  switch (sectionKey) {
    case 'title_metadata':
      updatedContext.title = data.title;
      updatedContext.shortTitle = data.shortTitle;
      updatedContext.description = data.description;
      updatedContext.difficulty = data.difficulty;
      updatedContext.cuisine = data.cuisine;
      updatedContext.dietary = data.dietary;
      updatedContext.prepTime = data.prepTime;
      updatedContext.cookTime = data.cookTime;
      updatedContext.totalTime = data.totalTime;
      updatedContext.servings = data.servings;
      break;
      
    case 'introduction':
      updatedContext.introduction = data;
      break;
      
    case 'anecdote':
      updatedContext.anecdote = data;
      break;
      
    case 'why_love':
      updatedContext.whyLove = data;
      break;
      
    case 'ingredients':
      updatedContext.ingredients = {
        json: data.ingredientsJson,
        html: data.ingredientsHtml
      };
      break;
      
    case 'instructions':
      updatedContext.instructions = {
        json: data.instructionsJson,
        html: data.instructionsHtml
      };
      break;
      
    case 'critical_tips':
      updatedContext.criticalTips = data;
      break;
      
    case 'reflection':
      updatedContext.reflection = data;
      break;
      
    case 'storage':
      updatedContext.storage = data;
      break;
      
    case 'swaps':
      updatedContext.swaps = data;
      break;
      
    case 'serving':
      updatedContext.serving = data;
      break;
      
    case 'story_behind':
      updatedContext.storyBehind = data;
      break;
      
    case 'pro_tips':
      updatedContext.proTips = data;
      break;
      
    case 'closing':
      updatedContext.closing = data;
      break;
      
    case 'faqs':
      updatedContext.faqs = {
        json: data.faqsJson,
        html: data.faqsHtml
      };
      break;
      
    case 'equipment_notes':
      updatedContext.equipment = data.equipment;
      updatedContext.notes = data.notes;
      break;
      
    case 'nutrition_tags':
      updatedContext.nutrition = {
        calories: data.nutrition_calories,
        totalFat: data.nutrition_totalFat,
        totalCarbs: data.nutrition_totalCarbs,
        protein: data.nutrition_protein
      };
      updatedContext.allergies = data.allergies;
      updatedContext.tags = data.tags;
      break;
      
    default:
      updatedContext[sectionKey] = data;
  }
  
  return updatedContext;
};

/**
 * Get summary of context for logging
 * @param {Object} context - The context object
 * @returns {Object} - Summary of what's in the context
 */
const getContextSummary = (context) => {
  const summary = {};
  
  const keys = [
    'title', 'shortTitle', 'description', 'difficulty', 'cuisine', 'dietary',
    'introduction', 'anecdote', 'whyLove', 'ingredients', 'instructions',
    'criticalTips', 'reflection', 'storage', 'swaps', 'serving',
    'storyBehind', 'proTips', 'closing', 'faqs', 'equipment', 'notes',
    'nutrition', 'allergies', 'tags'
  ];
  
  keys.forEach(key => {
    if (context[key]) {
      if (typeof context[key] === 'string') {
        summary[key] = `${context[key].length} chars`;
      } else if (typeof context[key] === 'object') {
        summary[key] = 'present';
      } else {
        summary[key] = context[key];
      }
    }
  });
  
  return summary;
};

module.exports = {
  buildContextString,
  createInitialContext,
  updateContext,
  getContextSummary
};
