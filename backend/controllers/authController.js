const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SYSTEM_YEAR = 2026;

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'btech_department_event_hub_secure_key_2026_gemini', {
    expiresIn: '30d'
  });
};

// @desc    Register a BTech Student
// @route   POST /api/auth/register
// @access  Public
exports.registerStudent = async (req, res) => {
  try {
    const { name, rollNo, email, password, department, section } = req.body;

    if (!name || !rollNo || !email || !password || !department || !section) {
      return res.status(400).json({ success: false, message: 'Please provide all registration fields.' });
    }

    // 1. Roll Number Format Verification (e.g., 24481A1270)
    const rollRegex = /^[0-9]{2}[0-9A-Z]{8}$/;
    if (!rollRegex.test(rollNo.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid Roll Number structure. Format must match: YY481AXXNN' });
    }

    const cleanRoll = rollNo.toUpperCase();

    // 2. Parse Admission Year and Graduation Check
    const yearPrefix = parseInt(cleanRoll.substring(0, 2), 10);
    const admissionYear = 2000 + yearPrefix;
    const graduationYear = admissionYear + 4; // BTech duration is 4 years

    // ⚠️ GRADUATION LOCKOUT RULE
    if (SYSTEM_YEAR >= graduationYear) {
      return res.status(403).json({
        success: false,
        message: `Access Expired! You graduated in ${graduationYear}. BTech student access is restricted to 4 active years.`
      });
    }

    // 3. Pursuing Year Calculation
    // Formula: Current Year (2026) - Admission Year + 1
    const pursuingYear = SYSTEM_YEAR - admissionYear + 1;

    // 4. Duplicate Check
    const studentExists = await User.findOne({ $or: [{ rollNo: cleanRoll }, { email: email.toLowerCase() }] });
    if (studentExists) {
      return res.status(400).json({ success: false, message: 'Student with this Roll Number or Email already exists.' });
    }

    // 5. Create Student Account
    const newStudent = await User.create({
      name,
      rollNo: cleanRoll,
      email: email.toLowerCase(),
      password, // Password will be hashed in the pre-save hook in User model
      role: 'student',
      department,
      section,
      admissionYear,
      pursuingYear,
      gradYear: graduationYear
    });

    return res.status(201).json({
      success: true,
      message: 'Student registration completed successfully.',
      token: generateToken(newEventId = newStudent._id),
      user: {
        id: newStudent._id,
        name: newStudent.name,
        rollNo: newStudent.rollNo,
        email: newStudent.email,
        role: newStudent.role,
        department: newStudent.department,
        section: newStudent.section,
        pursuingYear: newStudent.pursuingYear,
        gradYear: newStudent.gradYear,
        badges: newStudent.badges
      }
    });

  } catch (error) {
    console.error(`Registration Controller Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during student registration.' });
  }
};

// @desc    Authenticate Student / Coordinators / Super Admin
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { rollNo, username, password } = req.body;

    // 1. Staff Sign-in Logic (Admin or Coordinator)
    if (username) {
      const cleanUser = username.trim().toLowerCase();

      // Check Super Admin Credentials (Hardcoded config override)
      if (cleanUser === 'admin' && password === 'superadmin') {
        return res.json({
          success: true,
          token: generateToken('superadmin-id-mock'),
          user: {
            id: 'superadmin-id-mock',
            name: 'System Administrator',
            username: 'admin',
            role: 'superadmin'
          }
        });
      }

      // Check Academic Coordinator Accounts in database
      const coord = await User.findOne({ username: cleanUser, role: 'coordinator' });
      if (!coord) {
        return res.status(401).json({ success: false, message: 'Staff credentials not found.' });
      }

      if (coord.status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Access Denied: This Coordinator account is suspended by the Super Admin.' });
      }

      const isMatch = await coord.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password.' });
      }

      return res.json({
        success: true,
        token: generateToken(coord._id),
        user: {
          id: coord._id,
          name: coord.name,
          username: coord.username,
          role: coord.role,
          status: coord.status
        }
      });
    }

    // 2. Student Sign-in Logic
    if (rollNo) {
      const cleanRoll = rollNo.trim().toUpperCase();

      // Lockout Check
      const yearPrefix = parseInt(cleanRoll.substring(0, 2), 10);
      const admissionYear = 2000 + yearPrefix;
      const graduationYear = admissionYear + 4;

      if (SYSTEM_YEAR >= graduationYear) {
        return res.status(403).json({
          success: false,
          message: `Access Expired! You graduated in ${graduationYear}. BTech student access is restricted to 4 active years.`
        });
      }

      const student = await User.findOne({ rollNo: cleanRoll, role: 'student' });
      if (!student) {
        return res.status(401).json({ success: false, message: 'Roll Number not registered. Please register first.' });
      }

      const isMatch = await student.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password.' });
      }

      // Dynamic check to update pursuing year if year changes
      const pursuingYear = SYSTEM_YEAR - student.admissionYear + 1;
      if (student.pursuingYear !== pursuingYear) {
        student.pursuingYear = pursuingYear;
        await student.save();
      }

      return res.json({
        success: true,
        token: generateToken(student._id),
        user: {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          role: student.role,
          department: student.department,
          section: student.section,
          pursuingYear: student.pursuingYear,
          gradYear: student.gradYear,
          badges: student.badges
        }
      });
    }

    return res.status(400).json({ success: false, message: 'Please provide Roll Number or Username.' });

  } catch (error) {
    console.error(`Login Controller Error: ${error.message}`);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};
