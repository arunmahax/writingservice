/**
 * Prompt Service - All prompt templates for recipe generation
 * OPTIMIZED FOR GEMINI 2.5 FLASH
 */

/**
 * PROMPT 1: Title & Metadata Generation (SEO-Optimized)
 */
const getTitleMetadataPrompt = (input) => {
  return `You are an expert recipe SEO content strategist. Generate metadata for a recipe article.

INPUT:
Recipe Name: ${input.title}

GENERATE (in JSON format):

{
  "title": "Main title with emotional hook and recipe name (55-68 characters)",
  "shortTitle": "Concise version for navigation (25-45 characters)",
  "description": "Meta description with action words, benefit, and recipe name (145-158 characters)",
  "difficulty": "Beginner|Intermediate|advanced",
  "cuisine": "Specific cuisine type",
  "dietary": "Primary dietary category",
  "prepTime": "15-45 Minutes",
  "cookTime": "10-60 Minutes", 
  "totalTime": "Calculate sum",
  "servings": "4-24 Servings"
}

SEO REQUIREMENTS:
- Title MUST include the recipe name + emotional descriptor
- Title examples: "Chewy [Recipe]: Autumn's Best Treat", "The Ultimate [Recipe] You'll Make Again"

- Description MUST follow this EXACT format:
  "How to make [recipe name with key ingredients/details] that [benefit/result]."
  
- Description formula: Start with "How to make", mention 2-3 key ingredients or details, end with benefit
- Description examples:
  * "How to make high-protein breakfast bowls with sweet and spicy chicken, roasted vegetables, and scrambled eggs that stay fresh all week."
  * "How to make protein-packed spinach egg muffins with bacon and cheese, perfect for meal prep and grab-and-go breakfasts."
  * "How to make creamy overnight oats with pumpkin spice and maple syrup that taste like fall in a jar."
  
- IMPORTANT: Keep under 158 characters total
- Include specific ingredients or key details (not just recipe name)
- End with practical benefit: "stay fresh", "perfect for meal prep", "ready in 30 minutes", "your family will love"

TIMING REALISM:
- Baking: typically 10-25 min
- Stovetop: 15-30 min
- Prep for beginners: add 10 min
- Complex recipes: 30-45 min prep

Return ONLY valid JSON.`;
};

/**
 * PROMPT 2: Introduction Story (Emotional Hook - 280-320 words)
 */
const getIntroductionPrompt = (context) => {
  return `CONTEXT:
${context}

Write a brief, first-person introduction (100-120 words TOTAL) that hooks readers.

STRUCTURE (3 short paragraphs):

PARAGRAPH 1 (30-40 words):
- Quick memory or moment
- One sensory detail
- Introduce recipe naturally

PARAGRAPH 2 (40-50 words):
- First attempt story (what went wrong)
- Keep it brief and relatable
- One sentence of humor

PARAGRAPH 3 (30-40 words):
- What recipe means now
- Brief emotional statement

SEO REQUIREMENTS (MANDATORY):
- Use exact recipe name 2-3 times naturally
- Include these keyword types:
  * 2 sensory keywords (warm, cozy, aromatic, golden, soft, crispy, buttery)
  * 1 seasonal keyword (autumn, fall, winter, spring, summer, holiday)
  * 1 emotional keyword (nostalgic, comforting, delightful, satisfying)
- Total word count: 100-120 words (STRICT)
- AVOID AI WORDS: delve, meticulously, embark, elevate, unlock, realm, tapestry, testament

TONE: Warm, nostalgic, self-deprecating, conversational
VOICE: First person ("I", "my", "me")
FORMAT: 3 paragraphs in HTML <p> tags

CRITICAL HTML & SEO RULES:
- Each paragraph MUST be 40-150 words (split if longer)
- Use proper HTML: <p>Content here</p>
- Close all tags properly
- NO markdown code fences (no \`\`\`html)
- NO explanatory text
- Preserve line breaks between paragraphs

Return ONLY HTML content, no explanations.`;
};

/**
 * PROMPT 3: Why You'll Love This (6 bullets, 140-160 words total)
 */
