/**
 * Generator Controller - Handles the sequential recipe article generation
 */

const jobModel = require('../models/jobModel');
const geminiService = require('../services/geminiService');
const { createInitialContext } = require('../utils/contextBuilder');
const { JOB_STATUS, SECTION_STATUS, SECTION_ORDER } = require('../config/constants');
const { 
  validateArticleOutput, 
  fixHtmlIssues, 
  preserveImageUrl,
  generateValidationReport 
} = require('../utils/outputValidator');

/**
 * Start the recipe generation process (single API call)
 * @param {string} jobId - The job ID to process
 */
const startGeneration = async (jobId) => {
  const job = jobModel.getJob(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }
  
  console.log(`\n🚀 Starting generation for job ${jobId}: "${job.input.title}"`);
  
  // Update job status to generating
  jobModel.updateJobStatus(jobId, JOB_STATUS.GENERATING);
  
  // Create initial context
  let context = createInitialContext(job.input);
  jobModel.updateContext(jobId, context);
  
  try {
    // Mark all sections as generating
    for (const sectionKey of SECTION_ORDER) {
      jobModel.updateSection(jobId, sectionKey, SECTION_STATUS.GENERATING);
    }

    // Single API call to generate the entire article
    console.log(`\n📝 Generating full article in single request...`);
    const data = await geminiService.generateFullArticle(job.input);
    console.log(`✅ Full article generated successfully`);

    // Map the single response into context (same structure as before)
    // Title & Metadata
    context.title = data.title;
    context.shortTitle = data.shortTitle;
    context.description = data.description;
    context.difficulty = data.difficulty;
    context.cuisine = data.cuisine;
    context.dietary = data.dietary;
    context.prepTime = data.prepTime;
    context.cookTime = data.cookTime;
    context.totalTime = data.totalTime;
    context.servings = data.servings;
    context.recipeKeywords = data.title;
    jobModel.updateSection(jobId, 'title_metadata', SECTION_STATUS.COMPLETED, data);
    console.log(`✅ Mapped section: title_metadata`);

    // Introduction
    context.introduction = data.introduction;
    jobModel.updateSection(jobId, 'introduction', SECTION_STATUS.COMPLETED, data.introduction);
    console.log(`✅ Mapped section: introduction`);

    // Why Love
    context.whyLove = data.whyLove;
    jobModel.updateSection(jobId, 'why_love', SECTION_STATUS.COMPLETED, data.whyLove);
    console.log(`✅ Mapped section: why_love`);

    // Ingredients
    context.ingredients = {
      json: data.ingredientsJson,
      html: data.ingredientsHtml
    };
    jobModel.updateSection(jobId, 'ingredients', SECTION_STATUS.COMPLETED, {
      ingredientsJson: data.ingredientsJson,
      ingredientsHtml: data.ingredientsHtml
    });
    console.log(`✅ Mapped section: ingredients`);

    // Instructions
    context.instructions = {
      json: data.instructionsJson,
      html: data.instructionsHtml
    };
    jobModel.updateSection(jobId, 'instructions', SECTION_STATUS.COMPLETED, {
      instructionsJson: data.instructionsJson,
      instructionsHtml: data.instructionsHtml
    });
    console.log(`✅ Mapped section: instructions`);

    // Critical Tips
    context.criticalTips = data.criticalTips;
    jobModel.updateSection(jobId, 'critical_tips', SECTION_STATUS.COMPLETED, data.criticalTips);
    console.log(`✅ Mapped section: critical_tips`);

    // Reflection
    context.reflection = data.reflection;
    jobModel.updateSection(jobId, 'reflection', SECTION_STATUS.COMPLETED, data.reflection);
    console.log(`✅ Mapped section: reflection`);

    // Storage
    context.storage = data.storage;
    jobModel.updateSection(jobId, 'storage', SECTION_STATUS.COMPLETED, data.storage);
    console.log(`✅ Mapped section: storage`);

    // Serving
    context.serving = data.serving;
    jobModel.updateSection(jobId, 'serving', SECTION_STATUS.COMPLETED, data.serving);
    console.log(`✅ Mapped section: serving`);

    // Pro Tips
    context.proTips = data.proTips;
    jobModel.updateSection(jobId, 'pro_tips', SECTION_STATUS.COMPLETED, data.proTips);
    console.log(`✅ Mapped section: pro_tips`);

    // FAQs
    context.faqs = {
      json: data.faqsJson,
      html: data.faqsHtml
    };
    jobModel.updateSection(jobId, 'faqs', SECTION_STATUS.COMPLETED, {
      faqsJson: data.faqsJson,
      faqsHtml: data.faqsHtml
    });
    console.log(`✅ Mapped section: faqs`);

    // Equipment & Notes
    context.equipment = data.equipment;
    context.notes = data.notes;
    jobModel.updateSection(jobId, 'equipment_notes', SECTION_STATUS.COMPLETED, {
      equipment: data.equipment,
      notes: data.notes
    });
    console.log(`✅ Mapped section: equipment_notes`);

    // Nutrition & Tags
    context.nutrition = {
      calories: data.nutrition_calories,
      totalFat: data.nutrition_totalFat,
      totalCarbs: data.nutrition_totalCarbs,
      protein: data.nutrition_protein
    };
    context.allergies = data.allergies;
    context.tags = data.tags;
    jobModel.updateSection(jobId, 'nutrition_tags', SECTION_STATUS.COMPLETED, {
      nutrition_calories: data.nutrition_calories,
      nutrition_totalFat: data.nutrition_totalFat,
      nutrition_totalCarbs: data.nutrition_totalCarbs,
      nutrition_protein: data.nutrition_protein,
      allergies: data.allergies,
      tags: data.tags
    });
    console.log(`✅ Mapped section: nutrition_tags`);

    jobModel.updateContext(jobId, context);
    
    // Assemble final result
    console.log(`\n🔨 Assembling final result for job ${jobId}`);
    const result = await assembleResult(job, context);
    
    // Validate output
    console.log(`\n🔍 Validating final output...`);
    const validation = validateArticleOutput(result);
    console.log(generateValidationReport(validation));
    
    // Fix common HTML issues
    if (result.content) {
      result.content = fixHtmlIssues(result.content);
    }
    
    // Preserve original image URL
    result.featuredImageUrl = preserveImageUrl(job.input.featuredImage, result.featuredImageUrl);
    
    // Set result and mark as completed
    jobModel.setResult(jobId, result);
    
    console.log(`\n🎉 Job ${jobId} completed successfully!`);
    
    if (!validation.valid) {
      console.warn(`⚠️  Output has ${validation.errors.length} errors and ${validation.warnings.length} warnings`);
    }
    
  } catch (error) {
    console.error(`\n💥 Job ${jobId} failed:`, error.message);
    jobModel.failJob(jobId, error.message);
  }
};

