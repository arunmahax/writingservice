/**
 * Output Validator - Ensures final output meets all requirements
 */

/**
 * Validate HTML structure
 * @param {string} html - HTML content to validate
 * @returns {Object} - Validation result
 */
const validateHtml = (html) => {
  const errors = [];
  const warnings = [];
  
  // Check for basic HTML tags
  if (!html || html.trim().length === 0) {
    errors.push('HTML content is empty');
    return { valid: false, errors, warnings };
  }
  
  // Check for unclosed tags
  const openTags = html.match(/<(\w+)(?:\s[^>]*)?>(?!.*<\/\1>)/g);
  if (openTags && openTags.length > 0) {
    warnings.push(`Potentially unclosed tags detected: ${openTags.slice(0, 3).join(', ')}`);
  }
  
  // Check for required sections
  const requiredSections = [
    { pattern: /<h2[^>]*>.*?Ingredients.*?<\/h2>/i, name: 'Ingredients heading' },
    { pattern: /<h2[^>]*>.*?Instructions.*?<\/h2>/i, name: 'Instructions heading' },
    { pattern: /<dl>/i, name: 'Instructions definition list' },
    { pattern: /<aside[^>]*class="note"[^>]*>/i, name: 'Aside sections' }
  ];
  
  requiredSections.forEach(section => {
    if (!section.pattern.test(html)) {
      warnings.push(`Missing: ${section.name}`);
    }
  });
  
  // Check for proper ID attributes
  const requiredIds = ['paragraph-2', 'paragraph-4', 'paragraph-6', 'faqs'];
  requiredIds.forEach(id => {
    if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
      warnings.push(`Missing required ID: ${id}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate paragraph lengths for SEO
 * @param {string} html - HTML content
 * @returns {Object} - Validation result
 */
const validateParagraphLengths = (html) => {
  const warnings = [];
  const errors = [];
  
  // Extract all <p> tags
  const paragraphs = html.match(/<p[^>]*>(.*?)<\/p>/gs) || [];
  
  paragraphs.forEach((para, index) => {
    // Remove HTML tags and count words
    const text = para.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    
    // SEO guideline: paragraphs should be 40-150 words
    if (wordCount > 150) {
      warnings.push(`Paragraph ${index + 1} too long (${wordCount} words, max 150). Consider breaking it up.`);
    } else if (wordCount < 20 && wordCount > 0) {
      warnings.push(`Paragraph ${index + 1} very short (${wordCount} words). Consider expanding or combining.`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalParagraphs: paragraphs.length
  };
};

/**
 * Validate image URLs
 * @param {string} url - Image URL to validate
 * @returns {Object} - Validation result
 */
const validateImageUrl = (url) => {
  const errors = [];
  const warnings = [];
  
  if (!url || url.trim().length === 0) {
    warnings.push('Image URL is empty');
    return { valid: true, errors, warnings }; // Empty is okay
  }
  
  // Check if URL was corrupted (contains unexpected patterns)
  if (/\d{10,}/.test(url)) {
    warnings.push(`Image URL contains suspicious long number sequence: ${url}`);
  }
  
  // Check for valid URL format
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push(`Invalid protocol in image URL: ${urlObj.protocol}`);
    }
  } catch (e) {
    // Not a valid URL, might be relative path
    if (!url.startsWith('/') && !url.startsWith('./')) {
      warnings.push(`Image URL may be invalid: ${url}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    originalUrl: url
  };
};

/**
 * Validate SEO keywords in content
 * @param {string} html - HTML content
 * @param {string} recipeName - Recipe name to check
 * @returns {Object} - Validation result
 */
const validateKeywords = (html, recipeName = '') => {
  const warnings = [];
  const errors = [];
  const found = { storage: [], serving: [], sensory: [], emotional: [] };
  
  const text = html.toLowerCase();
  
  // Storage keywords
  const storageKeywords = ['store', 'refrigerate', 'airtight', 'fresh', 'freeze', 'container', 'fridge'];
  found.storage = storageKeywords.filter(kw => text.includes(kw));
  
  // Serving keywords
  const servingKeywords = ['serve', 'pair', 'perfect', 'enjoy', 'presentation', 'garnish'];
  found.serving = servingKeywords.filter(kw => text.includes(kw));
  
  // Sensory keywords
  const sensoryKeywords = ['warm', 'cozy', 'aromatic', 'golden', 'soft', 'crispy', 'buttery', 'tender', 'fluffy'];
  found.sensory = sensoryKeywords.filter(kw => text.includes(kw));
  
  // Emotional keywords
  const emotionalKeywords = ['nostalgic', 'comfort', 'delightful', 'satisfy', 'cozy', 'dreamy', 'perfect'];
  found.emotional = emotionalKeywords.filter(kw => text.includes(kw));
  
  // Check minimum keyword usage
  if (found.sensory.length < 2) {
    warnings.push(`Only ${found.sensory.length} sensory keywords found (recommended 3+): ${found.sensory.join(', ') || 'none'}`);
  }
  
  if (found.emotional.length < 1) {
    warnings.push(`No emotional keywords found (recommended 2+)`);
  }
  
  // Check recipe name usage
  if (recipeName) {
    const nameOccurrences = (text.match(new RegExp(recipeName.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (nameOccurrences < 3) {
      warnings.push(`Recipe name appears only ${nameOccurrences} times (recommended 5-8 throughout content)`);
    } else if (nameOccurrences > 15) {
      warnings.push(`Recipe name appears ${nameOccurrences} times (may be over-optimized, recommended 5-8)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    found
  };
};

/**
 * Validate entire article output
 * @param {Object} article - Article object to validate
 * @returns {Object} - Comprehensive validation result
 */
const validateArticleOutput = (article) => {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    sections: {}
  };
  
  // Validate required fields
  const requiredFields = ['title', 'description', 'content', 'category', 'author'];
  requiredFields.forEach(field => {
    if (!article[field]) {
      results.errors.push(`Missing required field: ${field}`);
      results.valid = false;
    }
  });
  
  // Validate title length (SEO)
  if (article.title) {
    const titleLength = article.title.length;
    if (titleLength < 50 || titleLength > 70) {
      results.warnings.push(`Title length ${titleLength} chars (recommended 50-70)`);
    }
  }
  
  // Validate description length (SEO)
  if (article.description) {
    const descLength = article.description.length;
    if (descLength < 120 || descLength > 160) {
      results.warnings.push(`Description length ${descLength} chars (recommended 120-160)`);
    }
  }
  
  // Validate HTML content
  if (article.content) {
    const htmlValidation = validateHtml(article.content);
    results.sections.html = htmlValidation;
    if (!htmlValidation.valid) {
      results.valid = false;
      results.errors.push(...htmlValidation.errors);
    }
    results.warnings.push(...htmlValidation.warnings);
    
    // Validate paragraph lengths
    const paraValidation = validateParagraphLengths(article.content);
    results.sections.paragraphs = paraValidation;
    results.warnings.push(...paraValidation.warnings);
    
    // Validate SEO keywords
    const keywordValidation = validateKeywords(article.content, article.title);
    results.sections.keywords = keywordValidation;
    results.warnings.push(...keywordValidation.warnings);
  }
  
  // Validate featured image URL
  if (article.featuredImageUrl) {
    const imgValidation = validateImageUrl(article.featuredImageUrl);
    results.sections.featuredImage = imgValidation;
    if (!imgValidation.valid) {
      results.errors.push(...imgValidation.errors);
    }
    results.warnings.push(...imgValidation.warnings);
  }
  
  // Validate ingredients
  if (article.ingredients && Array.isArray(article.ingredients)) {
    if (article.ingredients.length < 8) {
      results.warnings.push(`Only ${article.ingredients.length} ingredients (recommended 12-16)`);
    }
  }
  
  // Validate instructions
  if (article.instructions && Array.isArray(article.instructions)) {
    if (article.instructions.length < 5 || article.instructions.length > 8) {
      results.warnings.push(`${article.instructions.length} instruction steps (recommended 6-7)`);
    }
  }
  
  return results;
};

/**
 * Fix common HTML issues
 * @param {string} html - HTML content to fix
 * @returns {string} - Fixed HTML
 */
const fixHtmlIssues = (html) => {
  let fixed = html;
  
  // Remove any markdown code fences that might have been included
  fixed = fixed.replace(/```html\s*/g, '');
  fixed = fixed.replace(/```\s*/g, '');
  
  // Fix double spaces
  fixed = fixed.replace(/\s{2,}/g, ' ');
  
  // Fix line breaks between tags
  fixed = fixed.replace(/>\s+</g, '><');
  
  // Ensure SVG hrefs don't have # without ?
  fixed = fixed.replace(/href="\/assets\/drawable\/symbols-v4\.svg#/g, 'href="/assets/drawable/symbols-v4.svg?#');
  
  // Fix any escaped quotes in HTML
  fixed = fixed.replace(/\\"/g, '"');
  fixed = fixed.replace(/\\'/g, "'");
  
  return fixed.trim();
};

/**
 * Preserve image URLs from input
 * @param {string} originalUrl - Original image URL from input
 * @param {string} processedUrl - Potentially corrupted URL
 * @returns {string} - Correct image URL
 */
const preserveImageUrl = (originalUrl, processedUrl) => {
  // If original URL exists and is valid, use it
  if (originalUrl && originalUrl.trim().length > 0) {
    return originalUrl.trim();
  }
  
  // Otherwise, clean the processed URL
  if (processedUrl && processedUrl.trim().length > 0) {
    return processedUrl.trim();
  }
  
  return '';
};

/**
 * Generate validation report
 * @param {Object} validationResult - Result from validateArticleOutput
 * @returns {string} - Human-readable report
 */
const generateValidationReport = (validationResult) => {
  let report = '\n📋 OUTPUT VALIDATION REPORT\n';
  report += '═'.repeat(50) + '\n\n';
  
  // Overall status
  if (validationResult.valid) {
    report += '✅ Status: VALID (with warnings)\n';
  } else {
    report += '❌ Status: INVALID (has errors)\n';
  }
  
  // Errors
  if (validationResult.errors.length > 0) {
    report += `\n🔴 ERRORS (${validationResult.errors.length}):\n`;
    validationResult.errors.forEach((err, i) => {
      report += `  ${i + 1}. ${err}\n`;
    });
  }
  
  // Warnings
  if (validationResult.warnings.length > 0) {
    report += `\n⚠️  WARNINGS (${validationResult.warnings.length}):\n`;
    validationResult.warnings.forEach((warn, i) => {
      report += `  ${i + 1}. ${warn}\n`;
    });
  }
  
  // Section details
  if (validationResult.sections.paragraphs) {
    report += `\n📊 PARAGRAPHS: ${validationResult.sections.paragraphs.totalParagraphs} total\n`;
  }
  
  // Keyword details
  if (validationResult.sections.keywords) {
    report += `\n🔑 SEO KEYWORDS FOUND:\n`;
    report += `   Sensory: ${validationResult.sections.keywords.found.sensory.join(', ') || 'none'}\n`;
    report += `   Emotional: ${validationResult.sections.keywords.found.emotional.join(', ') || 'none'}\n`;
    report += `   Storage: ${validationResult.sections.keywords.found.storage.join(', ') || 'none'}\n`;
    report += `   Serving: ${validationResult.sections.keywords.found.serving.join(', ') || 'none'}\n`;
  }
  
  report += '\n' + '═'.repeat(50) + '\n';
  
  return report;
};

module.exports = {
  validateHtml,
  validateParagraphLengths,
  validateImageUrl,
  validateKeywords,
  validateArticleOutput,
  fixHtmlIssues,
  preserveImageUrl,
  generateValidationReport
};
