const User = require('../models/User');

/**
 * Render Login Page
 */
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login - Hostel Management System',
  });
};

/**
 * Process Login
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.flash = {
        type: 'danger',
        message: 'Please enter both email and password.',
      };
      return res.redirect('/login');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      req.session.flash = {
        type: 'danger',
        message: 'Invalid email or password.',
      };
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.session.flash = {
        type: 'danger',
        message: 'Invalid email or password.',
      };
      return res.redirect('/login');
    }

    // Set session data
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;

    req.session.flash = {
      type: 'success',
      message: `Welcome back, ${user.name}!`,
    };

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'An error occurred during login. Please try again.',
    };
    return res.redirect('/login');
  }
};

/**
 * Render Registration Page
 */
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Register Student Account',
  });
};

/**
 * Process Student Registration
 */
exports.postRegister = async (req, res) => {
  try {
    const { name, email, studentId, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !studentId || !password || !confirmPassword) {
      req.session.flash = {
        type: 'danger',
        message: 'All required fields must be filled out.',
      };
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.session.flash = {
        type: 'danger',
        message: 'Password must be at least 6 characters long.',
      };
      return res.redirect('/register');
    }

    if (password !== confirmPassword) {
      req.session.flash = {
        type: 'danger',
        message: 'Passwords do not match.',
      };
      return res.redirect('/register');
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      req.session.flash = {
        type: 'danger',
        message: 'A user with this email address already exists.',
      };
      return res.redirect('/register');
    }

    // Check duplicate studentId
    const existingId = await User.findOne({ studentId: studentId.trim() });
    if (existingId) {
      req.session.flash = {
        type: 'danger',
        message: 'A student with this Student ID already exists.',
      };
      return res.redirect('/register');
    }

    // Normal registrations are strictly 'student' role for security
    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId: studentId.trim(),
      phone: phone ? phone.trim() : '',
      password: password,
      role: 'student',
    });

    req.session.flash = {
      type: 'success',
      message: 'Registration successful! You can now log in with your credentials.',
    };
    return res.redirect('/login');
  } catch (err) {
    console.error('Registration error:', err);
    req.session.flash = {
      type: 'danger',
      message: err.message || 'Error occurred during registration.',
    };
    return res.redirect('/register');
  }
};

/**
 * Process Logout
 */
exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
