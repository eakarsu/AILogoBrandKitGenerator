const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/db');
const { generateWithAI } = require('../services/openrouter');

// GET all brands for current user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM brands WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single brand with associated items
router.get('/:id', auth, async (req, res) => {
  try {
    const brandResult = await pool.query(
      `SELECT * FROM brands WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (brandResult.rows.length === 0) return res.status(404).json({ error: 'Brand not found.' });
    const brand = brandResult.rows[0];

    // Fetch associated items
    const [logos, palettes, taglines] = await Promise.all([
      pool.query(`SELECT * FROM logos WHERE brand_id = $1 AND user_id = $2`, [brand.id, req.user.id]).catch(() => ({ rows: [] })),
      pool.query(`SELECT * FROM color_palettes WHERE brand_id = $1 AND user_id = $2`, [brand.id, req.user.id]).catch(() => ({ rows: [] })),
      pool.query(`SELECT * FROM taglines WHERE brand_id = $1 AND user_id = $2`, [brand.id, req.user.id]).catch(() => ({ rows: [] })),

    ]);

    res.json({ ...brand, logos: logos.rows, color_palettes: palettes.rows, taglines: taglines.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create brand
router.post('/', auth, async (req, res) => {
  try {
    const { name, industry, brief } = req.body;
    if (!name) return res.status(400).json({ error: 'Brand name is required.' });

    const result = await pool.query(
      `INSERT INTO brands (user_id, name, industry, brief) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name, industry || null, brief || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update brand
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, industry, brief } = req.body;
    const result = await pool.query(
      `UPDATE brands SET name = COALESCE($1, name), industry = COALESCE($2, industry), brief = COALESCE($3, brief) WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, industry, brief, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brand not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE brand
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM brands WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Brand not found.' });
    res.json({ message: 'Brand deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate full brand kit (logo concept + color palette + tagline in parallel)
router.post('/:id/generate-kit', auth, async (req, res) => {
  try {
    const brandResult = await pool.query(
      `SELECT * FROM brands WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (brandResult.rows.length === 0) return res.status(404).json({ error: 'Brand not found.' });
    const brand = brandResult.rows[0];

    const brandContext = `Brand: ${brand.name}, Industry: ${brand.industry || 'general'}, Brief: ${brand.brief || 'No brief provided'}`;

    // Call 3 AI features in parallel
    const [logo, palette, tagline] = await Promise.all([
      generateWithAI(
        `You are a professional logo designer. Generate a logo concept. Return JSON: { "name": string, "description": string, "style": string, "colors": array, "concept": string, "layout_description": string }`,
        `Create a logo concept for: ${brandContext}`
      ),
      generateWithAI(
        `You are a color theory expert. Generate a brand color palette. Return JSON: { "name": string, "description": string, "colors": [{"hex": string, "name": string, "role": string}], "mood": string, "industry": string }`,
        `Create a color palette for: ${brandContext}`
      ),
      generateWithAI(
        `You are a brand copywriter. Generate a memorable tagline. Return JSON: { "brand_name": string, "tagline": string, "tone": string, "target_audience": string, "explanation": string, "alternatives": [string] }`,
        `Create a tagline for: ${brandContext}`
      ),
    ]);

    res.json({ success: true, brand, logo, palette, tagline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
