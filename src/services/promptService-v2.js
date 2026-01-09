/**
 * Prompt Service V2 - Optimized for concise, SEO-focused content
 * WORD COUNT REDUCED BY 50%
 */

const getTitleMetadataPrompt = (input) => {
  return `Generate SEO metadata for: ${input.title}

{
  "title": "Emotional hook + recipe name (55-68 chars)",
  "shortTitle": "Concise version (25-45 chars)",
  "description": "Meta description with benefit (145-158 chars)",
  "difficulty": "Easy|Intermediate|Advanced",
  "cuisine": "Cuisine type",
  "dietary": "Dietary category",
  "prepTime": "15-45 Minutes",
  "cookTime": "10-60 Minutes",
  "totalTime": "Sum",
  "servings": "4-24 Servings"
}

Return ONLY valid JSON.`;
};

const getIntroductionPrompt = (context) => {
  return `Write a brief introduction for "${context.title}" (140-160 words TOTAL).

3 SHORT PARAGRAPHS:

**Opening (40-50 words)**:
- Quick memory or moment
- Introduce recipe naturally
- One sensory detail

**Journey (60-70 words)**:
- First attempt (what happened)
- The mistake or challenge
- Brief lesson learned

**Present (40-50 words)**:
- Why you love it now
- What it means
- Natural transition

KEYWORDS (MANDATORY):
- Recipe name: 2 times
- Sensory word: 2 (warm, cozy, soft, golden, crispy)
- Seasonal: 1 (fall, autumn, winter, spring, summer)
- Emotional: 1 (nostalgic, comforting, satisfying)

AVOID AI WORDS: delve, meticulously, embark, elevate, unlock, realm, tapestry, testament

Return 3 paragraphs in <p> tags, no code fences.`;
};

const getWhyLovePrompt = (context) => {
  return `Write 6 reasons to love "${context.title}".

EACH LINE: exactly 8-10 words

EXAMPLES:
- "Ready in thirty minutes, perfect for busy weeknight dinners."
- "Kids devour these, even the pickiest eaters ask seconds."
- "Make ahead and freeze for stress-free party planning."

CATEGORIES (choose 6):
1. Time/ease
2. Taste/appeal
3. Make-ahead
4. Simple ingredients
5. Versatility
6. Guaranteed success

Return 6 bullet points (<li> tags), each 8-10 words.`;
};

const getIngredientsPrompt = (context) => {
  return `List ingredients for "${context.title}" with brief commentary.

FORMAT:
{
  "ingredients": [
    {
      "item": "1 cup butter, softened",
      "commentary": "Provides richness and tender texture. Use unsalted for control."
    }
  ]
}

COMMENTARY (15-20 words each):
- What it does
- Why it matters
- Optional: quick tip

Personalize 2-3 with "I use..." or "Key for..."

KEYWORDS: Include recipe name twice in commentaries

Return ONLY JSON.`;
};

const getInstructionsPrompt = (context) => {
  return `Write ${context.stepCount || 6} instruction steps for "${context.title}".

FORMAT:
{
  "instructions": [
    {
      "stepNumber": 1,
      "title": "Cream Butter",
      "instruction": "Beat butter and sugars on medium until fluffy, 2-3 minutes. Scrape bowl sides before adding eggs."
    }
  ]
}

EACH STEP (30-40 words):
- Clear action
- How to know it's done
- Temperature/time if needed
- One quick tip

TITLES: 2-3 words max

KEYWORDS: Recipe name twice in all steps

Return ONLY JSON.`;
};

const getYouMustKnowPrompt = (context) => {
  return `Write 3 crucial tips for "${context.title}".

EACH TIP (15-20 words):
- State the crucial thing
- Why it matters
- Quick consequence

FORMAT: "[Action], otherwise [what happens]. [Quick tip]."

EXAMPLES:
- "Cool cookies completely before filling, otherwise cream will melt into mess. Patience pays off!"
- "Use pure pumpkin puree, not pie filling. Pie filling has added sugar and spices that throw off balance."

Return 3 <li> items.`;
};

const getAnecdotePrompt = (context) => {
  return `Write a brief anecdote about making "${context.title}" (60-75 words).

**The Moment (40-50 words)**:
- Quick scene
- One specific detail (mess, mistake, success)
- Your reaction

**Takeaway (20-25 words)**:
- Brief lesson
- Positive ending

TONE: Honest, relatable
KEYWORDS: Recipe name once

Return 1-2 <p> tags.`;
};

const getStoragePrompt = (context) => {
  return `Write storage tips for "${context.title}" (100-120 words).

**Main Storage (50-60 words)**:
- Container and temperature
- Duration (specific: "3-4 days")
- What happens if wrong
- Spoilage signs

**Make-Ahead (30-40 words)**:
- Prep components ahead?
- How far in advance?
- Assembly timing

**Quick Tips (20-30 words)**:
- Layering/stacking
- Reheating notes

KEYWORDS: store, keep, refrigerate, freeze, fresh

Return <h2>Storage Tips</h2> + 2-3 <p> tags.`;
};

const getServingSuggestionsPrompt = (context) => {
  return `Write serving suggestions for "${context.title}" (90-110 words).

**Serving Ideas (50-60 words)**:
- Simple method
- Presentation tip
- Temperature recommendation
- One pairing (beverage or side)

**Personal Favorite (30-40 words)**:
- How you prefer it
- Why it works

KEYWORDS: serve, pair, enjoy, presentation

Return <h2>Best Ways to Serve</h2> + 2 <p> tags.`;
};

const getProTipsPrompt = (context) => {
  return `Write 3 pro tips for "${context.title}".

EACH TIP (12-15 words):
- One advanced technique
- The benefit
- Keep actionable

EXAMPLES:
- "Brown butter first for deep nutty flavor, elevates entire cookie."
- "Whip cream cheese separately before combining for ultimate fluffiness."

Return <aside> with 3 <li> items.`;
};

const getFaqsPrompt = (context) => {
  return `Write 5 FAQs for "${context.title}".

QUESTIONS (natural language):
- How people actually search
- Include recipe name in 2-3 questions

ANSWERS (30-40 words each):
- Direct answer first
- Brief explanation
- One practical tip

KEYWORDS: make, store, freeze, substitute, prevent

FORMAT:
{
  "faqs": [
    {
      "question": "Question?",
      "answer": "Answer with tip..."
    }
  ]
}

Return JSON only.`;
};

module.exports = {
  getTitleMetadataPrompt,
  getIntroductionPrompt,
  getWhyLovePrompt,
  getIngredientsPrompt,
  getInstructionsPrompt,
  getYouMustKnowPrompt,
  getAnecdotePrompt,
  getStoragePrompt,
  getServingSuggestionsPrompt,
  getProTipsPrompt,
  getFaqsPrompt
};
