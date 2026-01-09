# Gemini 2.5 Flash Prompt Optimization

## Overview
All 17 prompts have been completely rewritten and optimized specifically for **Gemini 2.5 Flash** to generate superior, SEO-optimized recipe article content with emotional storytelling and precise formatting.

## Key Improvements

### 1. **Detailed SEO Requirements**
- Specific character count ranges for titles (55-68 chars) and descriptions (145-158 chars)
- Recipe name integration formulas
- Strategic keyword placement throughout all sections
- Natural language search optimization for FAQs

### 2. **Emotional Storytelling Approach**
- Nostalgic, first-person narratives
- Self-deprecating humor and personal mistakes
- Sensory-rich descriptions (visual, olfactory, tactile, emotional)
- Memory triggers and emotional connections

### 3. **Precise Word Counts**
Each section now has specific word count targets:
- Introduction: 280-320 words (3 paragraphs)
- Why You'll Love: 140-160 words (6 bullets)
- Anecdote: 110-140 words
- Ingredients: 420-550 words (12-16 items with commentary)
- Instructions: 620-840 words (6-7 steps)
- Critical Tips: 75-105 words (3 tips)
- Storage: 190-230 words
- FAQs: 420-520 words (5 questions)

### 4. **Structured Content Formulas**
Each prompt includes specific formulas:
- **Title**: "[Recipe Name]: [Method] + [Key benefit]. [Emotional hook]!"
- **Ingredient Commentary**: "[Function/purpose]. [Personal insight]. [Substitution note]."
- **Step Content**: Instruction → Why → Sensory cues → Personal tip → Warning → Transition

### 5. **Enhanced HTML Structure**
- Proper IDs for all sections (paragraph-2, paragraph-4, faqs, etc.)
- Class names (txt-xxl, note, icon-wrapper)
- SVG href format (?#note)
- Arrow symbols in FAQs (→)
- Strong tags in instructions

## Changes by Prompt

### PROMPT 1: Title & Metadata
- Added emotional hook requirement
- Specific timing realism guidelines
- SEO formula for description
- Examples provided

### PROMPT 2: Introduction Story  
- Structured 3-paragraph approach
- Memory trigger patterns
- Specific sensory keyword requirements
- Self-deprecating tone guidelines

### PROMPT 3: Why You'll Love This
- 6 specific benefit categories
- Varied sentence structure requirements
- Personality through parenthetical asides
- Exact HTML format with IDs

### PROMPT 4: Mistake/Learning Story
- Specific mistake examples
- Humor and relatability focus
- Present/past tense transition
- Lesson learned framework

### PROMPT 5: Ingredients
- 12-16 ingredient target
- 28-38 word commentary formula
- Grouped categorization strategy
- Personal brand/substitution notes

### PROMPT 6: Instructions
- 6-7 step story arc
- 100-120 words per step
- Language patterns provided
- Action-based titles

### PROMPT 7: Critical Tips
- 3 firm warnings
- 5 tip category types
- Consequence-focused
- Friend-warning tone

### PROMPT 8: Kitchen Reflection
- 6-sentence structure
- Mess vs. reward contrast
- Sensory keyword categories
- Contemplative tone

### PROMPT 9: Storage
- 3-part structure
- Personal mistake inclusion
- Specific duration guidance
- Make-ahead strategies

### PROMPT 10: Ingredient Swaps
- 4-5 prioritized swaps
- Change impact descriptions
- Personal testing notes
- Dietary term integration

### PROMPT 11: Serving Suggestions
- 5-part serving idea structure
- Beverage pairing specifics
- Occasion context
- Personal favorite section

### PROMPT 12: Story Behind Recipe
- Cultural/historical context
- Innovation explanation
- Personal connection narrative
- Temporal context requirement

### PROMPT 13: Pro Tips
- Advanced techniques only
- Insider knowledge tone
- 5 tip type categories
- Benefit/result focus

### PROMPT 14: Closing Paragraph
- 7-sentence structure
- Accomplishment → journey → reward → invitation
- Community building
- Call to action

### PROMPT 15: FAQs
- 5 questions with 8 coverage categories
- 75-95 word answers
- Personal experience in each
- Honest failure acknowledgment

### PROMPT 16: Equipment & Notes
- Ordered equipment list
- 4-5 flowing notes
- Recipe card style
- Practical reference tone

### PROMPT 17: Nutrition, Allergies & Tags
- Calorie calculation guidelines
- 12-18 strategic tags
- 7 tag categories
- Trending keyword integration

## Function Signature Changes

Several functions now receive different parameters for better context:

```javascript
// OLD
getInstructionsPrompt(contextString, title)
getSwapsPrompt(contextString, title)
getFaqsPrompt(contextString, title)
getNutritionTagsPrompt(contextString, title)

// NEW
getInstructionsPrompt(contextString, ingredientsJson)
getSwapsPrompt(contextString, ingredientsJson)
getFaqsPrompt(contextString, ingredientsJson)
getNutritionTagsPrompt(contextString, ingredientsJson, servings)

// REMOVED title parameter
getCriticalTipsPrompt(contextString)
getProTipsPrompt(contextString)
getEquipmentNotesPrompt(contextString)
```

## Updated Files

1. **src/services/promptService.js** - All 17 prompts rewritten
2. **src/services/geminiService.js** - Function calls updated to match new signatures

## Testing Recommendations

Before deploying, test with:
1. Simple recipe (cookies, smoothie)
2. Complex recipe (layered dessert, multi-component dish)
3. Dietary-specific recipe (vegan, gluten-free)
4. Seasonal recipe (fall pumpkin, summer berry)

Monitor:
- Word count adherence
- HTML structure validity
- SEO element presence
- Emotional tone consistency
- Personal anecdote authenticity

## Expected Output Quality Improvements

✅ More engaging, emotional storytelling
✅ Better SEO performance with precise character limits
✅ Stronger personal voice throughout
✅ More practical, test-kitchen authority
✅ Richer sensory descriptions
✅ More helpful, detailed FAQs
✅ Authentic mistakes and learning moments
✅ Professional yet approachable tone

## Model Recommendation

These prompts are specifically optimized for **Gemini 2.5 Flash**, which excels at:
- Creative content generation
- Following detailed structural requirements
- Maintaining consistent tone
- Generating natural, conversational language
- Balancing emotion with practicality

---

**Note**: The original prompts were more generic. These optimized versions leverage Gemini 2.5 Flash's strengths in creative writing, emotional intelligence, and structured output generation.
