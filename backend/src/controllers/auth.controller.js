const bcrypt = require('bcryptjs');
const db = require('../models');
const signToken = require('../utils/token.util');
const validate = require('../utils/validate.util');

exports.customerRegister = async (req, res, next) => {
  try {
    validate(req);
    const { name, email, password } = req.body;

    const exists = await db.User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password: hashed, role: 'customer' });

    return res.status(201).json({
      message: 'Customer registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.staffRegisterByAdmin = async (req, res, next) => {
  try {
    validate(req);
    const { name, email, password, role } = req.body;

    if (!['staff'].includes(role)) {
      return res.status(400).json({ message: 'Only staff role can be created from this endpoint' });
    }

    const exists = await db.User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password: hashed, role: 'staff' });

    return res.status(201).json({
      message: 'Staff account created',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.adminRegister = async (req, res, next) => {
  try {
    validate(req);
    const { name, email, password, setup_key } = req.body;

    const exists = await db.User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const adminCount = await db.User.count({ where: { role: 'admin' } });
    const configuredSetupKey = process.env.ADMIN_SETUP_KEY;
    const hasValidSetupKey = configuredSetupKey && setup_key === configuredSetupKey;
    const isLoggedInAdmin = req.user?.role === 'admin';

    // Rules:
    // 1) First admin can be bootstrapped without setup key.
    // 2) Logged-in admin can create more admins without setup key.
    // 3) Otherwise setup key is required after bootstrap.
    if (adminCount > 0 && !isLoggedInAdmin && !hasValidSetupKey) {
      return res.status(403).json({
        message: 'Admin signup is locked. Login as admin or provide valid setup_key.',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.User.create({ name, email, password: hashed, role: 'admin' });

    return res.status(201).json({
      message: 'Admin account created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    validate(req);
    const { email, password, role } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account blocked. Contact admin.' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not allowed for ${role} login` });
    }

    const token = signToken({ id: user.id, role: user.role });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
