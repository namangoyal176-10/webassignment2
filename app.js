require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const morgan = require('morgan');
const methodOverride = require('method-override');

const connectDB = require('./config/db');
const { attachUser } = require('./middleware/role');

const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB at startup:', err.message);
});

// Security headers with CDN-friendly CSP
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Google Fonts, Font Awesome, and Chart.js CDNs
  })
);

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method override for PUT / DELETE in forms
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// EJS View Engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session configuration with MongoDB session store
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel_db';
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hostel_secret_key_default_998877',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === 'production' && process.env.FORCE_HTTPS === 'true',
      sameSite: 'lax',
    },
  })
);

// Attach current user & flash messages to all template views
app.use(attachUser);

// Mount Application Routes
app.use('/', publicRoutes);
app.use('/', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

// 404 Error Handler
app.use((req, res) => {
  res.status(404).render('errors/404', {
    pageTitle: 'Page Not Found - 404',
  });
});

// Global 500 Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('errors/500', {
    pageTitle: 'Server Error - 500',
    error: process.env.NODE_ENV === 'development' ? err : null,
  });
});

module.exports = app;
