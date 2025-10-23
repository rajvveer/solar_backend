const mongoose = require('mongoose');

const CommissionRecordSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  amount: { type: Number, required: true },
  level: { type: Number, required: true }, // Employee's level receiving the commission
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommissionRecord', CommissionRecordSchema);
