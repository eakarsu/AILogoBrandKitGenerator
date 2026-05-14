const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { generateWithAI } = require('../services/openrouter');

function hasApiKey() {
  const k = process.env.OPENROUTER_API_KEY;
  return !!(k && !/^(your|placeholder|changeme|sk-or-v1-xxx)/i.test(k));
}

// POST /api/ai/tagline-generator
router.post('/tagline-generator', auth, aiRateLimiter, async (req, res) => {
  try {
    const { brandName, industry, audience, tone = 'professional', count = 8 } = req.body;
    if (!brandName) return res.status(400).json({ error: 'brandName is required.' });

    const systemPrompt = `You are a senior copywriter. Generate brand-aligned taglines.
Return JSON: { "taglines": [{ "text": string, "rationale": string, "tone": string }], "shortlist": [string] }`;
    const userPrompt = `Generate ${count} taglines for this brand.
Brand: ${brandName}
Industry: ${industry || 'unspecified'}
Target audience: ${audience || 'general'}
Desired tone: ${tone}`;

    const result = await generateWithAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/color-palette-suggest
router.post('/color-palette-suggest', auth, aiRateLimiter, async (req, res) => {
  try {
    const { brandName, industry, mood, primaryColorHex, count = 5 } = req.body;
    if (!brandName) return res.status(400).json({ error: 'brandName is required.' });

    const systemPrompt = `You are a brand identity color theorist. Suggest harmonious palettes.
Return JSON: { "palettes": [{ "name": string, "colors": [{"hex": string, "role": string, "name": string}], "use_case": string, "psychology": string }] }`;
    const userPrompt = `Suggest ${count} color palettes for this brand.
Brand: ${brandName}
Industry: ${industry || 'unspecified'}
Desired mood/feeling: ${mood || 'modern, trustworthy'}
${primaryColorHex ? `Anchor primary color: ${primaryColorHex}` : ''}`;

    const result = await generateWithAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/brand-voice-analyzer — check copy against voice guidelines
router.post('/brand-voice-analyzer', auth, aiRateLimiter, async (req, res) => {
  try {
    const { brandVoiceGuidelines, copy } = req.body;
    if (!copy) return res.status(400).json({ error: 'copy is required.' });

    const systemPrompt = `You are a brand voice auditor. Compare copy against brand voice guidelines and flag drift.
Return JSON: { "alignment_score": number (0-100), "tone_match": string, "voice_match": string, "issues": [{"issue": string, "severity": "low"|"medium"|"high", "suggestion": string}], "rewrite_suggestion": string }`;
    const userPrompt = `Brand voice guidelines: ${brandVoiceGuidelines || 'unspecified — infer from copy'}

Copy to evaluate:
"""${copy}"""`;

    const result = await generateWithAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/logo-variations — text descriptions of logo variations
router.post('/logo-variations', auth, aiRateLimiter, async (req, res) => {
  try {
    if (!hasApiKey()) {
      return res.status(503).json({ error: 'AI not configured: set OPENROUTER_API_KEY in server environment.' });
    }
    const { brandName, baseConcept, industry, audience, count = 6 } = req.body;
    if (!brandName) return res.status(400).json({ error: 'brandName is required.' });

    const systemPrompt = `You are a senior logo designer producing precise, design-brief-ready descriptions of logo variations. You do not produce vector files; you produce textual specs that a designer or generative model can render.
Return JSON: { "variations": [{ "name": string, "concept": string, "style": string, "primary_shape": string, "typography_treatment": string, "color_direction": string, "use_case": string, "rationale": string }], "shortlist": [string], "consistency_notes": string }`;
    const userPrompt = `Generate ${count} distinct logo variations for the brand below. Vary by style (wordmark, lettermark, monogram, emblem, abstract mark, combination), tone, and intended use case. Each must remain recognizable as the same brand identity (consistency_notes explains how).
Brand: ${brandName}
Base concept (optional): ${baseConcept || 'open — propose'}
Industry: ${industry || 'unspecified'}
Audience: ${audience || 'general'}`;

    const result = await generateWithAI(systemPrompt, userPrompt);
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
