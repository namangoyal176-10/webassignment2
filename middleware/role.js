const User = require('../models/User');

/**
 * Ensures the logged-in user has 'admin' role
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.role === 'admin') {
    return next();
  }

  if (req.session && req.session.role === 'student') {
    req.session.flash = {
      type: 'danger',
      message: 'Access denied: Admin privileges required.',
    };
    return res.redirect(303, '/student/dashboard');
  }

  return res.redirect(303, '/login');
}

/**
 * Ensures the logged-in user has 'student' role
 */
function requireStudent(req, res, next) {
  if (req.session && req.session.role === 'student') {
    return next();
  }

  if (req.session && req.session.role === 'admin') {
    return res.redirect(303, '/admin/dashboard');
  }

  if (req.session) {
    req.session.flash = {
      type: 'danger',
      message: 'Access denied: Student access only.',
    };
  }
  return res.redirect(303, '/login');
}

/**
 * Global locals middleware: attaches currentUser, active path, and extracts flash messages
 */
async function attachUser(req, res, next) {
  res.locals.path = req.path;
  res.locals.currentUser = null;
  res.locals.flash = null;

  // Extract flash message if present and clear it
  if (req.session && req.session.flash) {
    res.locals.flash = req.session.flash;
    req.session.flash = null;
  }

  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).populate({
        path: 'room',
        populate: { path: 'block' },
      });
      if (user) {
        res.locals.currentUser = user;
      } else {
        // User record was deleted from database
        req.session.destroy();
      }
    } catch (err) {
      console.error('Error fetching current user:', err.message);
    }
  }

  next();
}

module.exports = {
  requireAdmin,
  requireStudent,
  attachUser,
};
