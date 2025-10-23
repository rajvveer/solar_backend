const Admin = require('../models/Admin');
const Employee = require('../models/Employee');
const Contract = require('../models/Contract');
const CommissionRecord = require('../models/CommissionRecord');
const WithdrawRequest = require('../models/WithdrawRequest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ADMIN REGISTRATION
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully.', admin });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid admin credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid admin credentials' });
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Admin login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// EMPLOYEE MANAGEMENT

// Get all employees (without passwords)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.status(200).json({ employees });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get employee details by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ employee });
  } catch (error) {
    console.error('Error getting employee by id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an employee by ID
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CONTRACT MANAGEMENT

// Get all contracts
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.status(200).json({ contracts });
  } catch (error) {
    console.error('Error getting contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve a contract and distribute commissions.
// Distribution: Level 6: ₹2500, Level 5: ₹1000, Level 4: ₹800, Level 3: ₹500, Level 2: ₹300, Level 1: ₹200.
exports.approveContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.approved) return res.status(400).json({ message: 'Contract already approved' });
    
    const commissionRates = [2500, 1000, 800, 500, 300, 200];
    let currentEmployee = await Employee.findById(contract.employee);
    for (let i = 0; i < commissionRates.length; i++) {
      if (!currentEmployee) break;
      const commissionRecord = new CommissionRecord({
        contract: contract._id,
        employee: currentEmployee._id,
        amount: commissionRates[i],
        level: currentEmployee.level,
      });
      await commissionRecord.save();
      if (currentEmployee.recruiter) {
        currentEmployee = await Employee.findById(currentEmployee.recruiter);
      } else {
        break;
      }
    }
    contract.approved = true;
    await contract.save();
    res.status(200).json({ message: 'Contract approved and commissions distributed', contract });
  } catch (error) {
    console.error('Error approving contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject a contract
exports.rejectContract = async (req, res) => {
  const { id } = req.params;
  try {
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.approved) return res.status(400).json({ message: 'Cannot reject an approved contract' });
    
    contract.rejected = true;
    await contract.save();
    res.status(200).json({ message: 'Contract rejected', contract });
  } catch (error) {
    console.error('Error rejecting contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// COMMISSION MANAGEMENT

// Get all commission records
exports.getAllCommissions = async (req, res) => {
  try {
    const commissions = await CommissionRecord.find();
    res.status(200).json({ commissions });
  } catch (error) {
    console.error('Error getting commissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// WITHDRAW REQUEST MANAGEMENT

// Get all withdraw requests
exports.getWithdrawRequests = async (req, res) => {
  try {
    const withdraws = await WithdrawRequest.find().populate('employee', 'name email');
    res.status(200).json({ withdraws });
  } catch (error) {
    console.error('Error getting withdraw requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a withdraw request status (approve or reject)
// If approved, update the employee's withdrawnAmount accordingly.
exports.updateWithdrawRequest = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 
  try {
    const request = await WithdrawRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Withdraw request not found' });
    
    request.status = status;
    await request.save();
    
    // If approved, increment the employee's withdrawnAmount
    if (status === 'approved') {
      await Employee.findByIdAndUpdate(request.employee, {
        $inc: { withdrawnAmount: request.amount }
      });
    }
    
    res.status(200).json({ message: `Withdraw request ${status}`, request });
  } catch (error) {
    console.error('Error updating withdraw request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
