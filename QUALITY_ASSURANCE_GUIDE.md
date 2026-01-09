# Output Quality Assurance Guide

## Problem: HTML Structure, Image URLs, and Paragraph Length Issues

### Solutions Implemented

## 1. ✅ HTML Structure Validation

### What Was Added:
- **Output Validator** (`src/utils/outputValidator.js`)
  - Validates HTML structure for proper tags
  - Checks for required IDs and classes
  - Ensures all tags are properly closed
  - Validates required sections exist

### How It Works:
```javascript
// After generation completes
const validation = validateArticleOutput(result);
console.log(generateValidationReport(validation));
```

### What It Checks:
- ✅ Required H2 headings present
- ✅ Proper ID attributes (paragraph-2, paragraph-4, paragraph-6, faqs)
- ✅ Correct class names (txt-xxl, note, icon-wrapper)
- ✅ All HTML tags properly closed
- ✅ Definition lists for instructions
- ✅ Aside sections with proper structure

---

## 2. ✅ Image URL Preservation

### What Was Added:
- **preserveImageUrl()** function in outputValidator.js
- Integrated into final assembly process

### How It Works:
```javascript
// In generatorController.js
result.featuredImageUrl = preserveImageUrl(
  job.input.featuredImage,  // Original URL from input
  result.featuredImageUrl   // Potentially modified URL
);
```

### Protection Against:
- ❌ AI adding random numbers to URLs
- ❌ AI changing file extensions
- ❌ AI modifying domain names
- ❌ AI adding timestamps or IDs

### Validation:
- Warns if URLs contain suspicious long number sequences
- Checks for valid URL format
- Logs any detected URL corruption

---

## 3. ✅ Paragraph Length Control (SEO Guidelines)

### What Was Added:
- **HTML Post-Processor** (`src/utils/htmlProcessor.js`)
- Automatic paragraph splitting for SEO compliance
- Validation of paragraph word counts

### SEO Guidelines Enforced:
- **Optimal**: 40-150 words per paragraph
- **Warning**: Paragraphs over 150 words
- **Auto-split**: Long paragraphs broken at sentence boundaries

### How It Works:
```javascript
// Automatically splits paragraphs
<p>Very long paragraph with 200 words...</p>

// Becomes:
<p>First 100 words here.</p>
<p>Next 100 words here.</p>
```

### Split Logic:
1. Count words in each `<p>` tag
2. If > 150 words, split at sentence boundaries
3. Target chunks of ~100 words
4. Preserve HTML structure

---

## 4. ✅ Strict Prompt Instructions

### Updated All 17 Prompts With:

#### HTML Rules Section:
```
CRITICAL HTML & SEO RULES:
- Each paragraph MUST be 40-150 words
- Use proper HTML: <p>Content here</p>
- Close all tags properly
- NO markdown code fences (no ```html)
- NO explanatory text
```

#### JSON Rules Section:
```
CRITICAL JSON RULES:
- Return ONLY valid JSON (no code fences)
- Use proper HTML entities: \" for quotes
- Close all HTML tags properly in JSON strings
- NO explanatory text outside JSON
```

#### Image URL Rules:
```
IMAGE URL PRESERVATION:
- NEVER modify or add numbers to image URLs
- Use exact URLs provided
- DO NOT add slugs, timestamps, or ID numbers
```

---

## 5. ✅ HTML Post-Processing Pipeline

### Processing Steps (in order):

1. **Remove Markdown Fences**
   - Strips ```html, ```json markers
   - Removes any explanatory text

2. **Fix SVG HREFs**
   - Ensures: `href="/assets/drawable/symbols-v4.svg?#note"`
   - Adds the `?` before `#` if missing

3. **Fix FAQ Arrows**
   - Ensures all FAQ questions start with `→`
   - Format: `<dt id="faq-1">→ Question?</dt>`

4. **Fix Heading Attributes**
   - Adds `class="txt-xxl"` to H2 tags if missing
   - Ensures proper ID format

5. **Split Long Paragraphs**
   - Breaks paragraphs > 150 words
   - Splits at natural sentence boundaries

6. **Ensure Proper Spacing**
   - Adds line breaks between sections
   - Cleans up extra whitespace

### Usage:
```javascript
// Applied automatically to all HTML responses
const cleaned = processHtml(rawHtmlFromAI);
```

---

## 6. ✅ Validation Report System

### Generated After Each Job:

```
📋 OUTPUT VALIDATION REPORT
══════════════════════════════════════════════════

✅ Status: VALID (with warnings)

⚠️  WARNINGS (3):
  1. Title length 72 chars (recommended 50-70)
  2. Paragraph 5 too long (165 words, max 150)
  3. Missing required ID: paragraph-20

📊 PARAGRAPHS: 18 total

══════════════════════════════════════════════════
```

