const express = require('express');
const Ashort = require('../models/Ashort');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// ── GET /api/ashort ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.configKey && req.query.configKey !== 'all') {
      filter.configKey = req.query.configKey;
    }
    const records = await Ashort.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Ashort Error]', err);
    res.status(500).json({ message: 'Failed to fetch ashort records.' });
  }
});

// ── POST /api/ashort ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const newRecord = await Ashort.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Ashort Error]', err);
    res.status(500).json({ message: 'Failed to create ashort record.' });
  }
});

module.exports = router;
