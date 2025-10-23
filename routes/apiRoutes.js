const express = require('express');
const router = express.Router();

const { registerEmployee, loginEmployee } = require('../controllers/authController');
const { createContract, getContractsByEmployee } = require('../controllers/contractController');
const { getDashboardData } = require('../controllers/dashboardController');
const { createWithdrawRequest } = require('../controllers/withdrawController');

// Employee registration and login
router.post('/employees/register', registerEmployee);
router.post('/employees/login', loginEmployee);

// Create contract endpoint
router.post('/contracts', createContract);

// GET endpoint to retrieve contracts by employee id (provided as a query parameter)
// Example: GET /api/contracts?employeeId=67dd2779a5a4edd4fbd78b55
router.get('/contracts', getContractsByEmployee);

// Dashboard endpoint: returns profile, earnings, recruits count, contracts count, etc.
router.get('/dashboard/:id', getDashboardData);

// Withdraw request endpoint
router.post('/withdraw', createWithdrawRequest);

module.exports = router;
