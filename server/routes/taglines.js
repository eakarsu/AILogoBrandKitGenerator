const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'taglines',
  columns: ['brand_name', 'tagline', 'tone', 'target_audience', 'explanation', 'alternatives', 'ai_generated'],
  systemPrompt: `You are a professional copywriter specializing in brand taglines and slogans. Generate a tagline based on the user's requirements. Return valid JSON with these exact keys:
- brand_name: string (the brand this tagline is for)
- tagline: string (the primary tagline/slogan)
- tone: string (the tone of the tagline)
- target_audience: string (who this appeals to)
- explanation: string (why this tagline works)
- alternatives: array of strings (5 alternative taglines)`,
  generateUserPrompt: (body) => `Create a tagline for: ${body.prompt || 'a brand'}. Brand name: ${body.brand_name || 'BrandX'}. Tone: ${body.tone || 'inspiring and memorable'}. Target audience: ${body.target_audience || 'general consumers'}.`
});