/**
 * Generate a specific section
 * @param {string} sectionKey - The section key
 * @param {Object} input - Original input data
 * @param {Object} context - Current context
 * @returns {Promise<any>} - Generated section data
 */
const generateSection = async (sectionKey, input, context) => {
  const title = context.title || input.title;
  const keywords = context.recipeKeywords || title; // Use extracted keywords
  
  switch (sectionKey) {
    case 'title_metadata':
      return await geminiService.generateTitleMetadata(input, context);
      
    case 'introduction':
      return await geminiService.generateIntroduction(context);
      
    case 'why_love':
      return await geminiService.generateWhyLove(context);
      
    case 'ingredients':
      return await geminiService.generateIngredients(context, keywords);
      
    case 'instructions':
      return await geminiService.generateInstructions(context, keywords);
      
    case 'critical_tips':
      return await geminiService.generateCriticalTips(context, keywords);
      
    case 'reflection':
      return await geminiService.generateReflection(context);
      
    case 'storage':
      return await geminiService.generateStorage(context, keywords);
      
    case 'serving':
      return await geminiService.generateServing(context, keywords);
      
    case 'pro_tips':
      return await geminiService.generateProTips(context, keywords);
      
    case 'faqs':
      return await geminiService.generateFaqs(context, keywords);
      
    case 'equipment_notes':
      return await geminiService.generateEquipmentNotes(context, keywords);
      
    case 'nutrition_tags':
      return await geminiService.generateNutritionTags(context, keywords);
      
    default:
      throw new Error(`Unknown section: ${sectionKey}`);
  }
};

/**
 * Assemble the final result JSON
 * @param {Object} job - The job object
 * @param {Object} context - The accumulated context
 * @returns {Object} - Final assembled JSON
 */
