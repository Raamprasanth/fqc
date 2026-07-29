const express = require('express');
const Inward = require('../models/Inward');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// ── GET / ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Inward.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Inward Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// ── POST / ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;

    if (Array.isArray(req.body)) {
      if (!req.body.length) return res.status(400).json({ message: 'Empty payload.' });
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await Inward.insertMany(dataList);
      return res.status(201).json(inserted);
    }

    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await Inward.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Inward Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});

module.exports = router;
