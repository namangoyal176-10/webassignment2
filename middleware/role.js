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
    const mongoose = require('mongoose');
    const isDemoUser = req.session.userId.startsWith('admin') || req.session.userId.startsWith('stu');
    
    if (mongoose.connection.readyState === 1 && !isDemoUser) {
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
    } else {
      // Provide demo user in preview demo mode
      const demoData = require('../services/demoData');
      if (req.session.role === 'admin') {
        res.locals.currentUser = demoData.admin;
      } else {
        res.locals.currentUser = demoData.students[0];
      }
    }
  }

  next();
}

module.exports = {
  requireAdmin,
  requireStudent,
  attachUser,
};
