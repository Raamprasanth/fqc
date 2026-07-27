const express = require('express');
const Aout = require('../models/Aout');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// ── GET /api/aout ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.configKey) filter.configKey = req.query.configKey;
    const records = await Aout.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Aout Error]', err);
    res.status(500).json({ message: 'Failed to fetch aout records.' });
  }
});

// ── POST /api/aout ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const newRecord = await Aout.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Aout Error]', err);
    res.status(500).json({ message: 'Failed to create aout record.' });
  }
});

module.exports = router;
