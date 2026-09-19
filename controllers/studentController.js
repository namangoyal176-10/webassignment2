const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');
const MessBill = require('../models/MessBill');

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Student Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      const student = demoData.students[0];
      const todayIndex = new Date().getDay();
      const todayName = DAYS[todayIndex];
      const todayMeals = demoData.messMenu ? demoData.messMenu[todayName] : null;

      return res.render('student/dashboard', {
        pageTitle: 'Student Dashboard',
        student,
        room: student.room,
        latestRoomRequest: demoData.roomRequests[1],
        latestChangeRequest: null,
        pendingMaintenance: demoData.maintenanceRequests.filter((m) => m.student._id === student._id),
        todayName: todayName.charAt(0).toUpperCase() + todayName.slice(1),
        todayMeals,
        latestBill: demoData.messBills[0],
      });
    }

    const student = await User.findById(req.session.userId).populate({
      path: 'room',
      populate: [
        { path: 'block' },
        { path: 'students', select: 'name studentId phone email' },
      ],
    });

    // Recent room request
    const latestRoomRequest = await RoomRequest.findOne({ student: student._id })
      .populate('preferredBlock')
      .sort({ createdAt: -1 });

    // Recent room change request
    const latestChangeRequest = await RoomChangeRequest.findOne({ student: student._id })
      .populate('requestedRoom')
      .sort({ createdAt: -1 });

    // Pending maintenance count
    const pendingMaintenance = await MaintenanceRequest.find({
      student: student._id,
      status: { $in: ['Pending', 'In Progress'] },
    }).sort({ createdAt: -1 });

    // Today's mess menu
    const todayIndex = new Date().getDay();
    const todayName = DAYS[todayIndex];
    const activeMenu = await MessMenu.findOne({ isActive: true });
    const todayMeals = activeMenu ? activeMenu[todayName] : null;

    // Latest mess bill
    const latestBill = await MessBill.findOne({ student: student._id }).sort({ generatedAt: -1 });

    res.render('student/dashboard', {
      pageTitle: 'Student Dashboard',
      student,
      room: student.room,
      latestRoomRequest,
      latestChangeRequest,
      pendingMaintenance,
      todayName: todayName.charAt(0).toUpperCase() + todayName.slice(1),
      todayMeals,
      latestBill,
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * View Current Room & Roommates
 */
exports.getRoom = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      const student = demoData.students[0];
      return res.render('student/room', {
        pageTitle: 'My Room Details',
        student,
        room: student.room,
      });
    }

    const student = await User.findById(req.session.userId).populate({
      path: 'room',
      populate: [
        { path: 'block' },
        { path: 'students', select: 'name studentId phone email createdAt' },
      ],
    });

    res.render('student/room', {
      pageTitle: 'My Room Details',
      student,
      room: student.room,
    });
  } catch (err) {
    console.error('Student room view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Request Hostel Room Page
 */
exports.getRoomRequest = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      const student = demoData.students[0];
      return res.render('student/room-request', {
        pageTitle: 'Request Hostel Room',
        student,
        blocks: demoData.blocks,
        requests: demoData.roomRequests,
        hasPendingRequest: false,
      });
    }

    const student = await User.findById(req.session.userId).populate('room');
    const blocks = await HostelBlock.find().sort({ name: 1 });
    const requests = await RoomRequest.find({ student: student._id })
      .populate('preferredBlock')
      .sort({ createdAt: -1 });

    const hasPendingRequest = requests.some((r) => r.status === 'Pending');

    res.render('student/room-request', {
      pageTitle: 'Request Hostel Room',
      student,
      blocks,
      requests,
      hasPendingRequest,
    });
  } catch (err) {
    console.error('Room request page error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Submit Room Request
 */
exports.postRoomRequest = async (req, res) => {
  try {
    const student = await User.findById(req.session.userId);
    if (student.room) {
      req.session.flash = {
        type: 'warning',
        message: 'You already have an allotted room. Use Room Change Request if you wish to transfer.',
      };
      return res.redirect('/student/room-request');
    }

    const pendingRequest = await RoomRequest.findOne({
      student: student._id,
      status: 'Pending',
    });

    if (pendingRequest) {
      req.session.flash = {
        type: 'warning',
        message: 'You already have a pending room request. Please wait for admin review.',
      };
      return res.redirect('/student/room-request');
    }

    const { preferredBlock, preferredRoomType, reason } = req.body;

    if (!preferredBlock || !preferredRoomType) {
      req.session.flash = {
        type: 'danger',
        message: 'Please choose your preferred block and room type.',
      };
      return res.redirect('/student/room-request');
    }

    await RoomRequest.create({
      student: student._id,
      preferredBlock,
      preferredRoomType,
      reason: reason ? reason.trim() : '',
    });

    req.session.flash = {
      type: 'success',
      message: 'Your room allotment request has been submitted successfully!',
    };
    return res.redirect('/student/room-request');
  } catch (err) {
    console.error('Submit room request error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Failed to submit room request. Please try again.',
    };
    return res.redirect('/student/room-request');
  }
};

/**
 * Room Change Request Page
 */
exports.getRoomChange = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      const student = demoData.students[0];
      return res.render('student/room-change', {
        pageTitle: 'Room Change Request',
        student,
        currentRoom: student.room,
        availableRooms: demoData.rooms.filter((r) => r.status === 'Available'),
        requests: demoData.roomChangeRequests,
        hasPendingRequest: false,
      });
    }

    const student = await User.findById(req.session.userId).populate({
      path: 'room',
      populate: { path: 'block' },
    });

    if (!student.room) {
      req.session.flash = {
        type: 'warning',
        message: 'You must have an allotted room before you can request a room transfer.',
      };
      return res.redirect('/student/room-request');
    }

    // Fetch rooms with available beds (occupiedBeds < capacity) that are not the student's current room
    const availableRooms = await Room.find({
      _id: { $ne: student.room._id },
      status: { $in: ['Available', 'Partially Occupied'] },
      $expr: { $lt: ['$occupiedBeds', '$capacity'] },
    }).populate('block').sort({ roomNumber: 1 });

    const requests = await RoomChangeRequest.find({ student: student._id })
      .populate('currentRoom')
      .populate({
        path: 'requestedRoom',
        populate: { path: 'block' },
      })
      .sort({ createdAt: -1 });

    const hasPendingRequest = requests.some((r) => r.status === 'Pending');

    res.render('student/room-change', {
      pageTitle: 'Room Change Request',
      student,
      currentRoom: student.room,
      availableRooms,
      requests,
      hasPendingRequest,
    });
  } catch (err) {
    console.error('Room change page error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Submit Room Change Request
 */
exports.postRoomChange = async (req, res) => {
  try {
    const student = await User.findById(req.session.userId);
    if (!student.room) {
      req.session.flash = {
        type: 'danger',
        message: 'No active room allotment found.',
      };
      return res.redirect('/student/room-request');
    }

    const hasPending = await RoomChangeRequest.findOne({
      student: student._id,
      status: 'Pending',
    });

    if (hasPending) {
      req.session.flash = {
        type: 'warning',
        message: 'You already have a pending room change request in review.',
      };
      return res.redirect('/student/room-change');
    }

    const { requestedRoom, reason } = req.body;
    if (!requestedRoom || !reason) {
      req.session.flash = {
        type: 'danger',
        message: 'Please select a room and provide a reason for the transfer.',
      };
      return res.redirect('/student/room-change');
    }

    // Verify requested room capacity
    const targetRoom = await Room.findById(requestedRoom);
    if (!targetRoom || targetRoom.occupiedBeds >= targetRoom.capacity || targetRoom.status === 'Full' || targetRoom.status === 'Maintenance') {
      req.session.flash = {
        type: 'danger',
        message: 'The requested room is currently full or unavailable.',
      };
      return res.redirect('/student/room-change');
    }

    await RoomChangeRequest.create({
      student: student._id,
      currentRoom: student.room,
      requestedRoom: targetRoom._id,
      reason: reason.trim(),
    });

    req.session.flash = {
      type: 'success',
      message: 'Room change request submitted for warden review.',
    };
    return res.redirect('/student/room-change');
  } catch (err) {
    console.error('Submit room change error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Failed to submit room change request.',
    };
    return res.redirect('/student/room-change');
  }
};

/**
 * Student Profile Page
 */
exports.getProfile = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('student/profile', {
        pageTitle: 'My Profile',
        student: demoData.students[0],
      });
    }

    const student = await User.findById(req.session.userId).populate({
      path: 'room',
      populate: { path: 'block' },
    });

    res.render('student/profile', {
      pageTitle: 'My Profile',
      student,
    });
  } catch (err) {
    console.error('Profile view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Update Student Profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { phone, currentPassword, newPassword } = req.body;
    const student = await User.findById(req.session.userId);

    if (phone) {
      student.phone = phone.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        req.session.flash = {
          type: 'danger',
          message: 'Current password is required to set a new password.',
        };
        return res.redirect('/student/profile');
      }

      const isMatch = await student.comparePassword(currentPassword);
      if (!isMatch) {
        req.session.flash = {
          type: 'danger',
          message: 'Current password incorrect.',
        };
        return res.redirect('/student/profile');
      }

      if (newPassword.length < 6) {
        req.session.flash = {
          type: 'danger',
          message: 'New password must be at least 6 characters.',
        };
        return res.redirect('/student/profile');
      }

      student.password = newPassword;
    }

    await student.save();
    req.session.flash = {
      type: 'success',
      message: 'Profile updated successfully.',
    };
    return res.redirect('/student/profile');
  } catch (err) {
    console.error('Update profile error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Error updating profile.',
    };
    return res.redirect('/student/profile');
  }
};
