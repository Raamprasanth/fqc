// backend/routes/dg400x.js
const express = require('express');
const router  = express.Router();
const Dg400x  = require('../models/Dg400x');

// GET /api/dg400x-imp-test?division=...
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Dg400x.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Dg400x GET Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// POST /api/dg400x-imp-test  (single object or array)
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (Array.isArray(payload)) {
      const saved = await Dg400x.insertMany(payload);
      return res.status(201).json(saved);
    }
    const doc = new Dg400x(payload);
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('[Dg400x POST Error]', err);
    res.status(500).json({ message: 'Failed to save record.', error: err.message });
  }
});

// DELETE /api/dg400x-imp-test/:id
router.delete('/:id', async (req, res) => {
  try {
    await Dg400x.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('[Dg400x DELETE Error]', err);
    res.status(500).json({ message: 'Failed to delete record.', error: err.message });
  }
});

module.exports = router;
