const Employee = require('../models/Employee');
const CommissionRecord = require('../models/CommissionRecord');
const Contract = require('../models/Contract');
const WithdrawRequest = require('../models/WithdrawRequest'); // Import WithdrawRequest model

exports.getDashboardData = async (req, res) => {
  const { id } = req.params; // employee ID from URL
  try {
    // Get employee details (without password) and populate recruits for full details.
    const employee = await Employee.findById(id)
      .select('-password')
      .populate('recruits');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Fetch commission records for this employee.
    const commissions = await CommissionRecord.find({ employee: id });
    const totalEarnings = commissions.reduce((sum, record) => sum + record.amount, 0);

    // Fetch all approved withdraw requests and calculate the total withdrawn amount.
    // Note: Using status: 'approved' because WithdrawRequest.status is a string.
    const approvedWithdrawals = await WithdrawRequest.find({ employee: id, status: 'approved' });
    const totalWithdrawn = approvedWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

    // Calculate available earnings (net earnings after withdrawals)
    const availableEarnings = totalEarnings - totalWithdrawn;

    // Direct recruits count from the populated recruits array.
    const directRecruitsCount = employee.recruits.length;

    // Count distinct contracts that contributed commission to this employee.
    const contracts = await CommissionRecord.find({ employee: id }).select('contract');
    const contractIds = [...new Set(contracts.map(item => item.contract.toString()))];
    const contractsCount = contractIds.length;

    // For each recruit, calculate their total earnings from commission records.
    const recruitsWithEarnings = await Promise.all(
      employee.recruits.map(async (recruit) => {
        const recCommissions = await CommissionRecord.find({ employee: recruit._id });
        const recruitEarnings = recCommissions.reduce((sum, record) => sum + record.amount, 0);
        return { ...recruit.toObject(), totalEarnings: recruitEarnings };
      })
    );

    res.status(200).json({
      employee,
      totalEarnings: availableEarnings, // Return net available earnings after withdrawals
      directRecruitsCount,
      contractsCount,
      commissions,
      recruits: recruitsWithEarnings // Each recruit's total earnings included.
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
