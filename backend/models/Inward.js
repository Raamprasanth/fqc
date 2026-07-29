// ─────────────────────────────────────────────────────────────────────────────
// backend/models/Inward.js
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const inwardSchema = new mongoose.Schema({
  fqcEngr: { type: String, default: '—' },
  inwardMonth: { type: String, default: '—' },
  inwardDate: { type: String, default: '—' },
  model: { type: String, default: '—' },
  serialNo: { type: String, default: '—' },
  conf: { type: String, default: '—' },
  version: { type: String, default: '—' },
  supplierWarranty: { type: String, default: '—' },
  o2CellSn: { type: String, default: '—' },
  invoice: { type: String, default: '—' },
  problem: { type: String, default: '—' },
  remarks: { type: String, default: '—' },
  airO2MixerSn: { type: String, default: '—' },
  vaporizerSlno: { type: String, default: '—' },
  vaporizerModel: { type: String, default: '—' },
  division: { type: String, required: true },
  // Let's also track who created this record
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Inward = mongoose.model('Inward', inwardSchema);
module.exports = Inward;
