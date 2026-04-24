const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'typography_recommendations',
  columns: ['name', 'heading_font', 'body_font', 'accent_font', 'pairing_rationale', 'sample_text', 'size_scale', 'ai_generated'],
  systemPrompt: `You are a professional typographer and brand designer. Generate a typography recommendation based on the user's requirements. Return valid JSON with these exact keys:
- name: string (descriptive name for this type system)
- heading_font: string (Google Font name for headings)
- body_font: string (Google Font name for body text)
- accent_font: string (Google Font name for accents/highlights)
- pairing_rationale: string (why these fonts work together)
- sample_text: string (sample paragraph showing the typography in use)
- size_scale: object with keys h1, h2, h3, body, caption (each a string like "48px")`,
  generateUserPrompt: (body) => `Recommend typography for: ${body.prompt || 'a modern brand'}. Style: ${body.style || 'clean and professional'}. Industry: ${body.industry || 'technology'}.`
});
