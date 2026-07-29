// backend/routes/dg400.js
const express = require('express');
const router  = express.Router();
const Dg400   = require('../models/Dg400');

// GET /api/dg400-imp-test?division=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Dg400.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Dg400 GET Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// POST /api/dg400-imp-test  (single object or array)
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (Array.isArray(payload)) {
      const saved = await Dg400.insertMany(payload);
      return res.status(201).json(saved);
    }
    const doc = new Dg400(payload);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('[Dg400 POST Error]', err);
    res.status(500).json({ message: 'Failed to save record.', error: err.message });
  }
});

// DELETE /api/dg400-imp-test/:id
router.delete('/:id', async (req, res) => {
  try {
    await Dg400.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[Dg400 DELETE Error]', err);
    res.status(500).json({ message: 'Failed to delete record.', error: err.message });
  }
});

module.exports = router;
