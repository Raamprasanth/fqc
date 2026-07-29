const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
  type: { type: String, default: '—' },
  code: { type: String, default: '—' },
  slNo: { type: String, default: '—' },
  customer: { type: String, default: '—' },
  oa: { type: String, default: '—' },
  division: { type: String, default: 'Ventilator & Anesthesia' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Code', CodeSchema, 'codes');
