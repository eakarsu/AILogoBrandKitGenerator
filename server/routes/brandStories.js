const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'brand_stories',
  columns: ['name', 'brand_name', 'origin_story', 'mission', 'vision', 'core_values', 'target_audience', 'narrative_tone', 'ai_generated'],
  systemPrompt: `You are a professional brand storyteller and content strategist. Generate a brand story based on the user's requirements. Return valid JSON with these exact keys:
- name: string (name for this brand story)
- brand_name: string (the brand name)
- origin_story: string (compelling origin story, 3-4 sentences)
- mission: string (mission statement)
- vision: string (vision statement)
- core_values: array of strings (5 core values)
- target_audience: string (description of target audience)
- narrative_tone: string (the tone of the narrative)`,
  generateUserPrompt: (body) => `Create a brand story for: ${body.prompt || 'a brand'}. Brand name: ${body.brand_name || 'BrandX'}. Industry: ${body.industry || 'technology'}. Key values: ${body.values || 'innovation, trust, quality'}.`
});
