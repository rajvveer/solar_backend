const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  recruits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  referralCode: { type: String, unique: true },
  level: { type: Number, default: 1 },
  withdrawnAmount: { type: Number, default: 0 }, // NEW FIELD
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
