const app = require('../app');
const connectDB = require('../config/db');

// Serverless handler for Vercel
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
  }
  return app(req, res);
};