const getWhyLovePrompt = (context) => {
  return `CONTEXT:
${context}

Generate exactly 6 bullet points explaining why readers will love this recipe.

REQUIREMENTS PER BULLET (8-10 words ONLY - STRICT):
Each bullet MUST be exactly 8-10 words. Count carefully.

EXAMPLES:
- "Ready in thirty minutes, perfect for busy weeknight dinners." (9 words)
- "Kids devour these, even pickiest eaters ask for seconds." (9 words)
- "Make ahead and freeze for stress-free party planning success." (10 words)

CATEGORIES (choose 6):
1. Time/ease benefit
2. Taste/appeal factor  
3. Make-ahead convenience
4. Simple ingredients
5. Versatility/occasions
6. Guaranteed success

AVOID AI WORDS: delve, meticulously, embark, elevate, unlock, realm, tapestry

EXACT HTML FORMAT:
<aside id="paragraph-2" class="note">
<h2 class="icon-wrapper txt-xl">
<svg class="icon icon--medium"><use href="/assets/drawable/symbols-v4.svg?#note"></use></svg>
<span>Why You'll Love This Recipe</span>
</h2>
<ul>
<li>First benefit with specific detail and personality.</li>
<li>Second benefit mentioning who it appeals to.</li>
<li>Third benefit about the feeling or comfort factor.</li>
<li>Fourth benefit about practical usage scenarios.</li>
<li>Fifth benefit about flexibility or prep-ahead.</li>
<li>Sixth benefit tying to nostalgia or seasonal emotion.</li>
</ul>
</aside>

SEO: Include recipe name once in natural context
Return ONLY the complete HTML aside block.

CRITICAL HTML RULES:
- Proper HTML structure with all tags closed
- Use id="paragraph-2" (exact format)
- SVG href must be: href="/assets/drawable/symbols-v4.svg?#note" (with ?)
- NO markdown code fences
- NO explanatory text`;
};

/**
 * PROMPT 4: Mistake/Learning Story (50-60 words)
 */
const getAnecdotePrompt = (context) => {
  return `CONTEXT:
${context}

Write a brief, relatable anecdote about making this recipe (50-60 words).

STRUCTURE (1 paragraph):
- Quick scene: what happened
- One specific detail (mess or mistake)
- Your reaction
- Brief lesson

TONE: Honest, relatable
AVOID AI WORDS: delve, meticulously, embark, elevate, unlock

LENGTH: 50-60 words (STRICT)
FORMAT: Single <p> tag

SEO: Use recipe name once
VOICE: First person past tense, ending with present tense lesson

CRITICAL HTML & SEO RULES:
- Keep paragraph under 150 words (this should be 110-140)
- Use proper HTML: <p>Content here</p>
- Close all tags properly
- NO markdown code fences
- NO explanatory text

Return ONLY the HTML content, no explanation.`;
};

/**
 * PROMPT 5: Ingredients List with Commentary (12-16 ingredients, 420-550 words)
 */
