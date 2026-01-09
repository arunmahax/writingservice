/**
 * Generator Controller - Handles the sequential recipe article generation
 */

const jobModel = require('../models/jobModel');
const geminiService = require('../services/geminiService');
const { createInitialContext, updateContext } = require('../utils/contextBuilder');
const { extractRecipeKeywords } = require('../utils/keywordExtractor');
const { JOB_STATUS, SECTION_STATUS, SECTION_ORDER } = require('../config/constants');
const { 
  validateArticleOutput, 
  fixHtmlIssues, 
  preserveImageUrl,
  generateValidationReport 
} = require('../utils/outputValidator');

/**
 * Start the recipe generation process
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
  
  // Extract recipe keywords from full title
  console.log(`🔑 Extracting recipe keywords from: "${job.input.title}"`);
  const recipeKeywords = await extractRecipeKeywords(job.input.title);
  console.log(`✅ Extracted keywords: "${recipeKeywords}"`);
  
  // Create initial context
  let context = createInitialContext(job.input);
  context.recipeKeywords = recipeKeywords; // Add keywords to context
  jobModel.updateContext(jobId, context);
  
  try {
    // Generate each section sequentially
    for (const sectionKey of SECTION_ORDER) {
      try {
        console.log(`\n📝 Generating section: ${sectionKey}`);
        
        // Mark section as generating
        jobModel.updateSection(jobId, sectionKey, SECTION_STATUS.GENERATING);
        
        // Generate section content
        const data = await generateSection(sectionKey, job.input, context);
        
        // Update context with new data
        context = updateContext(context, sectionKey, data);
        jobModel.updateContext(jobId, context);
        
        // Mark section as completed
        jobModel.updateSection(jobId, sectionKey, SECTION_STATUS.COMPLETED, data);
        
        console.log(`✅ Completed section: ${sectionKey}`);
        
      } catch (sectionError) {
        console.error(`❌ Failed section ${sectionKey}:`, sectionError.message);
        
        // Mark section as failed but continue to next section
        jobModel.updateSection(jobId, sectionKey, SECTION_STATUS.FAILED, null, sectionError.message);
        jobModel.addError(jobId, sectionKey, sectionError.message);
      }
    }
    
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
