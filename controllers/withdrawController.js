const WithdrawRequest = require('../models/WithdrawRequest');
const CommissionRecord = require('../models/CommissionRecord');

exports.createWithdrawRequest = async (req, res) => {
  const { employeeId, amount } = req.body;
  try {
    //ensure the requested amount does not exceed total earnings:
    const commissions = await CommissionRecord.find({ employee: employeeId });
    const totalEarnings = commissions.reduce((sum, rec) => sum + rec.amount, 0);
    if (amount > totalEarnings) {
      return res.status(400).json({ message: 'Requested amount exceeds total earnings.' });
    }

    const request = new WithdrawRequest({
      employee: employeeId,
      amount
    });
    await request.save();
    res.status(201).json({ message: 'Withdraw request submitted.', request });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
