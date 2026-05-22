const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Create brands table and add brand_id columns on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    brief TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('Error creating brands table:', err.message));

// Add brand_id column to feature tables if not exists
const brandIdTables = ['logos', 'color_palettes', 'typography_recommendations', 'brand_names', 'taglines', 'brand_voice_guides', 'brand_stories', 'style_guides'];
brandIdTables.forEach(table => {
  pool.query(`ALTER TABLE IF EXISTS ${table} ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id)`)
    .catch(() => {}); // Silently fail if table doesn't exist yet
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/logos', require('./routes/logos'));
app.use('/api/color-palettes', require('./routes/colorPalettes'));
app.use('/api/typography', require('./routes/typography'));
app.use('/api/brand-names', require('./routes/brandNames'));
app.use('/api/taglines', require('./routes/taglines'));
app.use('/api/brand-voice', require('./routes/brandVoice'));
app.use('/api/social-media-kits', require('./routes/socialMediaKits'));
app.use('/api/business-cards', require('./routes/businessCards'));
app.use('/api/brand-stories', require('./routes/brandStories'));
app.use('/api/style-guides', require('./routes/styleGuides'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/ai/brand-check', require('./routes/brandCheck'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/trademark-clearance-matrix', require('./routes/trademarkClearanceMatrix'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/vision-logo-synth', require('./routes/vision-logo-synth'));
app.use('/api/identity-builder-agent', require('./routes/identity-builder-agent'));
app.use('/api/brand-consistency-scan', require('./routes/brand-consistency-scan'));
app.use('/api/stakeholder-feedback', require('./routes/stakeholder-feedback'));
app.use('/api/asset-export', require('./routes/asset-export'));

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_ai_generate_logo_image = require('./routes/gap-ai-generate-logo-image'); app.use('/api/gap-ai-generate-logo-image', _gap_ai_generate_logo_image); } catch(e) { console.error('gap mount fail ai-generate-logo-image:', e.message); }
try { const _gap_ai_brand_name_generator = require('./routes/gap-ai-brand-name-generator'); app.use('/api/gap-ai-brand-name-generator', _gap_ai_brand_name_generator); } catch(e) { console.error('gap mount fail ai-brand-name-generator:', e.message); }
try { const _gap_ai_social_kit_generator = require('./routes/gap-ai-social-kit-generator'); app.use('/api/gap-ai-social-kit-generator', _gap_ai_social_kit_generator); } catch(e) { console.error('gap mount fail ai-social-kit-generator:', e.message); }
try { const _gap_ai_competitor_positioning = require('./routes/gap-ai-competitor-positioning'); app.use('/api/gap-ai-competitor-positioning', _gap_ai_competitor_positioning); } catch(e) { console.error('gap mount fail ai-competitor-positioning:', e.message); }
try { const _gap_design = require('./routes/gap-design'); app.use('/api/gap-design', _gap_design); } catch(e) { console.error('gap mount fail design:', e.message); }
try { const _gap_stakeholder = require('./routes/gap-stakeholder'); app.use('/api/gap-stakeholder', _gap_stakeholder); } catch(e) { console.error('gap mount fail stakeholder:', e.message); }
try { const _gap_asset = require('./routes/gap-asset'); app.use('/api/gap-asset', _gap_asset); } catch(e) { console.error('gap mount fail asset:', e.message); }
try { const _gap_brand_guidelines = require('./routes/gap-brand-guidelines'); app.use('/api/gap-brand-guidelines', _gap_brand_guidelines); } catch(e) { console.error('gap mount fail brand-guidelines:', e.message); }
try { const _gap_integration = require('./routes/gap-integration'); app.use('/api/gap-integration', _gap_integration); } catch(e) { console.error('gap mount fail integration:', e.message); }
try { const _gap_shared = require('./routes/gap-shared'); app.use('/api/gap-shared', _gap_shared); } catch(e) { console.error('gap mount fail shared:', e.message); }
try { const _gap_webhooks = require('./routes/gap-webhooks'); app.use('/api/gap-webhooks', _gap_webhooks); } catch(e) { console.error('gap mount fail webhooks:', e.message); }
try { const _gap_limited = require('./routes/gap-limited'); app.use('/api/gap-limited', _gap_limited); } catch(e) { console.error('gap mount fail limited:', e.message); }
// === End Batch 05 Mounts ===
