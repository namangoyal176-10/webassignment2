const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');
const MessBill = require('../models/MessBill');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Admin Dashboard with Live Analytics
 */
exports.getDashboard = async (req, res) => {
  try {
    // 1. Hostel Occupancy Statistics
    const blocks = await HostelBlock.find().sort({ name: 1 });
    const rooms = await Room.find().populate('block');

    const totalBlocks = blocks.length;
    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyPercent = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Room status counts
    const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;
    const partiallyOccupiedRoomsCount = rooms.filter((r) => r.status === 'Partially Occupied').length;
    const fullRoomsCount = rooms.filter((r) => r.status === 'Full').length;
    const maintenanceRoomsCount = rooms.filter((r) => r.status === 'Maintenance').length;

    // Block-wise breakdown
    const blockBreakdown = blocks.map((b) => {
      const blockRooms = rooms.filter((r) => r.block && r.block._id.toString() === b._id.toString());
      const blockCapacity = blockRooms.reduce((acc, r) => acc + r.capacity, 0);
      const blockOccupied = blockRooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
      const percent = blockCapacity > 0 ? Math.round((blockOccupied / blockCapacity) * 100) : 0;
      return {
        _id: b._id,
        name: b.name,
        blockNumber: b.blockNumber,
        gender: b.gender,
        totalRooms: blockRooms.length,
        capacity: blockCapacity,
        occupied: blockOccupied,
        available: Math.max(0, blockCapacity - blockOccupied),
        occupancyPercent: percent,
      };
    });

    // 2. Request Statistics
    const pendingRoomRequests = await RoomRequest.countDocuments({ status: 'Pending' });
    const pendingRoomChangeRequests = await RoomChangeRequest.countDocuments({ status: 'Pending' });
    const pendingMaintenanceRequests = await MaintenanceRequest.countDocuments({
      status: { $in: ['Pending', 'In Progress'] },
    });

    // 3. Mess & Feedback Statistics
    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex];
    const activeMenu = await MessMenu.findOne({ isActive: true });
    const todayMenu = activeMenu ? activeMenu[todayName] : null;

    const totalFeedbackCount = await MealFeedback.countDocuments();
    const feedbackAggregate = await MealFeedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
        },
      },
    ]);
    const avgRating = feedbackAggregate.length > 0 ? feedbackAggregate[0].avgRating.toFixed(1) : 'N/A';

    // Current month mess collection
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();
    const paidBills = await MessBill.find({ month: currentMonth, year: currentYear, status: 'Paid' });
    const currentMonthCollection = paidBills.reduce((acc, b) => acc + b.totalAmount, 0);

    // Recent 5 Pending Room Requests
    const recentRequests = await RoomRequest.find({ status: 'Pending' })
      .populate('student')
      .populate('preferredBlock')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent 5 Maintenance Tickets
    const recentMaintenance = await MaintenanceRequest.find()
      .populate('student')
      .populate('room')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      pageTitle: 'Admin Dashboard - Overview',
      stats: {
        totalBlocks,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercent,
        availableRoomsCount,
        partiallyOccupiedRoomsCount,
        fullRoomsCount,
        maintenanceRoomsCount,
        pendingRoomRequests,
        pendingRoomChangeRequests,
        pendingMaintenanceRequests,
        totalFeedbackCount,
        avgRating,
        currentMonthCollection,
      },
      blockBreakdown,
      todayName: todayName.charAt(0).toUpperCase() + todayName.slice(1),
      todayMenu,
      recentRequests,
      recentMaintenance,
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Manage Students List & Search
 */
exports.getStudents = async (req, res) => {
  try {
    const { search, block, status } = req.query;

    let query = { role: 'student' };

    if (search) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
      ];
    }

    if (status === 'allotted') {
      query.room = { $ne: null };
    } else if (status === 'unallotted') {
      query.room = null;
    }

    let students = await User.find(query)
      .populate({
        path: 'room',
        populate: { path: 'block' },
      })
      .sort({ createdAt: -1 });

    // Filter by block if requested
    if (block) {
      students = students.filter(
        (s) => s.room && s.room.block && s.room.block._id.toString() === block
      );
    }

    const blocks = await HostelBlock.find().sort({ name: 1 });

    res.render('admin/students', {
      pageTitle: 'Student Directory',
      students,
      blocks,
      filters: { search: search || '', block: block || '', status: status || 'all' },
    });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};