const getIngredientsPrompt = (context, title) => {
  return `CONTEXT:
${context}

Generate a complete ingredients list for "${title}" with personal commentary.

MANDATORY: You MUST create EXACTLY 12-16 ingredients. No less than 12, no more than 16.

STEP 1: Analyze the recipe type and create 12-16 realistic, specific ingredients.

RECIPE TYPE EXAMPLES:
- Cookies/Baked goods: flour, sugar, butter, eggs, leavening, spices, mix-ins, etc.
- Pasta/Stir-fry: protein, vegetables (multiple), sauce components, seasonings, garnish
- Soup: broth, protein, vegetables (4-6 types), aromatics, herbs, seasonings
- Overnight Oats: oats, milk, protein powder, sweetener, fruits, nuts, spices, toppings

GROUPS STRATEGY (MUST total 12-16):
- Group 1: Base/Main components (5-6 ingredients)
- Group 2: Flavor builders (4-5 ingredients)  
- Group 3: Seasonings/Spices (2-3 ingredients)
- Group 4: Finishing/Toppings (2-3 ingredients)

IMPORTANT: Be specific! Instead of "vegetables", list: carrots, celery, onions, bell peppers, etc.

STEP 2: For EACH ingredient write 15-20 word commentary including:
- What it does (function)
- Why it matters
- Quick tip OR brand preference

COMMENTARY FORMULA (15-20 words total):
"[Function]. [Why it matters]. [Quick tip]."

Example:
"Provides richness and tender texture. Use unsalted for better salt control."

MEASUREMENT PRECISION:
- Use cups for dry ingredients
- Use tablespoons/teaspoons for small amounts
- Include (softened), (room temperature), (packed) specifications
- Add (100%, not X) warnings where relevant

OUTPUT FORMAT:

JSON for database:
{
  "ingredientsJson": [
    {
      "group": "Descriptive Group Name",
      "items": [
        "1 cup (2 sticks) unsalted butter, softened",
        "measurement ingredient, preparation"
      ]
    }
  ],
  "ingredientsHtml": "<h2 id='paragraph-4' class='txt-xxl'>Ingredients</h2><ul><li><strong>Ingredient Name:</strong> Personal commentary here...</li></ul>"
}

SEO REQUIREMENTS:
- H2 must be: "Ingredients for ${title}" (id='paragraph-4' class='txt-xxl')
- Use recipe keywords naturally in 1-2 ingredient commentaries
- Include keywords: "essential", "star", "base", "foundation"

CRITICAL JSON & HTML RULES:
- Return ONLY valid JSON (no code fences, no markdown)
- HTML in ingredientsHtml: each <p> must be 40-150 words
- Use proper HTML entities in JSON: \\" for quotes
- Close all HTML tags properly
- H2 id must be: id='paragraph-4'
- H2 class must be: class='txt-xxl'
- NO explanatory text outside JSON

Return ONLY valid JSON with both fields.`;
};

/**
 * PROMPT 6: Step-by-Step Instructions (6-7 steps, 620-840 words)
 */
const getInstructionsPrompt = (context, title) => {
  return `CONTEXT:
${context}

Generate detailed, conversational cooking instructions for "${title}".

MANDATORY: Create EXACTLY 6-7 steps. Each step must be complete and actionable.

CREATE 6-7 STEPS following this arc:
1. **Prep/Base** - First mixing or prep (REQUIRED)
2. **Combine** - Adding components together (REQUIRED)
3. **Mix/Technique** - Critical mixing or technique step (REQUIRED)
4. **Cook/Bake** - Heat application with temp/time (REQUIRED)
5. **Secondary** - Additional component if needed (OPTIONAL for simple recipes)
6. **Assembly** - Putting together final dish (REQUIRED)
7. **Serve** - Final touches and serving (REQUIRED)

For simple recipes (smoothies, overnight oats): minimum 6 steps
For complex recipes (layered desserts): use all 7 steps

EACH STEP (30-40 words ONLY):

**Title**: 2-3 words max
Examples: "Cream Butter", "Bake Cookies", "Assemble Pies"

**Content** (30-40 words):
- What to do (action)
- How to know it's done (cue)
- One quick tip
- Temperature/time if needed

Keep brief and direct. No lengthy stories.

OUTPUT FORMAT:

JSON for database:
{
  "instructionsJson": [
    {
      "step": 1,
      "title": "Action Title",
      "content": "Detailed conversational instructions with personal touches..."
    }
  ],
  "instructionsHtml": "<h2 id='paragraph-6' class='txt-xxl'>Instructions</h2><dl><dt><strong>Step Title:</strong></dt><dd>Instructions here...</dd></dl>"
}

SEO REQUIREMENTS:
- H2 must be: "How to Make ${title}" (id='paragraph-6' class='txt-xxl')
- MANDATORY: Use "${title}" keywords 3-4 times throughout all steps combined
- Include technical terms naturally (fold, emulsify, caramelize)
- Mention recipe name when describing what you're making

CRITICAL: Steps must be sequential and logical. Ensure timing makes sense.

CRITICAL JSON & HTML RULES:
- Return ONLY valid JSON (no code fences, no markdown)
- Each step content must be 30-40 words (STRICT)
- Use proper HTML entities in JSON: \\" for quotes
- Close all HTML tags properly in instructionsHtml
- H2 id must be: id='paragraph-6'
- H2 class must be: class='txt-xxl'
- <dt> format: <dt><strong>Title:</strong></dt>
- NO explanatory text outside JSON
- AVOID AI WORDS: delve, meticulously, embark, elevate

Return ONLY valid JSON with both fields.`;
};

