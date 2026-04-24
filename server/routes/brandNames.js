const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'brand_names',
  columns: ['name', 'industry', 'description', 'meaning', 'domain_suggestions', 'alternatives', 'ai_generated'],
  systemPrompt: `You are a professional brand naming expert. Generate a brand name concept based on the user's requirements. Return valid JSON with these exact keys:
- name: string (the primary brand name suggestion)
- industry: string (target industry)
- description: string (what the brand does)
- meaning: string (the meaning/story behind the name)
- domain_suggestions: array of strings (5 domain name ideas)
- alternatives: array of strings (5 alternative name suggestions)`,
  generateUserPrompt: (body) => `Generate a brand name for: ${body.prompt || 'an innovative company'}. Industry: ${body.industry || 'technology'}. Values: ${body.values || 'innovation, trust, quality'}.`
});
