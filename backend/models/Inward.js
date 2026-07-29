// ─────────────────────────────────────────────────────────────────────────────
// backend/models/Inward.js
// ─────────────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const inwardSchema = new mongoose.Schema({
  // Common fields
  division: { type: String, required: true },
  fqcEngr: { type: String, default: '—' },
  inwardMonth: { type: String, default: '—' },
  model: { type: String, default: '—' },
  serialNo: { type: String, default: '—' },
  remarks: { type: String, default: '—' },

  // Standard (non-SHIPL) fields
  inwardDate: { type: String, default: '—' },
  conf: { type: String, default: '—' },
  version: { type: String, default: '—' },
  supplierWarranty: { type: String, default: '—' },
  o2CellSn: { type: String, default: '—' },
  invoice: { type: String, default: '—' },
  problem: { type: String, default: '—' },
  airO2MixerSn: { type: String, default: '—' },
  vaporizerSlno: { type: String, default: '—' },
  vaporizerModel: { type: String, default: '—' },

  // SHIPL-specific fields
  fgRecdDate: { type: String, default: '—' },
  source: { type: String, default: '—' },
  toNumber: { type: String, default: '—' },
  confg: { type: String, default: '—' },
  swVer: { type: String, default: '—' },
  sequenceNo: { type: String, default: '—' },
  ibpModuleSn: { type: String, default: '—' },
  etco2ModuleSn: { type: String, default: '—' },
  fgReturnedDate: { type: String, default: '—' },

  // Audit
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Inward = mongoose.model('Inward', inwardSchema);
module.exports = Inward;
