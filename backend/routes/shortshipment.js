const express = require('express');
const router = express.Router();
const Shortshipment = require('../models/Shortshipment');

// Get shortshipment entries optionally filtered by division
router.get('/', async (req, res) => {
  try {
    const { division } = req.query;
    let query = {};
    if (division) query.division = division;

    const entries = await Shortshipment.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new shortshipment entry
router.post('/', async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;
    if (Array.isArray(req.body)) {
      const dataList = req.body.map(item => userId ? { ...item, createdBy: userId } : item);
      const inserted = await Shortshipment.insertMany(dataList);
      return res.status(201).json(inserted);
    }
    const data = userId ? { ...req.body, createdBy: userId } : req.body;
    const newRecord = await Shortshipment.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Shortshipment Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});
  }
});

module.exports = router;
