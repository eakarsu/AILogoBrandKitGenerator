const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'logos',
  columns: ['name', 'description', 'style', 'colors', 'concept', 'layout_description', 'ai_generated'],
  systemPrompt: `You are a professional brand designer specializing in logo design. Generate a detailed logo concept based on the user's requirements. Return valid JSON with these exact keys:
- name: string (creative logo name)
- description: string (brief description)
- style: string (e.g. "minimalist", "vintage", "modern", "geometric", "hand-drawn")
- colors: array of hex color strings (3-5 colors)
- concept: string (detailed concept description, 2-3 sentences)
- layout_description: string (detailed layout description explaining visual arrangement)`,
  generateUserPrompt: (body) => `Create a logo concept for: ${body.prompt || 'a modern tech startup'}. Industry: ${body.industry || 'technology'}. Preferred style: ${body.style || 'modern and clean'}.`
});
