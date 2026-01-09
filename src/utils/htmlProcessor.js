/**
 * HTML Post-Processor - Clean and fix generated HTML
 */

/**
 * Split long paragraphs into multiple shorter ones
 * @param {string} html - HTML content
 * @returns {string} - HTML with split paragraphs
 */
const splitLongParagraphs = (html) => {
  // Find all <p> tags with content
  const paragraphRegex = /<p([^>]*)>(.*?)<\/p>/gs;
  
  return html.replace(paragraphRegex, (match, attributes, content) => {
    // Remove HTML tags and count words
    const textOnly = content.replace(/<[^>]*>/g, '');
    const words = textOnly.trim().split(/\s+/);
    
    // If paragraph is within limits (max 80 words for strict control), return as-is
    if (words.length <= 80) {
      return match;
    }
    
    // Split into chunks of ~60 words maximum
    const chunks = [];
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = content.match(sentenceRegex) || [content];
    
    let currentChunk = '';
    let currentWordCount = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).length;
      
      if (currentWordCount + sentenceWords > 70 && currentWordCount > 0) {
        // Start new chunk
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
        currentWordCount = sentenceWords;
      } else {
        currentChunk += ' ' + sentence;
        currentWordCount += sentenceWords;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    // Return multiple <p> tags
    return chunks.map(chunk => `<p${attributes}>${chunk}</p>`).join('\n');
  });
};

/**
 * Fix SVG href format
 * @param {string} html - HTML content
 * @returns {string} - Fixed HTML
 */
