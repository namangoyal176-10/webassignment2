const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const maintenanceController = require('../controllers/maintenanceController');
const messController = require('../controllers/messController');
const billController = require('../controllers/billController');
const { isAuthenticated } = require('../middleware/auth');
const { requireStudent } = require('../middleware/role');

// All student routes require authentication and student role
router.use(isAuthenticated, requireStudent);

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Room details
router.get('/room', studentController.getRoom);

// Room allotment request
router.get('/room-request', studentController.getRoomRequest);
router.post('/room-request', studentController.postRoomRequest);

// Room change request
router.get('/room-change', studentController.getRoomChange);
router.post('/room-change', studentController.postRoomChange);

// Maintenance tickets
router.get('/maintenance', maintenanceController.getStudentMaintenance);
router.post('/maintenance', maintenanceController.postStudentMaintenance);

// Mess schedule & meals
router.get('/mess', messController.getStudentMess);

// Meal feedback
router.get('/feedback', messController.getStudentFeedback);
router.post('/feedback', messController.postStudentFeedback);

// Mess bills
router.get('/bills', billController.getStudentBills);

// Profile
router.get('/profile', studentController.getProfile);
router.post('/profile', studentController.updateProfile);

module.exports = router;
