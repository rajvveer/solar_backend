const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin registration endpoint
router.post('/register', adminController.registerAdmin);

router.post('/login', adminController.adminLogin);
router.get('/employees', adminController.getAllEmployees);
router.get('/employees/:id', adminController.getEmployeeById);
router.delete('/employees/:id', adminController.deleteEmployee);
router.get('/contracts', adminController.getAllContracts);
router.patch('/contracts/:id/approve', adminController.approveContract);
router.patch('/contracts/:id/reject', adminController.rejectContract);
router.get('/commissions', adminController.getAllCommissions);
router.get('/withdraws', adminController.getWithdrawRequests);
router.patch('/withdraws/:id', adminController.updateWithdrawRequest);

module.exports = router;
