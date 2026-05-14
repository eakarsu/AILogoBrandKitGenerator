const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const pool = require('../config/db');
const { generateWithAI } = require('../services/openrouter');

router.post('/', auth, aiRateLimiter, async (req, res) => {
  try {
    const { brandId, text_or_url } = req.body;

    if (!brandId || !text_or_url) {
      return res.status(400).json({ error: 'brandId and text_or_url are required.' });
    }

    // Fetch brand info
    const brandResult = await pool.query(
      `SELECT * FROM brands WHERE id = $1 AND user_id = $2`,
      [brandId, req.user.id]
    );
    if (brandResult.rows.length === 0) return res.status(404).json({ error: 'Brand not found.' });
    const brand = brandResult.rows[0];

    // Fetch brand assets (logo concept, color palette, brand voice)
    const [logos, palettes, voices] = await Promise.all([
      pool.query(`SELECT * FROM logos WHERE brand_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1`, [brandId, req.user.id]).catch(() => ({ rows: [] })),
      pool.query(`SELECT * FROM color_palettes WHERE brand_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1`, [brandId, req.user.id]).catch(() => ({ rows: [] })),
      pool.query(`SELECT * FROM brand_voice_guides WHERE brand_id = $1 AND user_id = $2 ORDER BY id DESC LIMIT 1`, [brandId, req.user.id]).catch(() => ({ rows: [] })),
    ]);

    const brandAssets = {
      logo_concept: logos.rows[0] || null,
      color_palette: palettes.rows[0] || null,
      brand_voice: voices.rows[0] || null,
    };

    const systemPrompt = `You are a brand consistency expert. Check if the provided content aligns with the brand guidelines.
Return JSON: { "consistency_score": number (0-100), "color_compliance": string, "tone_compliance": string, "logo_usage_notes": string, "violations": [{"issue": string, "severity": "low"|"medium"|"high", "suggestion": string}], "overall_assessment": string }`;

    const userPrompt = `Check if this content is consistent with the brand.
Brand: ${JSON.stringify({ name: brand.name, industry: brand.industry, brief: brand.brief })}
Brand Assets: ${JSON.stringify(brandAssets)}
Content to check: ${text_or_url}`;

    const result = await generateWithAI(systemPrompt, userPrompt);

    res.json({ success: true, brand: { id: brand.id, name: brand.name }, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
