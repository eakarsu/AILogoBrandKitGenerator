const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'brand_voice_guides',
  columns: ['name', 'brand_name', 'tone_attributes', 'voice_description', 'do_examples', 'dont_examples', 'sample_copy', 'ai_generated'],
  systemPrompt: `You are a professional brand strategist specializing in brand voice and tone. Generate a brand voice guide based on the user's requirements. Return valid JSON with these exact keys:
- name: string (name for this voice guide)
- brand_name: string (the brand this is for)
- tone_attributes: array of strings (5-7 tone adjectives like "professional", "friendly")
- voice_description: string (2-3 sentence description of the brand voice)
- do_examples: array of strings (5 examples of on-brand copy)
- dont_examples: array of strings (5 examples of off-brand copy to avoid)
- sample_copy: object with keys: social (string), email (string), website (string)`,
  generateUserPrompt: (body) => `Create a brand voice guide for: ${body.prompt || 'a brand'}. Brand name: ${body.brand_name || 'BrandX'}. Industry: ${body.industry || 'technology'}. Target audience: ${body.target_audience || 'professionals'}.`
});
