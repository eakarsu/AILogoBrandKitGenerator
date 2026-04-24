const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'style_guides',
  columns: ['name', 'brand_name', 'logo_usage', 'color_guidelines', 'typography_guidelines', 'imagery_style', 'spacing_rules', 'dos_and_donts', 'ai_generated'],
  systemPrompt: `You are a professional brand designer creating comprehensive style guides. Generate a style guide based on the user's requirements. Return valid JSON with these exact keys:
- name: string (name for this style guide)
- brand_name: string (the brand name)
- logo_usage: object with keys: clear_space (string), min_size (string), backgrounds (array of strings), prohibited_uses (array of strings)
- color_guidelines: object with keys: primary (object with hex, usage), secondary (object with hex, usage), accent (object with hex, usage), rules (array of strings)
- typography_guidelines: object with keys: heading (object with font, weight, usage), body (object with font, weight, usage), rules (array of strings)
- imagery_style: string (description of imagery guidelines)
- spacing_rules: object with keys: base_unit (string), margins (string), padding (string), guidelines (array of strings)
- dos_and_donts: object with keys: dos (array of strings), donts (array of strings)`,
  generateUserPrompt: (body) => `Create a comprehensive style guide for: ${body.prompt || 'a brand'}. Brand name: ${body.brand_name || 'BrandX'}. Industry: ${body.industry || 'technology'}. Style: ${body.style || 'modern and professional'}.`
});
