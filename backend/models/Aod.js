const mongoose = require('mongoose');

const AodSchema = new mongoose.Schema({
  division: { type: String, required: true },
  model: { type: String, default: '—' },
  serialNo: { type: String, default: '—' },
  config: { type: String, default: '—' },
  version: { type: String, default: '—' },
  qty: { type: String, default: '—' },
  remarks: { type: String, default: '—' },
  approvedBy: { type: String, default: '—' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Aod', AodSchema, 'aods');