/**
 * PROMPT 7: Critical Tips Aside (3 tips, 75-105 words total)
 */
const getCriticalTipsPrompt = (context) => {
  return `CONTEXT:
${context}

Generate 3 critical "You Must Know" tips.

EACH TIP (15-20 words ONLY):
- State what to do/avoid
- Brief consequence
- Quick tip

FORMAT: "[Action], otherwise [consequence]. [Tip]."
- Personal reference ("a mistake I made often", "trust me", "which isn't fun")

TIP CATEGORIES (choose 3):
1. **Temperature/Timing Critical** - Chilling, resting, exact temp
2. **Ingredient Quality** - Must use X not Y type
3. **Technique Warning** - Common error that ruins result
4. **Preparation Essential** - Mise en place requirement
5. **Storage/Handling** - How to maintain quality

TONE: Firm but friendly, like a friend warning you

EXACT HTML FORMAT:
<aside id="paragraph-9" class="note">
<h2 class="icon-wrapper txt-xl">
<svg class="icon icon--medium"><use href="/assets/drawable/symbols-v4.svg?#note"></use></svg>
<span>You Must Know</span>
</h2>
<ul>
<li>Don't skip [action], it's a game-changer for [result], a mistake I made [frequency].</li>
<li>Make sure your [ingredient] is [state], otherwise you'll end up with [bad result], which isn't fun, trust me.</li>
<li>Always use [specific thing], not [wrong thing], for the [quality] in these recipes.</li>
</ul>
</aside>

SEO: Include recipe name in one tip
Return ONLY complete HTML aside block.

CRITICAL HTML RULES:
- Proper HTML structure with all tags closed
- Use id="paragraph-9" (exact format)
- SVG href must be: href="/assets/drawable/symbols-v4.svg?#note" (with ?)
- Each <li> should be 25-35 words
- NO markdown code fences
- NO explanatory text`;
};

/**
 * PROMPT 8: Kitchen Reflection (90-115 words)
 */
const getReflectionPrompt = (context) => {
  return `CONTEXT:
${context}

Write a reflective paragraph capturing the experience of making this recipe.

STRUCTURE (1 paragraph, 90-115 words):
- Sentence 1: "There's something so [emotion] about [seeing/smelling/hearing] [specific moment]"
- Sentences 2-3: Describe the messy reality (flour everywhere, something on your face, chaos)
- Sentence 4: Contrast with positive sensory experience (aroma filling house)
- Sentence 5: Emotional payoff moment ("for a moment, all the daily chaos melts away")
- Sentence 6: Closing statement about why you bake/cook

SENSORY KEYWORDS:
- Visual: golden, bubbling, rising, cooling
- Olfactory: aroma, scent, fragrance of cinnamon/spices
- Tactile: warm, soft, crispy
- Emotional: satisfaction, comfort, joy, peace

TONE: Contemplative, grateful, honest about mess but focused on reward
FORMAT: Single <p> tag

SEO: Use recipe name once
VOICE: First person, present or present perfect tense

CRITICAL HTML & SEO RULES:
- Keep paragraph 90-115 words (under 150 word SEO limit)
- Use proper HTML: <p>Content here</p>
- Close all tags properly
- NO markdown code fences
- NO explanatory text

Return ONLY the HTML <p> content.`;
};

/**
 * PROMPT 9: Storage Instructions (90-110 words)
 */
