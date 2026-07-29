const mongoose = require('mongoose');

const AccInSchema = new mongoose.Schema({
  division: { type: String, required: true, default: 'Ventilator & Anesthesia' },
  configKey: { type: String, default: 'vent-anesthesia' },
  date: { type: String, default: '—' },
  model: { type: String, default: '—' },
  description: { type: String, default: '—' },
  recdQty: { type: String, default: '—' },
  pasdQty: { type: String, default: '—' },
  rejdQty: { type: String, default: '—' },
  invoiceNoDate: { type: String, default: '—' },
  supplierName: { type: String, default: '—' },
  batchLotExp: { type: String, default: '—' },
  problemDetails: { type: String, default: '—' },
  remarks: { type: String, default: '—' },
  values: { type: Object, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccIn', AccInSchema, 'accins');
