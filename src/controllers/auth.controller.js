import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../config/logger.js';
import { User, Store } from '../models/index.js'; // Ensure correct path to your models index
import { catchAsync } from '../utils/catchAsync.js';

/**
 * Helper: Password Validator
 * Requirements: 8-16 chars, 1 Uppercase, 1 Special Char
 */
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  return regex.test(password);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // 1. Business Validation: Name Length (Assignment req: 20-60)
    if (!name || name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 20 and 60 characters",
        errorCode: "VALIDATION_ERROR"
      });
    }

    // 2. Business Validation: Password Strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-16 chars, include 1 uppercase and 1 special char.",
        errorCode: "WEAK_PASSWORD"
      });
    }

    // 3. Check for existing user
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
        errorCode: "EMAIL_ALREADY_EXISTS"
      });
    }

    // 4. Hash and Create
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      address,
      password: hashedPassword,
      role: 'User' // Default role as per requirement
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      errorCode: "SERVER_ERROR"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 1. Find actual user in Database
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // 2. Verify actual password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // 3. Token Generation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }
    });

  } catch (error) {
    logger.error(`Login error: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProfile = catchAsync(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const userData = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] },
      include: [{ model: Store, as: 'managedStore', attributes: ['id', 'name'], required: false }]
    });

  return res.json({
    success: true,
    message: "Profile retrieved successfully",
    data: { user: userData }
  });
});

export const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ success: false, message: 'Password must be 8-16 chars, include 1 uppercase and 1 special char.' });
  }
  const user = await User.findByPk(req.user.userId);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ success: true, message: 'Password updated successfully' });
});