const getStoragePrompt = (context, title) => {
  return `CONTEXT:
${context}

Write brief storage instructions for "${title}" (90-110 words total).

STRUCTURE (2-3 short paragraphs):

**Main Storage (50-60 words)**:
- Container and temperature
- Duration (specific: "3-4 days")
- What happens if wrong
- Spoilage signs

**Make-Ahead (30-40 words)**:
- Prep components ahead?
- How far in advance?
- Assembly timing

**Quick Tips (10-20 words)**:
- Layering/reheating advice

HTML FORMAT:
<h2 id="paragraph-11" class="txt-xxl">How to Store ${title}</h2>
<p>Storage paragraph...</p>

SEO REQUIREMENTS:
- MUST use keywords: "store", "refrigerate", "airtight", "fresh"
- Word count: 90-110 words (STRICT)
- AVOID AI WORDS: delve, meticulously, embark, elevate

TONE: Practical, helpful, includes one "don't do what I did" moment
Return ONLY complete HTML section (h2 + paragraphs).

CRITICAL HTML & SEO RULES:
- Split content into multiple <p> tags (each 40-150 words)
- Use proper HTML with all tags closed
- H2 id must be: id="paragraph-11"
- H2 class must be: class="txt-xxl"
- NO markdown code fences
- NO explanatory text`;
};
/**
 * PROMPT 10: Ingredient Swaps (170-210 words)
 */
const getSwapsPrompt = (context, ingredientsJson) => {
  return `CONTEXT:
${context}
Original Ingredients: ${JSON.stringify(ingredientsJson)}

Write an ingredient substitution guide.

STRUCTURE:

**Opening (20-30 words)**: "Life happens" acknowledgment

**4-5 Key Swaps (120-150 words total)**:
For each major ingredient:
- Original → Substitute
- How result changes (texture, flavor, appearance)
- When to use this swap vs when to avoid
- Personal experience note ("I tried X once when...")

SWAP PRIORITY:
1. Most common pantry shortage
2. Dietary restriction substitution
3. Budget-friendly alternative
4. Flavor variation option
5. Seasonal availability swap

**Closing Note (30-40 words)**: One swap that surprised you or worked better than expected

HTML FORMAT:
<h2 id="paragraph-13" class="txt-xxl">Ingredient Swaps</h2>
<p>Opening + swap details with personal testing notes...</p>

SEO REQUIREMENTS:
- H2 must be: "Ingredient Swaps" (id="paragraph-13" class="txt-xxl")
- Use "substitute", "alternative", "instead of", "swap" keywords
- Include recipe name once in content
- Mention dietary terms if relevant (gluten-free, dairy-free, vegan)

TONE: Practical, test-kitchen authority, honest about compromises
Return ONLY complete HTML section.`;
};

/**
 * PROMPT 11: Serving Suggestions (80-100 words)
 */
const getServingPrompt = (context, title) => {
  return `CONTEXT:
${context}

Write brief serving suggestions for "${title}" (80-100 words total).

STRUCTURE (2 paragraphs):

**Serving Ideas (50-60 words)**:
- Simple serving method
- Presentation tip for occasions
- Temperature recommendation
- One pairing (beverage or side)

**Personal Favorite (30-40 words)**:
- How you prefer to serve
- Why it works

HTML FORMAT:
<h2 id="paragraph-15" class="txt-xxl">What to Serve with ${title}</h2>
<p>Serving ideas...</p>
<p>Personal favorite...</p>

SEO REQUIREMENTS:
- MUST use: "serve", "pair", "perfect", "enjoy"
- Word count: 80-100 words (STRICT)
- AVOID AI WORDS: delve, elevate, embark

TONE: Enthusiastic, social, focused on experience
Return ONLY complete HTML section.`;
};
/**
 * PROMPT 12: Story Behind Recipe (210-260 words)
 */
const getStoryBehindPrompt = (context, title) => {
  return `CONTEXT:
${context}

Write the cultural and personal significance of "${title}".

STRUCTURE:

**Recipe Category Context (60-80 words)**:
- Describe the broader category this recipe belongs to
- Brief history or cultural origin
- When/how it became popular
- Commercial or homemade tradition

**This Recipe's Innovation (80-100 words)**:
- What makes this version different/special
- What classic elements were adapted
- Seasonal or modern twist explanation
- Why the combination works

**Personal Connection (60-80 words)**:
- What this recipe represents to you
- Memories or traditions it connects to
- Why you wanted to create/share it
- Broader theme (celebration of season, comfort, nostalgia)

HTML FORMAT:
<h2 id="paragraph-17" class="txt-xxl">The Story Behind This Recipe</h2>
<p>Historical context paragraph...</p>
<p>Personal connection paragraph...</p>

SEO REQUIREMENTS:
- H2 must be: "The Story Behind This Recipe" (id="paragraph-17" class="txt-xxl")
- Use "tradition", "history", "origin", "inspired by" keywords
- Include recipe name naturally 2-3 times in content
- Mention cultural cuisine if relevant
- Include temporal context (mid-20th century, for decades, etc.)

TONE: Informative but personal, reverent but not academic
Return ONLY complete HTML section.`;
};

