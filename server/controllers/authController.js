const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

function sendTokenResponse(user, token, statusCode, res) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    savedAddress: user.savedAddress || {
      addressLine: '',
      city: '',
      state: '',
      pincode: '',
    },
  };

  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: safeUser,
    });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email address, and password.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (isDbConnected()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.',
        });
      }

      const user = await User.create({
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : '',
        password,
        role: 'customer',
      });

      const token = user.getSignedJwtToken();
      return sendTokenResponse(user, token, 201, res);
    }

    // Dev fallback store
    devStore.init();
    const existingMem = devStore.users.find((u) => u.email === normalizedEmail);
    if (existingMem) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    const now = new Date().toISOString();
    const newUser = {
      _id: devStore.makeId(),
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      password: await bcrypt.hash(password, 10),
      role: 'customer',
      savedAddress: { addressLine: '', city: '', state: '', pincode: '' },
      createdAt: now,
      updatedAt: now,
    };
    devStore.users.push(newUser);
    const token = devStore.signToken(newUser);
    return sendTokenResponse(newUser, token, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = user.getSignedJwtToken();
      return sendTokenResponse(user, token, 200, res);
    }

    // Dev fallback store
    devStore.init();
    const memUser = devStore.users.find((u) => u.email === normalizedEmail);
    if (!memUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, memUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = devStore.signToken(memUser);
    return sendTokenResponse(memUser, token, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (_req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
};

exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, savedAddress } = req.body;

    if (isDbConnected()) {
      const updated = await User.findByIdAndUpdate(
        req.user._id,
        {
          ...(name && { name: String(name).trim() }),
          ...(phone !== undefined && { phone: String(phone).trim() }),
          ...(savedAddress && { savedAddress }),
        },
        { new: true, runValidators: true }
      ).lean();

      return res.status(200).json({
        success: true,
        user: updated,
      });
    }

    devStore.init();
    const idx = devStore.users.findIndex((u) => String(u._id) === String(req.user._id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (name) devStore.users[idx].name = String(name).trim();
    if (phone !== undefined) devStore.users[idx].phone = String(phone).trim();
    if (savedAddress) devStore.users[idx].savedAddress = savedAddress;

    return res.status(200).json({
      success: true,
      user: devStore.sanitizeUser(devStore.users[idx]),
    });
  } catch (err) {
    next(err);
  }
};
