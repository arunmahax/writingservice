/**
 * Keyword Extractor - Extract core recipe keywords from full title
 * Uses Gemini AI to intelligently extract main recipe keywords
 */

const geminiService = require('../services/geminiService');

/**
 * Extract core recipe keywords from full recipe title
 * Removes marketing fluff, filler phrases, and keeps only the essential recipe name
 * 
 * @param {string} fullTitle - Full recipe title (e.g., "Ultimate High Protein Gingerbread Overnight Oats for Busy Mornings")
 * @returns {Promise<string>} - Core keywords (e.g., "Gingerbread Overnight Oats")
 */
async function extractRecipeKeywords(fullTitle) {
  const prompt = `You are a recipe SEO expert. Extract the core recipe name from this title.

TITLE: "${fullTitle}"

YOUR TASK:
Analyze if the title contains marketing fluff or if it's already a clean recipe name.

IF TITLE IS CLEAN (no marketing words, no filler phrases):
→ Return the ENTIRE title as-is

IF TITLE HAS MARKETING FLUFF:
→ Remove ONLY the unnecessary parts

WHAT TO REMOVE (only if present):
- Extreme marketing: "Ultimate", "Best Ever", "Perfect", "Amazing", "World's Best", "Irresistible"
- Emotional fluff: "Dreamy", "Heavenly", "Divine", "Cozy" (unless it's the actual recipe name)
- Context phrases: "for family", "for dinner", "for tired nights", "for busy mornings", "for kids"
- Subtitles after colons: ": Fall's Coziest Treat", ": A Summer Delight"

WHAT TO ALWAYS KEEP:
- Recipe style descriptors: Quick, Easy, One-Pot, 30-Minute, Healthy
- Dietary/nutrition: Vegan, Gluten-Free, High Protein, Low Carb
- Main ingredients: Chicken, Chocolate, Pumpkin, Gingerbread
- Dish type: Pasta, Soup, Cookies, Overnight Oats, Stir Fry
- Flavor/style: Spicy, Creamy, Crispy, Asian, Italian

EXAMPLES:
"High Protein Gingerbread Overnight Oats" → "High Protein Gingerbread Overnight Oats" (already clean, keep all)
"Ultimate High Protein Gingerbread Overnight Oats for Busy Mornings" → "High Protein Gingerbread Overnight Oats" (remove "Ultimate" and "for Busy Mornings")
"Quick Meal for Tired Nights" → "Quick Meal" (keep "Quick" as style descriptor)
"Chicken Tikka Masala" → "Chicken Tikka Masala" (already clean)
"The Best Ever Chocolate Chip Cookies" → "Chocolate Chip Cookies" (remove marketing)
"Irresistible Pumpkin Oatmeal Cream Pies: Fall's Coziest Treat" → "Pumpkin Oatmeal Cream Pies" (remove marketing + subtitle)
"One-Pot Creamy Tomato Pasta" → "One-Pot Creamy Tomato Pasta" (already clean, keep all)
"Easy Vegan Banana Bread for Breakfast" → "Vegan Banana Bread" ("Easy" is optional, but "Vegan" is essential)

IMPORTANT: Be smart! If in doubt, keep more rather than less. The goal is SEO-friendly keywords, not to over-simplify.

Return ONLY the extracted recipe name, nothing else.`;

  try {
    const keywords = await geminiService.generateContent(prompt, 'keyword_extraction', false);
    return keywords.trim();
  } catch (error) {
    console.error('Error extracting recipe keywords:', error);
    // Fallback: simple extraction
    return extractKeywordsFallback(fullTitle);
  }
}

/**
 * Fallback keyword extraction (rule-based)
 */
function extractKeywordsFallback(fullTitle) {
  let keywords = fullTitle;
  
  // Remove common marketing prefixes (but keep Quick, Easy, One-Pot as they define recipe style)
  const prefixes = /^(The\s+)?(Ultimate|Best(\s+Ever)?|Perfect|Amazing|Irresistible|Delicious|Heavenly|Divine|Dreamy|Cozy|Homemade|Classic|Traditional|Authentic)\s+/gi;
  keywords = keywords.replace(prefixes, '');
  
  // Remove filler phrases
  const fillers = [
    /\s+for\s+(family|dinner|lunch|breakfast|kids|parties|crowds?|gatherings?|busy\s+(mornings?|people|nights?)|weeknights?|special\s+occasions?|tired\s+nights?)/gi,
    /\s+to\s+(share|enjoy|love|make|try)/gi,
    /:\s*.+$/,  // Remove everything after colon (subtitle)
    /\s+-\s*.+$/,  // Remove everything after dash
    /\s+\(.+\)$/,  // Remove parenthetical at end
  ];
  
  fillers.forEach(pattern => {
    keywords = keywords.replace(pattern, '');
  });
  
  // Clean up
  keywords = keywords.trim();
  
  // If result is too generic (single word like "Meal", "Dish"), this is a problem with input
  const genericWords = ['meal', 'dish', 'food', 'recipe', 'snack'];
  const lowerKeywords = keywords.toLowerCase();
  
  if (genericWords.includes(lowerKeywords)) {
    // Try to preserve more context from original title
    // Look for useful descriptors before the generic word
    const match = fullTitle.match(/(Quick|Easy|Simple|Fast|One-Pot|30-Minute|Healthy|Vegan|Vegetarian)\s+(Meal|Dish|Food|Recipe)/i);
    if (match) {
      return match[0]; // Return "Quick Meal", "Easy Dish", etc.
    }
  }
  
  return keywords;
}

/**
 * Generate keyword-optimized header text
 * @param {string} baseHeader - Base header text (e.g., "Ingredients", "Storage Tips")
 * @param {string} recipeKeywords - Extracted recipe keywords
 * @param {string} format - Format type: "for", "with", "plain"
 * @returns {string} - Optimized header
 */
function generateKeywordHeader(baseHeader, recipeKeywords, format = 'for') {
  switch (format) {
    case 'for':
      return `${baseHeader} for ${recipeKeywords}`;
    case 'with':
      return `${baseHeader} with ${recipeKeywords}`;
    case 'to':
      return `${baseHeader} to Make ${recipeKeywords}`;
    case 'plain':
    default:
      return baseHeader;
  }
}

module.exports = {
  extractRecipeKeywords,
  extractKeywordsFallback,
  generateKeywordHeader
};
