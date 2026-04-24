const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'social_media_kits',
  columns: ['name', 'brand_name', 'platform', 'post_templates', 'hashtag_suggestions', 'content_calendar', 'bio_suggestion', 'ai_generated'],
  systemPrompt: `You are a social media marketing expert. Generate a social media kit based on the user's requirements. Return valid JSON with these exact keys:
- name: string (name for this social media kit)
- brand_name: string (the brand this is for)
- platform: string (primary platform like "Instagram", "Twitter", "LinkedIn")
- post_templates: array of objects with keys: type (string), caption (string), hashtags (string)
- hashtag_suggestions: array of strings (10 relevant hashtags)
- content_calendar: array of objects with keys: day (string), content_type (string), topic (string)
- bio_suggestion: string (platform bio suggestion)`,
  generateUserPrompt: (body) => `Create a social media kit for: ${body.prompt || 'a brand'}. Brand name: ${body.brand_name || 'BrandX'}. Platform: ${body.platform || 'Instagram'}. Industry: ${body.industry || 'technology'}.`
});
