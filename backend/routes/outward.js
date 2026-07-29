const express = require('express');
const Outward = require('../models/Outward');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// ── GET /api/outward ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Outward.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Outward Error]', err);
    res.status(500).json({ message: 'Failed to fetch outward records.' });
  }
});

// ── POST /api/outward ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    if (Array.isArray(req.body)) {
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await Outward.insertMany(dataList);
      return res.status(201).json(inserted);
    }
    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await Outward.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Outward Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});
    const data = { ...req.body, createdBy: req.user.id };
    const newRecord = await Outward.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Outward Error]', err);
    res.status(500).json({ message: 'Failed to create outward record.' });
  }
});

module.exports = router;
