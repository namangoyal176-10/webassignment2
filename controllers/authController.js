const User = require('../models/User');
const mongoose = require('mongoose');

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
  const { email, password } = req.body || {};

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).render('auth/login', {
        pageTitle: 'Login - Hostel Management System',
        error: 'Cloud database (MongoDB Atlas) is not connected yet. Please configure MONGODB_URI in Vercel to log in.',
        email: email || '',
      });
    }

    if (!email || !password) {
      return res.status(200).render('auth/login', {
        pageTitle: 'Login - Hostel Management System',
        error: 'Please enter both email and password.',
        email: email || '',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).render('auth/login', {
        pageTitle: 'Login - Hostel Management System',
        error: 'Invalid email or password.',
        email: email || '',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(200).render('auth/login', {
        pageTitle: 'Login - Hostel Management System',
        error: 'Invalid email or password.',
        email: email || '',
      });
    }

    // Set session data
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;

    req.session.flash = {
      type: 'success',
      message: `Welcome back, ${user.name}!`,
    };

    const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return res.redirect(303, redirectUrl);
  } catch (err) {
    console.error('Login error:', err);
    return res.status(200).render('auth/login', {
      pageTitle: 'Login - Hostel Management System',
      error: 'An error occurred during login. Please try again.',
      email: email || '',
    });
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
  const { name, email, studentId, phone, password, confirmPassword } = req.body || {};

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'Cloud database (MongoDB Atlas) is not connected yet. Please configure MONGODB_URI in Vercel to register.',
        formData: { name, email, studentId, phone },
      });
    }

    // Validation
    if (!name || !email || !studentId || !password || !confirmPassword) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'All required fields must be filled out.',
        formData: { name, email, studentId, phone },
      });
    }

    if (password.length < 6) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'Password must be at least 6 characters long.',
        formData: { name, email, studentId, phone },
      });
    }

    if (password !== confirmPassword) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'Passwords do not match.',
        formData: { name, email, studentId, phone },
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'A user with this email address already exists.',
        formData: { name, email, studentId, phone },
      });
    }

    // Check duplicate studentId
    const existingId = await User.findOne({ studentId: studentId.trim() });
    if (existingId) {
      return res.status(200).render('auth/register', {
        pageTitle: 'Register Student Account',
        error: 'A student with this Student ID already exists.',
        formData: { name, email, studentId, phone },
      });
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
    return res.redirect(303, '/login');
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(200).render('auth/register', {
      pageTitle: 'Register Student Account',
      error: err.message || 'Error occurred during registration.',
      formData: { name, email, studentId, phone },
    });
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
    res.redirect(303, '/login');
  });
};