/**
 * PROMPT 13: Pro Tips Aside (3 tips, 60-90 words total)
 */
const getProTipsPrompt = (context) => {
  return `CONTEXT:
${context}

Generate 3 advanced "Pro Tips".

EACH TIP (12-15 words):
- One advanced technique or trick
- Include the benefit
- Keep brief and actionable

TIP TYPES (choose 3):
1. **Ingredient Enhancement** - Toast, brown, reduce for deeper flavor
2. **Technique Upgrade** - Professional method (tempering, resting, folding)
3. **Presentation** - Plating or finishing touch
4. **Variation** - Size or flavor twist for different occasions
5. **Efficiency** - Make-ahead or batch preparation strategy

TONE: Insider knowledge, chef's secret, test-kitchen discovery

EXACT HTML FORMAT:
<aside id="paragraph-20" class="note">
<h2 class="icon-wrapper txt-xl">
<svg class="icon icon--medium"><use href="/assets/drawable/symbols-v4.svg?#note"></use></svg>
<span>Pro Tips</span>
</h2>
<ul>
<li>For extra [quality] in your recipe, [advanced technique], it [benefit].</li>
<li>Try making mini versions for [occasion], they're [adjective] and perfectly [characteristic].</li>
<li>If you want [result], [advanced method] the [step/component]—the difference is [impact]!</li>
</ul>
</aside>

SEO REQUIREMENTS:
- Include recipe name at least once
- Each tip 12-15 words (STRICT)
- AVOID AI WORDS: delve, elevate, embark, unlock
Return ONLY complete HTML aside block.

CRITICAL HTML RULES:
- Proper HTML structure with all tags closed
- Use id="paragraph-20" (exact format)
- SVG href must be: href="/assets/drawable/symbols-v4.svg?#note" (with ?)
- Each <li> should be 20-30 words
- NO markdown code fences
- NO explanatory text`;
};

/**
 * PROMPT 14: Closing Paragraph (105-135 words)
 */
const getClosingPrompt = (context, title) => {
  return `CONTEXT:
${context}

Write a warm, encouraging closing paragraph.

STRUCTURE (1 paragraph):
- Sentence 1: "And there you have it, my beloved ${title}!"
- Sentences 2-3: Reflect on the journey (first messy attempt to now)
- Sentences 4-5: Describe the final sensory/emotional experience
- Sentence 6: Express hope reader will try it
- Sentence 7: Call to action to share results

EMOTIONAL ARC:
- Start with accomplishment
- Acknowledge the learning process
- Celebrate the sensory reward
- Invite reader into the community of makers

TONE: Warm, accomplished, inviting, grateful
FORMAT: Single <p> tag

SEO: Use recipe name twice (opening and once more)
VOICE: First person with direct address ("you", "your")

CRITICAL HTML & SEO RULES:
- Keep paragraph 105-135 words (under 150 word SEO limit)
- Use proper HTML: <p>Content here</p>
- Close all tags properly
- NO markdown code fences
- NO explanatory text

Return ONLY the HTML <p> content.`;
};

/**
 * PROMPT 15: FAQs Section (5 questions, 420-520 words total)
 */
