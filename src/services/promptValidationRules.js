/**
 * Common validation rules for all prompts
 */

const HTML_VALIDATION_RULES = `
CRITICAL HTML RULES (MUST FOLLOW):
1. Return ONLY pure HTML - NO markdown code fences, NO explanations
2. Use double quotes for all HTML attributes: id="value" class="value"
3. Close ALL tags properly: <p>text</p>, <li>item</li>
4. Keep paragraphs under 150 words (40-150 words ideal for SEO)
5. Use proper HTML entities: &amp; for &, &lt; for <, &gt; for >
6. SVG href format: href="/assets/drawable/symbols-v4.svg?#note" (with ?)
7. Never add numbers or random characters to URLs
8. Preserve exact spacing and line breaks within content
9. Use semantic HTML: <strong> for emphasis, <em> for italic
10. IDs must be lowercase with hyphens: id="paragraph-2"
`;

const PARAGRAPH_LENGTH_RULES = `
PARAGRAPH LENGTH REQUIREMENTS:
- Each <p> tag should contain 40-150 words (SEO optimal)
- If content exceeds 150 words, split into multiple <p> tags
- Break at natural transition points (topic shifts, new ideas)
- Use transitional phrases when splitting paragraphs
- Example split: "...end of thought.</p>\n<p>New thought begins..."
`;

const IMAGE_URL_RULES = `
IMAGE URL PRESERVATION:
- NEVER modify or add numbers to image URLs
- Use exact URLs provided in context
- If no URL provided, use empty string ""
- Format: "https://example.com/image.jpg" (full URL)
- DO NOT add slugs, timestamps, or ID numbers
- DO NOT change file extensions
`;

const JSON_OUTPUT_RULES = `
JSON OUTPUT REQUIREMENTS:
1. Return ONLY valid JSON - NO markdown, NO code fences
2. Use double quotes for all keys and string values
3. Escape special characters: \" for quotes, \n for newlines
4. No trailing commas in objects or arrays
5. Boolean values: true/false (lowercase, no quotes)
6. Null values: null (lowercase, no quotes)
7. Numbers: no quotes around numeric values
8. Test JSON validity before returning
`;

/**
 * Get validation footer for HTML-generating prompts
 */
const getHtmlValidationFooter = () => {
  return `\n${HTML_VALIDATION_RULES}\n${PARAGRAPH_LENGTH_RULES}\n\nReturn ONLY the HTML content, no explanations, no code fences.`;
};

/**
 * Get validation footer for JSON-generating prompts
 */
const getJsonValidationFooter = () => {
  return `\n${JSON_OUTPUT_RULES}\n\nReturn ONLY valid JSON, no explanations, no markdown code blocks.`;
};

/**
 * Get validation footer for JSON with HTML
 */
const getJsonHtmlValidationFooter = () => {
  return `\n${HTML_VALIDATION_RULES}\n${PARAGRAPH_LENGTH_RULES}\n${JSON_OUTPUT_RULES}\n\nReturn ONLY valid JSON with properly formatted HTML, no explanations, no code fences.`;
};

module.exports = {
  HTML_VALIDATION_RULES,
  PARAGRAPH_LENGTH_RULES,
  IMAGE_URL_RULES,
  JSON_OUTPUT_RULES,
  getHtmlValidationFooter,
  getJsonValidationFooter,
  getJsonHtmlValidationFooter
};
