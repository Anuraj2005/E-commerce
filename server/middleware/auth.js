const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isDbConnected } = require('../config/db');
const devStore = require('../services/devMemoryStore');

function extractToken(req) {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}

async function resolveUserFromToken(token) {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || 'artistic_fusion_fallback_secret'
  );

  if (isDbConnected()) {
    const user = await User.findById(decoded.id).lean();
    return user || null;
  }

  devStore.init();
  const memUser = devStore.users.find((u) => String(u._id) === String(decoded.id));
  return devStore.sanitizeUser(memUser);
}

exports.protect = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to continue.',
    });
  }

  try {
    const user = await resolveUserFromToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or user no longer exists. Please sign in again.',
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

exports.optionalAuth = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const user = await resolveUserFromToken(token);
    if (user) req.user = user;
  } catch {
    // Ignore invalid optional token
  }
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role || 'guest'}' does not have permission to access this resource.`,
      });
    }
    next();
  };
};