const getFaqsPrompt = (context, ingredientsJson) => {
  return `CONTEXT:
${context}

Generate 5 frequently asked questions with detailed answers.

QUESTION FORMULA (10-18 words each):
- Start with → Can I / How do I / What if / Why do
- Address specific concern or variation
- Include recipe name in 2-3 questions

FAQ COVERAGE (select 5):
1. **Ingredient Substitution** - Can I use X instead of Y?
2. **Technique Troubleshooting** - How do I prevent/fix X problem?
3. **Dietary Modification** - Can I make this gluten-free/vegan/etc?
4. **Storage/Shelf Life** - How long do these last?
5. **Make-Ahead/Freezing** - Can I prep/freeze these?
6. **Equipment Alternative** - What if I don't have X tool?
7. **Scaling** - Can I double/halve the recipe?
8. **Timing** - Can I speed this up?

ANSWER FORMULA (30-40 words each):
- Direct response first
- Brief explanation
- One practical tip

Keep answers concise and helpful.

OUTPUT FORMAT:

You MUST return a JSON object with EXACTLY this structure:
{
  "faqsJson": [
    {
      "question": "Question text here?",
      "answer": "Detailed personal answer with tips and experience..."
    }
  ],
  "faqsHtml": "<h2 id=\\"faqs\\" class=\\"txt-xxl\\">Frequently Asked Questions</h2><dl><dt id=\\"faq-1\\">→ Question?</dt><dd><p>Answer...</p></dd></dl>"
}

The faqsHtml should use this EXACT format with H2 heading and arrow symbol (→) before each question:
<h2 id="faqs" class="txt-xxl">Frequently Asked Questions</h2>
<dl>
<dt id="faq-1">→ Question 1?</dt>
<dd><p>Detailed answer with personal experience...</p></dd>
<dt id="faq-2">→ Question 2?</dt>
<dd><p>Detailed answer...</p></dd>
<dt id="faq-3">→ Question 3?</dt>
<dd><p>Answer...</p></dd>
<dt id="faq-4">→ Question 4?</dt>
<dd><p>Answer...</p></dd>
<dt id="faq-5">→ Question 5?</dt>
<dd><p>Answer...</p></dd>
</dl>

SEO REQUIREMENTS:
- H2 must be: "Frequently Asked Questions" (id="faqs" class="txt-xxl")
- Each question should be natural language (how people actually search)
- Include recipe name naturally in 2-3 questions
- Use keywords: "make", "store", "freeze", "substitute", "prevent"
- Answer honestly, including when something won't work

TONE: Helpful friend who's tested everything, honest about failures
Return ONLY the JSON object, no explanation or markdown code blocks.

CRITICAL JSON & HTML RULES:
- Return ONLY valid JSON (no code fences like \`\`\`json)
- Each answer must be 30-40 words (STRICT)
- Use proper HTML entities in JSON: \\" for quotes
- H2 id must be: id="faqs"
- H2 class must be: class="txt-xxl"
- <dt> format: <dt id="faq-1">→ Question?</dt> (with arrow symbol)
- <dd> format: <dd><p>Answer here</p></dd>
- Close all HTML tags properly
- NO explanatory text outside JSON
- AVOID AI WORDS: delve, meticulously, embark, elevate, unlock`;
};

/**
 * PROMPT 16: Equipment & Notes
 */
const getEquipmentNotesPrompt = (context) => {
  return `CONTEXT:
${context}

Generate equipment list and recipe notes.

PART 1: EQUIPMENT LIST
Comprehensive comma-separated list of ALL tools needed, ordered by:
1. Large equipment first (stand mixer, oven, food processor)
2. Measuring tools
3. Prep tools (bowls, spatulas)
4. Baking/cooking vessels
5. Finishing tools

Example format: "Stand mixer or hand mixer, large mixing bowls, baking sheets, parchment paper, cooling rack, measuring cups and spoons, spatula, small ice cream scoop."

PART 2: RECIPE NOTES (4-6 sentences)
Write 4-6 concise notes (15-25 words each), covering:

1. **Critical Technique** - Most important tip or what to avoid
2. **Storage** - How to store, container type, and duration
3. **Substitution** - One key ingredient swap that works well
4. **Serving** - Best temperature, timing, or pairing suggestion
5. **Make-Ahead** (optional) - Prep-ahead tip if applicable
6. **Pro Tip** (optional) - Extra helpful trick

Format: Plain sentences separated by \\n (escaped newline). NO actual line breaks in JSON string.

CRITICAL: In the JSON output, use \\n (backslash-n) not actual newlines!

Correct example:
"notes": "Don't overmix the cookie dough; it can make your cookies tough.\\nStore assembled Pumpkin Oatmeal Cream Pies in an airtight container in the refrigerator for up to 4 days.\\nIf you're out of brown sugar, you can use granulated sugar with a tablespoon of molasses for a similar flavor and moisture.\\nServe these slightly chilled for the best contrast between the chewy cookie and the cool, creamy filling."

WRONG (will cause JSON error):
"notes": "First sentence.
Second sentence.
Third sentence."

OUTPUT JSON:
{
  "equipment": "comma, separated, list, of, tools",
  "notes": "First tip about technique.\\nSecond tip about storage.\\nThird tip about substitution.\\nFourth tip about serving."
}

TONE: Practical reference, recipe card style
Return ONLY valid JSON.`;
};

