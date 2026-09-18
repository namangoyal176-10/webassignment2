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
  return res.redirect('/login');
}

/**
 * Guest-only check middleware (for login/register pages)
 */
function isGuest(req, res, next) {
  if (req.session && req.session.userId) {
    if (req.session.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  }
  return next();
}

module.exports = {
  isAuthenticated,
  isGuest,
};
