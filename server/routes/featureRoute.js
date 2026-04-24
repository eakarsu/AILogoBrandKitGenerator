const express = require('express');
const auth = require('../middleware/auth');
const pool = require('../config/db');
const { generateWithAI } = require('../services/openrouter');

function createFeatureRoute({ tableName, columns, systemPrompt, generateUserPrompt }) {
  const router = express.Router();

  // GET all items
  router.get('/', auth, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      res.status(500).json({ error: `Failed to fetch ${tableName}.` });
    }
  });

  // GET single item
  router.get('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM ${tableName} WHERE id = $1 AND user_id = $2`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found.' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error fetching ${tableName} item:`, err);
      res.status(500).json({ error: 'Failed to fetch item.' });
    }
  });

  // POST create item
  router.post('/', auth, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'user_id' && c !== 'created_at' && c !== 'updated_at');
      const values = fields.map(f => {
        const val = req.body[f];
        if (val !== undefined && typeof val === 'object') return JSON.stringify(val);
        return val !== undefined ? val : null;
      });
      const placeholders = fields.map((_, i) => `$${i + 2}`).join(', ');
      const colNames = ['user_id', ...fields].join(', ');
      const allPlaceholders = `$1, ${placeholders}`;

      const result = await pool.query(
        `INSERT INTO ${tableName} (${colNames}) VALUES (${allPlaceholders}) RETURNING *`,
        [req.user.id, ...values]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(`Error creating ${tableName} item:`, err);
      res.status(500).json({ error: 'Failed to create item.' });
    }
  });

  // PUT update item
  router.put('/:id', auth, async (req, res) => {
    try {
      const fields = columns.filter(c => c !== 'id' && c !== 'user_id' && c !== 'created_at' && c !== 'updated_at');
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          let val = req.body[field];
          if (val !== null && typeof val === 'object') val = JSON.stringify(val);
          setClauses.push(`${field} = $${paramIndex}`);
          values.push(val);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update.' });

      setClauses.push(`updated_at = NOW()`);
      values.push(req.params.id, req.user.id);

      const result = await pool.query(
        `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found.' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error(`Error updating ${tableName} item:`, err);
      res.status(500).json({ error: 'Failed to update item.' });
    }
  });

  // DELETE item
  router.delete('/:id', auth, async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM ${tableName} WHERE id = $1 AND user_id = $2 RETURNING *`,
        [req.params.id, req.user.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found.' });
      res.json({ message: 'Item deleted successfully.' });
    } catch (err) {
      console.error(`Error deleting ${tableName} item:`, err);
      res.status(500).json({ error: 'Failed to delete item.' });
    }
  });

  // POST generate with AI
  router.post('/generate', auth, async (req, res) => {
    try {
      const userPrompt = generateUserPrompt(req.body);
      const aiResult = await generateWithAI(systemPrompt, userPrompt);

      // Insert the generated item
      const fields = columns.filter(c => c !== 'id' && c !== 'user_id' && c !== 'created_at' && c !== 'updated_at');
      const values = fields.map(f => {
        if (f === 'ai_generated') return true;
        const val = aiResult[f];
        if (val !== undefined && typeof val === 'object') return JSON.stringify(val);
        return val !== undefined ? val : null;
      });
      const placeholders = fields.map((_, i) => `$${i + 2}`).join(', ');
      const colNames = ['user_id', ...fields].join(', ');
      const allPlaceholders = `$1, ${placeholders}`;

      const result = await pool.query(
        `INSERT INTO ${tableName} (${colNames}) VALUES (${allPlaceholders}) RETURNING *`,
        [req.user.id, ...values]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(`Error generating ${tableName} with AI:`, err);
      res.status(500).json({ error: `AI generation failed: ${err.message}` });
    }
  });

  return router;
}

module.exports = createFeatureRoute;