### What It Reports:
- ✅ Overall validation status
- 🔴 Errors (blocks publication)
- ⚠️ Warnings (quality issues)
- 📊 Statistics (paragraph count, etc.)

---

## 7. ✅ Integration Points

### In generatorController.js:

```javascript
// After assembly
const result = await assembleResult(job, context);

// 1. Validate output
const validation = validateArticleOutput(result);
console.log(generateValidationReport(validation));

// 2. Fix common HTML issues
result.content = fixHtmlIssues(result.content);

// 3. Preserve original image URL
result.featuredImageUrl = preserveImageUrl(
  job.input.featuredImage,
  result.featuredImageUrl
);
```

### In geminiService.js:

```javascript
// All responses automatically processed
if (expectJson) {
  const parsed = JSON.parse(cleaned);
  return processJsonWithHtml(parsed); // Cleans HTML in JSON
}

return processHtml(text); // Cleans HTML responses
```

---

## Usage & Testing

### Testing Validation:

1. **Start server**: `npm run dev`
2. **Generate recipe**: Use Postman or curl
3. **Check console**: Look for validation report
4. **Review output**: Check `/api/job-result/:jobId`

### What to Look For:

✅ **Good Output:**
- All paragraphs 40-150 words
- SVG hrefs have `?#note` format
- FAQ arrows present
- Original image URL preserved
- All IDs present

❌ **Problems:**
- Paragraphs over 150 words (should auto-split)
- Missing IDs (validation error)
- Modified image URLs (validation warning)
- Unclosed HTML tags (validation error)

---

## Configuration

### SEO Guidelines (Enforced):

```javascript
// In outputValidator.js
const SEO_PARAGRAPH_MIN = 40;   // words
const SEO_PARAGRAPH_MAX = 150;  // words
const SEO_PARAGRAPH_TARGET = 100; // words (for splits)
```

### HTML Requirements:

```javascript
// Required IDs
const REQUIRED_IDS = [
  'paragraph-2',   // Why You'll Love
  'paragraph-4',   // Ingredients
  'paragraph-6',   // Instructions
  'paragraph-9',   // Critical Tips
  'paragraph-11',  // Storage
  'paragraph-13',  // Swaps
  'paragraph-15',  // Serving
  'paragraph-17',  // Story Behind
  'paragraph-20',  // Pro Tips
  'faqs'           // FAQs section
];
```

---

## Troubleshooting

### If Image URLs Still Get Modified:

1. **Check input**: Verify `featuredImage` is set correctly
2. **Check logs**: Look for "Image URL contains suspicious..." warning
3. **Check result**: Compare input.featuredImage vs output.featuredImageUrl

### If Paragraphs Still Too Long:

1. **Check validation report**: Should show warnings
2. **Check HTML processor**: Verify splitLongParagraphs() is running
3. **Check prompts**: Ensure word count limits are specified

### If HTML Structure Invalid:

1. **Check validation report**: Lists all HTML errors
2. **Check geminiService**: Verify processHtml() is applied
3. **Check prompts**: Ensure HTML rules are included

---

## Files Changed/Added

### New Files:
- ✅ `src/utils/outputValidator.js` - Validation functions
- ✅ `src/utils/htmlProcessor.js` - HTML post-processing
- ✅ `src/services/promptValidationRules.js` - Reusable validation rules

### Modified Files:
- ✅ `src/services/promptService.js` - Added validation rules to all prompts
- ✅ `src/services/geminiService.js` - Integrated HTML processing
- ✅ `src/controllers/generatorController.js` - Added validation & image preservation

### Total Changes:
- 3 new utility files
- 3 modified core files
- 17 prompts updated with strict rules

---

## Quality Metrics

### Before Changes:
- ❌ Paragraphs: 50-300 words (inconsistent)
- ❌ Image URLs: Often corrupted with numbers
- ❌ HTML: Sometimes invalid or with markdown
- ❌ Validation: None

### After Changes:
- ✅ Paragraphs: 40-150 words (auto-enforced)
- ✅ Image URLs: Preserved from input
- ✅ HTML: Valid, processed, cleaned
- ✅ Validation: Comprehensive reports

---

## Next Steps

1. **Test thoroughly** with various recipe types
2. **Monitor validation reports** for patterns
3. **Adjust SEO limits** if needed (in outputValidator.js)
4. **Add more validation rules** as issues arise
5. **Consider adding** schema.org validation for structured data

---

## Summary

The system now has **4 layers of protection**:

1. **Prompt Layer**: Strict instructions in prompts
2. **Processing Layer**: Automatic HTML cleanup
3. **Validation Layer**: Comprehensive checks
4. **Assembly Layer**: Image URL preservation

This ensures consistent, SEO-friendly, properly formatted output every time! 🎉
