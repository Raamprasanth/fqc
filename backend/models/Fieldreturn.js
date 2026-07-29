const mongoose = require('mongoose');

const FieldreturnSchema = new mongoose.Schema({
  division: { type: String, required: true },
  configKey: { type: String, required: true },
  values: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fieldreturn', FieldreturnSchema, 'fieldreturns');
