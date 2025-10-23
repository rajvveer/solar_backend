const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  buyerName: { type: String, required: true },
  kwBought: { type: Number, required: true },
  buyerContact: { type: String, required: true },
  amount: { type: Number, required: true, default: 2500 },
  approved: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);
