const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const roomController = require('../controllers/roomController');
const maintenanceController = require('../controllers/maintenanceController');
const messController = require('../controllers/messController');
const billController = require('../controllers/billController');
const { isAuthenticated } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/role');

// All admin routes require authentication and admin role
router.use(isAuthenticated, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Students Directory & Vacate Action
router.get('/students', adminController.getStudents);
router.post('/students/:studentId/vacate', roomController.vacateStudent);

// Hostel Blocks
router.get('/blocks', roomController.getBlocks);
router.post('/blocks', roomController.postBlock);
router.post('/blocks/:id', roomController.updateBlock);
router.post('/blocks/:id/delete', roomController.deleteBlock);

// Rooms Management
router.get('/rooms', roomController.getRooms);
router.post('/rooms', roomController.postRoom);
router.post('/rooms/allot', roomController.allotStudentDirect);
router.post('/rooms/:id', roomController.updateRoom);
router.post('/rooms/:id/delete', roomController.deleteRoom);

// Room Requests (Allotments)
router.get('/room-requests', roomController.getRoomRequests);
router.post('/room-requests/:id/approve', roomController.approveRoomRequest);
router.post('/room-requests/:id/reject', roomController.rejectRoomRequest);

// Room Change Requests (Transfers)
router.get('/room-change-requests', roomController.getRoomChangeRequests);
router.post('/room-change-requests/:id/approve', roomController.approveRoomChangeRequest);
router.post('/room-change-requests/:id/reject', roomController.rejectRoomChangeRequest);

// Maintenance Requests
router.get('/maintenance', maintenanceController.getAdminMaintenance);
router.post('/maintenance/:id', maintenanceController.updateMaintenanceStatus);

// Mess Menu Timetable
router.get('/mess-menu', messController.getAdminMessMenu);
router.post('/mess-menu', messController.postAdminMessMenu);

// Meal Feedback Review
router.get('/feedback', messController.getAdminFeedback);

// Meal Attendance
router.get('/meal-attendance', messController.getAdminMealAttendance);
router.post('/meal-attendance', messController.postAdminMealAttendance);

// Mess Bills & Invoicing
router.get('/bills', billController.getAdminBills);
router.post('/bills/generate', billController.postGenerateBills);
router.post('/bills/:id/status', billController.updateBillStatus);

module.exports = router;
