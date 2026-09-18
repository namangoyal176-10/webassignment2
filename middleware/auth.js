/**
 * Authentication check middleware
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  
  if (req.session) {
    req.session.flash = {
      type: 'danger',
      message: 'Please log in to access this page.',
    };
  }
  return res.redirect(303, '/login');
}

/**
 * Guest-only check middleware (for login/register pages)
 */
function isGuest(req, res, next) {
  if (req.session && req.session.userId) {
    if (req.session.role === 'admin') {
      return res.redirect(303, '/admin/dashboard');
    }
    if (req.session.role === 'student') {
      return res.redirect(303, '/student/dashboard');
    }
    // Corrupted or incomplete session
    delete req.session.userId;
    delete req.session.role;
    return next();
  }
  return next();
}

module.exports = {
  isAuthenticated,
  isGuest,
};
