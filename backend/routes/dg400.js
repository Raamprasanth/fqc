// backend/routes/dg400.js
const express = require('express');
const router  = express.Router();
const Dg400   = require('../models/Dg400');
const { verifyToken } = require('../middleware/auth');

// GET /api/dg400-imp-test?division=...
router.get('/', verifyToken, async (req, res) => {
  try {
    const { division } = req.query;
    const filter = division ? { division } : {};
    const records = await Dg400.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/dg400-imp-test  (single object or array)
router.post('/', verifyToken, async (req, res) => {
  try {
    const payload = req.body;
    if (Array.isArray(payload)) {
      const docs = payload.map(d => ({ ...d, createdBy: req.user?.id }));
      const saved = await Dg400.insertMany(docs);
      return res.status(201).json(saved);
    }
    const doc = new Dg400({ ...payload, createdBy: req.user?.id });
    const saved = await doc.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/dg400-imp-test/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Dg400.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
