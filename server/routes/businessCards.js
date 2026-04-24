const createFeatureRoute = require('./featureRoute');

module.exports = createFeatureRoute({
  tableName: 'business_cards',
  columns: ['name', 'layout_style', 'front_layout', 'back_layout', 'color_scheme', 'typography', 'contact_info', 'ai_generated'],
  systemPrompt: `You are a professional graphic designer specializing in business card design. Generate a business card design based on the user's requirements. Return valid JSON with these exact keys:
- name: string (name for this card design)
- layout_style: string (e.g. "minimal", "bold", "corporate", "creative")
- front_layout: object with keys: logo_position (string), name_position (string), title_position (string), accent_elements (string)
- back_layout: object with keys: info_alignment (string), elements (array of strings), design_notes (string)
- color_scheme: object with keys: primary (hex string), secondary (hex string), accent (hex string), background (hex string), text (hex string)
- typography: object with keys: name_font (string), title_font (string), body_font (string), sizes (object)
- contact_info: object with keys: name (string), title (string), company (string), email (string), phone (string), website (string)`,
  generateUserPrompt: (body) => `Design a business card for: ${body.prompt || 'a professional'}. Style: ${body.style || 'modern and clean'}. Industry: ${body.industry || 'technology'}.`
});
