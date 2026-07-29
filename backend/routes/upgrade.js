const express = require('express');
const Upgrade = require('../models/Upgrade');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken); // Standard auth middleware

// ── GET / ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Upgrade.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Upgrade Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// ── POST / ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    const payload = req.body;

    if (Array.isArray(payload)) {
      if (!payload.length) return res.status(400).json({ message: 'Empty payload.' });
      
      const dataList = payload.map(item => {
        return userId ? { ...item, createdBy: userId } : item;
      });
      
      const inserted = await Upgrade.insertMany(dataList);
      return res.status(201).json(inserted);
    }

    const data = userId ? { ...payload, createdBy: userId } : payload;
    const newRecord = await Upgrade.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Upgrade Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});

module.exports = router;