const assembleResult = async (job, context) => {
  const sections = job.sections;
  const input = job.input;
  
  // Parse categories and authors
  const categories = parseNameIdList(input.categories);
  const authors = parseNameIdList(input.authors);
  
  // Smart category selection using AI
  let categoryId = '';
  if (categories.length > 0) {
    const recipeTitle = context.title || input.title;
    try {
      categoryId = await geminiService.selectBestCategory(recipeTitle, categories);
    } catch (err) {
      console.warn('⚠️ AI category selection failed, using first category:', err.message);
      categoryId = categories[0].id;
    }
  }
  
  // Random author selection
  const authorId = selectRandomAuthor(authors);
  
  // Build HTML content
  const htmlContent = buildHtmlContent(sections, context, input);
  
  // Build final JSON structure matching expected format exactly
  return {
    // Basic metadata
    title: context.title || input.title,
    shortTitle: context.shortTitle || input.title,
    description: context.description || '',
    content: htmlContent,
    
    // IDs
    category: categoryId,
    author: authorId,
    
    // Timing
    prepTime: context.prepTime || '30 Minutes',
    cookTime: context.cookTime || '30 Minutes',
    totalTime: context.totalTime || '60 Minutes',
    servings: context.servings || '12 Servings',
    
    // Classifications
    difficulty: context.difficulty || 'Intermediate',
    cuisine: context.cuisine || 'American',
    dietary: context.dietary || 'None',
    
    // Images
    featuredImageUrl: input.featuredImage || '',
    
    // Ingredients & Instructions
    ingredients: context.ingredients?.json || [],
    instructions: context.instructions?.json || [],
    
    // Equipment & Notes
    equipment: context.equipment || '',
    notes: context.notes || '',
    
    // Allergies
    allergies: context.allergies || '',
    
    // Nutrition
    nutrition_calories: context.nutrition?.calories || '',
    nutrition_totalFat: context.nutrition?.totalFat || '',
    nutrition_totalCarbs: context.nutrition?.totalCarbs || '',
    nutrition_protein: context.nutrition?.protein || '',
    
    // Tags
    tags: context.tags || '',
    
    // Publishing flags
    isFeatured: 'on',
    isTrending: 'on',
    action: 'publish',
    
    // FAQs
    faqs: context.faqs?.json || []
  };
};

/**
 * Build the HTML content from all sections
 * @param {Object} sections - All section data
 * @param {Object} context - The context object
 * @param {Object} input - Original input
 * @returns {string} - Complete HTML content
 */
const buildHtmlContent = (sections, context, input) => {
  const parts = [];
  let paragraphId = 1;
  
  // Introduction (multiple paragraphs)
  if (context.introduction) {
    parts.push(context.introduction);
    paragraphId++;
  }
  
  // Why You'll Love This (with id)
  if (context.whyLove) {
    // Add id to the aside
    const whyLoveWithId = context.whyLove.replace('<aside class="note">', `<aside id="paragraph-${paragraphId}" class="note">`);
    parts.push(whyLoveWithId);
    paragraphId++;
  }
  
  // Ingredients HTML (already contains h2 with id from prompt)
  if (context.ingredients?.html) {
    parts.push(context.ingredients.html);
    paragraphId++;
  }
  
  // Instructions HTML (already contains h2 with id from prompt)
  if (context.instructions?.html) {
    parts.push(context.instructions.html);
    paragraphId++;
  }
  
  // Critical Tips (with id)
  if (context.criticalTips) {
    const criticalTipsWithId = context.criticalTips.replace('<aside class="note">', `<aside id="paragraph-${paragraphId}" class="note">`);
    parts.push(criticalTipsWithId);
    paragraphId++;
  }
  
  // Kitchen Reflection
  if (context.reflection) {
    parts.push(context.reflection);
    paragraphId++;
  }
  
  // Storage (already contains h2 with id from prompt)
  if (context.storage) {
    parts.push(context.storage);
    paragraphId++;
  }
  
  // Image 1 placeholder
  if (input.image1) {
    parts.push(`[img_to_be_inserted]${input.image1}[img_to_be_inserted]`);
  }
  
  // Serving Suggestions (already contains h2 with id from prompt)
  if (context.serving) {
    parts.push(context.serving);
    paragraphId++;
  }
  
  // Pro Tips (with id)
  if (context.proTips) {
    const proTipsWithId = context.proTips.replace('<aside class="note">', `<aside id="paragraph-${paragraphId}" class="note">`);
    parts.push(proTipsWithId);
    paragraphId++;
  }
  
  // Image 2 placeholder
  if (input.image2) {
    parts.push(`[img_to_be_inserted]${input.image2}[img_to_be_inserted]`);
  }
  
  // FAQs HTML (already contains h2 with id from prompt)
  if (context.faqs?.html) {
    parts.push(context.faqs.html);
  }
  
  return parts.join('');
};

/**
 * Parse a string like "Name1 (id1) Name2 (id2)" into array of {name, id}
 * @param {string} str - The string to parse
 * @returns {Array} - Array of {name, id} objects
 */
const parseNameIdList = (str) => {
  if (!str) return [];
  
  const results = [];
  const regex = /([^()]+?)\s*\(([^)]+)\)/g;
  let match;
  
  while ((match = regex.exec(str)) !== null) {
    results.push({
      name: match[1].trim(),
      id: match[2].trim()
    });
  }
  
  return results;
};

/**
 * Select a random author from the list
 * @param {Array} authors - Array of {name, id} objects
 * @returns {string} - Random author ID or empty string
 */
const selectRandomAuthor = (authors) => {
  if (!authors || authors.length === 0) return '';
  
  const randomIndex = Math.floor(Math.random() * authors.length);
  const selected = authors[randomIndex];
  
  console.log(`🎲 Randomly selected author: ${selected.name} (${selected.id})`);
  
  return selected.id;
};

module.exports = {
  startGeneration,
  generateSection,
  assembleResult
};
