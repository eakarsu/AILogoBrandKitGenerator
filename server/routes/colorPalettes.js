const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'color_palettes',
  columns: ['name', 'description', 'colors', 'mood', 'industry', 'ai_generated'],
  systemPrompt: `You are a professional color theory expert and brand designer. Generate a color palette based on the user's requirements. Return valid JSON with these exact keys:
- name: string (creative palette name)
- description: string (description of the palette and its use)
- colors: array of objects with keys: hex (string), name (string), role (string like "primary", "secondary", "accent", "background", "text")
- mood: string (the mood/feeling this palette evokes)
- industry: string (best suited industry)`,
  generateUserPrompt: (body) => `Create a color palette for: ${body.prompt || 'a professional brand'}. Industry: ${body.industry || 'general'}. Mood: ${body.mood || 'professional and trustworthy'}.`
});
