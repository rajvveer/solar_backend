const Contract = require('../models/Contract');
const Employee = require('../models/Employee');

exports.createContract = async (req, res) => {
  const { employeeId, buyerName, kwBought, buyerContact } = req.body;
  
  try {
    // Validate that the employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Validate that KW bought is at least 5
    if (Number(kwBought) < 5) {
      return res.status(400).json({ message: 'Minimum KW bought must be at least 5.' });
    }
    
    // Create the contract with buyer details and a "processing" status.
    const contract = new Contract({
      employee: employeeId,
      buyerName,
      kwBought: Number(kwBought), 
      buyerContact,
      amount: 2500, // default contract amount
      approved: false,
      rejected: false, 
    });
    await contract.save();
    
    // Commission distribution will happen later upon admin approval.
    
    res.status(201).json({ 
      message: 'Contract created successfully and is under processing.', 
      contract 
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//function to retrieve contracts by employee id
exports.getContractsByEmployee = async (req, res) => {
  const { employeeId } = req.query;
  
  try {
    // Find contracts by employee ID. Adjust query criteria if needed.
    const contracts = await Contract.find({ employee: employeeId });
    res.status(200).json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
