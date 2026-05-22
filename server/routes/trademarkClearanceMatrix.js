const express = require('express');
const router = express.Router();
function matrix(input = {}) {
  const marks = input.marks || [
    { name: 'OrbitNest', class_overlap: 0.72, phonetic_similarity: 0.61, industry: 'SaaS' },
    { name: 'North Ledger', class_overlap: 0.2, phonetic_similarity: 0.18, industry: 'Finance' },
  ];
  return { marks: marks.map(m => {
    const risk = Math.round(Number(m.class_overlap) * 55 + Number(m.phonetic_similarity) * 45);
    return { ...m, risk, action: risk >= 65 ? 'rename_candidate' : risk >= 35 ? 'legal_review' : 'clear_for_brand_board' };
  }) };
}
router.get('/', (req, res) => res.json(matrix()));
router.post('/matrix', (req, res) => res.json(matrix(req.body || {})));
module.exports = router;
