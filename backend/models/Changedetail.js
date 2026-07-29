const mongoose = require('mongoose');

const ChangedetailSchema = new mongoose.Schema({
  division: { type: String, required: true },
  fgDate: { type: String, default: '—' },
  model: { type: String, default: '—' },
  unitSlNo: { type: String, default: '—' },
  config: { type: String, default: '—' },
  version: { type: String, default: '—' },
  qty: { type: String, default: '—' },
  birNo: { type: String, default: '—' },
  changeMade: { type: String, default: '—' },
  remarks: { type: String, default: '—' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Changedetail', ChangedetailSchema, 'changedetails');
