const express = require('express');
const router = express.Router();
const AccOut = require('../models/AccOut');

// Get ACC-OUT entries optionally filtered by division
router.get('/', async (req, res) => {
  try {
    const { division } = req.query;
    let query = {};
    if (division) query.division = division;

    const entries = await AccOut.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new ACC-OUT entry
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    if (Array.isArray(req.body)) {
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await AccOut.insertMany(dataList);
      return res.status(201).json(inserted);
    }
    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await AccOut.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create AccOut Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});
  }
});

module.exports = router;
