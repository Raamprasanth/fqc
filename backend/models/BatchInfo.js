const mongoose = require('mongoose');

const BatchInfoSchema = new mongoose.Schema({
  division: { type: String, required: true },
  birRefNo: { type: String },
  inwardMonth: { type: String },
  inwardDate: { type: String },
  refInvoice: { type: String },
  supplierWarranty: { type: String },
  model: { type: String },
  unitSn: { type: String },
  conf: { type: String },
  version: { type: String },
  qty: { type: String },
  supplierName: { type: String },
  accessoryRemarks: { type: String },
  batchLotSn: { type: String },
  remarks: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BatchInfo', BatchInfoSchema, 'batch_infos');
