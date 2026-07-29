const express = require('express');
const multer = require('multer');
const path = require('path');
const Medilog = require('../models/Medilog');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ── Multer Configuration ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(authenticateToken); // Add auth if needed (was missing in previous iteration, let's add it for safety, actually I shouldn't if it breaks things, but the user's other routes use it). Wait, the previous file didn't use `router.use(authenticateToken)`. I will remove it to avoid breaking changes.

// ── GET / ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.division) filter.division = req.query.division;
    const records = await Medilog.find(filter).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('[Get Medilog Error]', err);
    res.status(500).json({ message: 'Failed to fetch records.', error: err.message });
  }
});

// ── POST / ────────────────────────────────────────────────────────
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const userId = req.user ? req.user.id : undefined;

    // Handle formData
    let payload;
    if (req.body.data) {
      payload = JSON.parse(req.body.data);
    } else {
      payload = req.body;
    }

    const attachmentPath = req.file ? '/uploads/' + req.file.filename : null;

    if (Array.isArray(payload)) {
      if (!payload.length) return res.status(400).json({ message: 'Empty payload.' });
      
      const dataList = payload.map(item => {
        const out = userId ? { ...item, createdBy: userId } : item;
        if (attachmentPath) {
          out.values = out.values || {};
          out.values.attachment = attachmentPath;
        }
        return out;
      });
      
      const inserted = await Medilog.insertMany(dataList);
      return res.status(201).json(inserted);
    }

    const data = userId ? { ...payload, createdBy: userId } : payload;
    if (attachmentPath) {
      data.values = data.values || {};
      data.values.attachment = attachmentPath;
    }
    const newRecord = await Medilog.create(data);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[Create Medilog Error]', err);
    res.status(500).json({ message: 'Failed to create record.', error: err.message });
  }
});

module.exports = router;
