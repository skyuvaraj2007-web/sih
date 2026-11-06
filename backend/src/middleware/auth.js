const jwt = require('jsonwebtoken');
const db = require('../db');
const relationalManager = require('../db/relationalManager');

const JWT_SECRET = process.env.JWT_SECRET || 'skillnexus_quantum_super_secret_jwt_key_2026';

/**
 * Verify JWT token across configured and standard fallback keys
 */
function verifyJwtToken(token) {
  const secrets = [
    process.env.JWT_SECRET,
    (process.env.JWT_SECRET || '').trim(),
    'skillnexus_quantum_super_secret_jwt_key_2026',
    'skillnexus_dev_secret_key_2026_super_secure_node'
  ].filter(Boolean);

  const uniqueSecrets = [...new Set(secrets)];
  let lastErr = null;

  for (const secret of uniqueSecrets) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      lastErr = err;
      if (err.name === 'TokenExpiredError') {
        throw err;
      }
    }
  }

  throw lastErr || new Error('Invalid authentication token');
}

const requireAuth = async (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.nexus_session) {
    token = req.cookies.nexus_session;
  }

  // 2. Check Authorization Header (Bearer token)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  // 3. Reject if no token or string 'undefined' / 'null'
  if (!token || token === 'undefined' || token === 'null' || (typeof token === 'string' && token.trim() === '')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to access this resource.'
    });
  }

  // 4. Verify token cryptographically (isolated from database operations)
  let decoded;
  try {
    decoded = verifyJwtToken(token.trim());
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' 
        ? 'Session expired. Please log in again.' 
        : 'Invalid authentication token. Please log in.'
    });
  }

  // 5. Look up user via relationalManager / fallback
  let user = null;
  try {
    if (decoded.id) {
      user = await relationalManager.getUserById(decoded.id);
    }
    if (!user && decoded.email) {
      user = await relationalManager.getUserByEmail(decoded.email);
    }
    if (!user && !relationalManager.isPgRequired && db && typeof db.getUserById === 'function') {
      user = db.getUserById(decoded.id);
    }
  } catch (lookupErr) {
    console.warn('[requireAuth] Database lookup warning for authenticated user:', lookupErr.message);
  }

  // If DB lookup yielded nothing and token has no basic identifiers, reject
  if (!user && !decoded.id && !decoded.email) {
    return res.status(401).json({
      success: false,
      message: 'Account not found or session revoked. Please log in again.'
    });
  }

  // 6. Hydrate req.user from DB record merged with verified JWT claims
  req.user = {
    ...(user || {}),
    id: user?.id || decoded.id,
    userId: user?.userId || user?.id || decoded.id,
    email: user?.email || decoded.email,
    name: user?.name || decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'User'),
    role: (decoded.role || user?.role || 'student').toLowerCase(),
    institutionId: user?.institutionId || decoded.institutionId || user?.collegeId || decoded.collegeId,
    collegeId: user?.collegeId || decoded.collegeId || user?.institutionId || decoded.institutionId,
    companyId: user?.companyId || decoded.companyId,
    studentId: user?.studentId || decoded.studentId || user?.rollNumber || decoded.rollNumber,
    departmentId: user?.departmentId || decoded.departmentId,
    account_status: user?.account_status || 'ACTIVE'
  };

  // 7. Proceed to next handler outside the try-catch block
  return next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  JWT_SECRET
};