const fixSvgHrefs = (html) => {
  // Ensure SVG hrefs have the ? before #
  return html.replace(
    /href=["']\/assets\/drawable\/symbols-v4\.svg#/g,
    'href="/assets/drawable/symbols-v4.svg?#'
  );
};

/**
 * Fix arrow symbols in FAQs
 * @param {string} html - HTML content
 * @returns {string} - Fixed HTML
 */
const fixFaqArrows = (html) => {
  // Ensure FAQ questions start with arrow
  return html.replace(
    /<dt([^>]*id="faq-\d+"[^>]*)>(?!→)\s*/g,
    '<dt$1>→ '
  );
};

/**
 * Fix heading IDs and classes
 * @param {string} html - HTML content
 * @returns {string} - Fixed HTML
 */
const fixHeadingAttributes = (html) => {
  let fixed = html;
  
  // Ensure txt-xxl class on main h2 headings
  fixed = fixed.replace(
    /<h2(?![^>]*class=["'][^"']*txt-xxl[^"']*["'])([^>]*)>/g,
    '<h2 class="txt-xxl"$1>'
  );
  
  return fixed;
};

/**
 * Remove AI-sounding words and phrases
 * @param {string} text - Text content
 * @returns {string} - Cleaned text
 */
const removeAIWords = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  const aiPatterns = [
    { pattern: /\bdelve into\b/gi, replacement: 'explore' },
    { pattern: /\bdelving\b/gi, replacement: 'exploring' },
    { pattern: /\bmeticulously\b/gi, replacement: 'carefully' },
    { pattern: /\bembark on\b/gi, replacement: 'start' },
    { pattern: /\bembark upon\b/gi, replacement: 'start' },
    { pattern: /\belevate your\b/gi, replacement: 'improve your' },
    { pattern: /\bunlock the\b/gi, replacement: 'discover the' },
    { pattern: /\brealm of\b/gi, replacement: 'world of' },
    { pattern: /\btapestry of\b/gi, replacement: 'mix of' },
    { pattern: /\bbeacon of\b/gi, replacement: 'example of' },
    { pattern: /\btestament to\b/gi, replacement: 'proof of' },
    { pattern: /\bjourney into\b/gi, replacement: 'dive into' },
    { pattern: /\blandscape of\b/gi, replacement: 'variety of' },
    { pattern: /\bparadigm shift\b/gi, replacement: 'change' },
    { pattern: /\btransformative\b/gi, replacement: 'amazing' },
    { pattern: /\bgame-changer\b/gi, replacement: 'great' }
  ];
  
  let cleaned = text;
  aiPatterns.forEach(({ pattern, replacement }) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  
  return cleaned;
};

/**
 * Remove markdown code fences if present
 * @param {string} content - Content that might have markdown
 * @returns {string} - Cleaned content
 */
const removeMarkdownFences = (content) => {
  if (typeof content !== 'string') return content;
  
  // Remove ```html, ```json, ``` markers
  let cleaned = content.replace(/```(?:html|json)?\s*/g, '');
  
  // Remove any leading/trailing explanatory text
  // Keep only content between tags or JSON structure
  if (cleaned.trim().startsWith('<')) {
    // HTML content - find first < and last >
    const firstTag = cleaned.indexOf('<');
    const lastTag = cleaned.lastIndexOf('>');
    if (firstTag !== -1 && lastTag !== -1) {
      cleaned = cleaned.substring(firstTag, lastTag + 1);
    }
  } else if (cleaned.trim().startsWith('{') || cleaned.trim().startsWith('[')) {
    // JSON content - extract JSON only
    try {
      // Find the JSON bounds
      let depth = 0;
      let start = -1;
      let end = -1;
      
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        if (char === '{' || char === '[') {
          if (start === -1) start = i;
          depth++;
        } else if (char === '}' || char === ']') {
          depth--;
          if (depth === 0 && start !== -1) {
            end = i;
            break;
          }
        }
      }
      
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }
    } catch (e) {
      // If parsing fails, return as-is
    }
  }
  
  return cleaned.trim();
};

/**
 * Ensure proper paragraph spacing
 * @param {string} html - HTML content
 * @returns {string} - Fixed HTML
 */
const ensureParagraphSpacing = (html) => {
  // Add line breaks between paragraphs if missing
  let fixed = html.replace(/<\/p>\s*<p/g, '</p>\n<p');
  
  // Add line breaks between sections
  fixed = fixed.replace(/<\/aside>\s*<h2/g, '</aside>\n\n<h2');
  fixed = fixed.replace(/<\/p>\s*<h2/g, '</p>\n\n<h2');
  fixed = fixed.replace(/<\/dl>\s*<h2/g, '</dl>\n\n<h2');
  
  return fixed;
};

/**
 * Complete HTML post-processing
 * @param {string} html - Raw HTML from AI
 * @returns {string} - Cleaned and validated HTML
 */
const processHtml = (html) => {
  if (!html || typeof html !== 'string') return html;
  
  let processed = html;
  
  // 1. Remove markdown fences
  processed = removeMarkdownFences(processed);
  
  // 2. Remove AI words
  processed = removeAIWords(processed);
  
  // 3. Fix SVG hrefs
  processed = fixSvgHrefs(processed);
  
  // 3. Fix FAQ arrows
  processed = fixFaqArrows(processed);
  
  // 4. Fix heading attributes
  processed = fixHeadingAttributes(processed);
  
  // 5. Split long paragraphs
  processed = splitLongParagraphs(processed);
  
  // 6. Ensure proper spacing
  processed = ensureParagraphSpacing(processed);
  
  // 7. Remove extra whitespace
  processed = processed.replace(/\s{2,}/g, ' ');
  processed = processed.replace(/>\s+</g, '><');
  
  return processed.trim();
};

/**
 * Process JSON response that contains HTML
 * @param {Object} jsonData - JSON object with HTML fields
 * @returns {Object} - Processed JSON
 */
const processJsonWithHtml = (jsonData) => {
  if (!jsonData || typeof jsonData !== 'object') return jsonData;
  
  const processed = { ...jsonData };
  
  // Process common HTML fields
  const htmlFields = ['ingredientsHtml', 'instructionsHtml', 'faqsHtml'];
  
  htmlFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      processed[field] = processHtml(processed[field]);
    }
  });
  
  return processed;
};

module.exports = {
  splitLongParagraphs,
  fixSvgHrefs,
  fixFaqArrows,
  fixHeadingAttributes,
  removeMarkdownFences,
  removeAIWords,
  ensureParagraphSpacing,
  processHtml,
  processJsonWithHtml
};
