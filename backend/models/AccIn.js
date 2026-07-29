const mongoose = require('mongoose');

const AccInSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String, required: true, default: 'vent-anesthesia' },
  values: { type: Object, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AccIn', AccInSchema, 'accins');
