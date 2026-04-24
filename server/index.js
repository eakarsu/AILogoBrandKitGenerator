const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();

app.use(cors());
app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
