const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateReferralCode = (name) => {
  // Generate a referral code using the first 4 letters of the name and a random 4-digit number.
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${name.substring(0, 4).toUpperCase()}${randomNum}`;
};

exports.registerEmployee = async (req, res) => {
  const { name, email, password, referralCode } = req.body;
  
  try {
    // Check if employee already exists
    let existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let recruiter = null;
    let level = 1; // Default level (Alpha)

    if (referralCode) {
      // Find the recruiter using the provided referral code
      recruiter = await Employee.findOne({ referralCode });
      if (!recruiter) {
        return res.status(400).json({ message: 'Invalid referral code.' });
      }
      // Check if recruiter already has 2 recruits
      if (recruiter.recruits.length >= 2) {
        return res.status(400).json({ message: 'Recruiter already has 2 recruits.' });
      }
      // Set new employee's level as parent's level + 1 (maximum allowed is 6)
      level = recruiter.level + 1;
      if (level > 6) {
        return res.status(400).json({ message: 'Maximum recruitment level reached.' });
      }
    }

    // Create new employee
    const newEmployee = new Employee({
      name,
      email,
      password: hashedPassword,
      recruiter: recruiter ? recruiter._id : null,
      level,
      referralCode: generateReferralCode(name)
    });

    await newEmployee.save();

    // Update recruiter if applicable
    if (recruiter) {
      recruiter.recruits.push(newEmployee._id);
      await recruiter.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: newEmployee._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Employee registered successfully.',
      token,
      employee: {
        id: newEmployee._id,
        name: newEmployee.name,
        email: newEmployee.email,
        level: newEmployee.level,
        referralCode: newEmployee.referralCode
      }
    });
  } catch (error) {
    console.error('Error registering employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful.',
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        level: employee.level,
        referralCode: employee.referralCode
      }
    });
  } catch (error) {
    console.error('Error logging in employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
