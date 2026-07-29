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
    const userId = req.user ? req.user.id : undefined;
    if (Array.isArray(req.body)) {
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await Aout.insertMany(dataList);
      return res.status(201).json(inserted);
    }
    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await Aout.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Aout Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});
  }
});

module.exports = router;