/**
 * PROMPT 17: Nutrition, Allergies & Tags
 */
const getNutritionTagsPrompt = (context, ingredientsJson, servings) => {
  return `CONTEXT:
${context}
Ingredients: ${JSON.stringify(ingredientsJson)}
Servings: ${servings}

Generate realistic nutrition information, allergen warnings, and SEO tags.

PART 1: NUTRITION (per serving)
Calculate based on typical ingredient nutrition:
- Butter/oil: ~100 cal per tbsp
- Sugar: ~50 cal per tbsp
- Flour: ~30 cal per tbsp
- Eggs: ~70 cal each
- Estimate total, divide by servings
- Be realistic but can round to appealing numbers

PART 2: ALLERGIES
List ALL potential allergens in comma-separated format:
Common: Dairy, Eggs, Gluten, Tree Nuts, Peanuts, Soy, Fish, Shellfish, Sesame
Format: "Dairy, Eggs, Gluten" (capitalize each)

PART 3: TAGS (12-18 tags)
Categories to include:
- Main ingredient (3-4 tags)
- Cooking method (2 tags)
- Occasion/season (2-3 tags)
- Dietary/texture descriptors (2-3 tags)
- Course/meal type (1-2 tags)
- Emotion/experience words (2-3 tags)
- General category (1-2 tags)

Format: lowercase, comma-separated, no spaces after commas
Example: "pumpkin,oatmeal,cream pies,fall dessert,autumn baking,cookies,cream cheese,spiced,chewy,homemade,seasonal,treat,comfort food"

OUTPUT JSON:
{
  "nutrition_calories": "320",
  "nutrition_totalFat": "16g",
  "nutrition_totalCarbs": "42g",
  "nutrition_protein": "4g",
  "allergies": "Dairy, Eggs, Gluten",
  "tags": "ingredient1,method1,occasion1,descriptor1,type1,emotion1..."
}

SEO NOTES:
- Tags should include recipe name components
- Include both specific and broad terms
- Add trending food keywords (homemade, comfort food, seasonal)

Return ONLY valid JSON.`;
};

/**
 * PROMPT 18: Smart Category Selection
 */
const getCategorySelectionPrompt = (recipeTitle, categories) => {
  return `You are a recipe categorization expert. Select the MOST appropriate category for this recipe.

RECIPE TITLE: "${recipeTitle}"

AVAILABLE CATEGORIES:
${categories.map((c, i) => `${i + 1}. ${c.name} (ID: ${c.id})`).join('\n')}

INSTRUCTIONS:
- Analyze the recipe title
- Choose the single BEST matching category
- Consider the primary purpose/type of the dish

Return ONLY a JSON object with this exact structure:
{
  "selectedId": "the_category_id_here",
  "reason": "Brief explanation of why this category fits best"
}

Return ONLY the JSON, no explanation or markdown.`;
};

module.exports = {
  getTitleMetadataPrompt,
  getIntroductionPrompt,
  getWhyLovePrompt,
  getAnecdotePrompt,
  getIngredientsPrompt,
  getInstructionsPrompt,
  getCriticalTipsPrompt,
  getReflectionPrompt,
  getStoragePrompt,
  getSwapsPrompt,
  getServingPrompt,
  getStoryBehindPrompt,
  getProTipsPrompt,
  getClosingPrompt,
  getFaqsPrompt,
  getEquipmentNotesPrompt,
  getNutritionTagsPrompt,
  getCategorySelectionPrompt
};
