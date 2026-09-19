const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const User = require('../models/User');
const RoomRequest = require('../models/RoomRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');

const DEFAULT_CAPACITY = {
  'Single': 1,
  'Double': 2,
  'Triple': 3,
  'Four Sharing': 4,
};

/**
 * Update a room's status based on current occupancy and capacity
 */
function computeRoomStatus(room) {
  if (room.status === 'Maintenance') return 'Maintenance';
  if (room.occupiedBeds <= 0) return 'Available';
  if (room.occupiedBeds >= room.capacity) return 'Full';
  return 'Partially Occupied';
}

// ==========================================
// BLOCK MANAGEMENT
// ==========================================

exports.getBlocks = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      const blockStats = demoData.blocks.map((b) => {
        const rooms = demoData.rooms.filter((r) => r.block._id === b._id);
        const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
        return {
          ...b,
          roomCount: rooms.length,
          totalBeds,
          occupiedBeds,
          availableBeds: Math.max(0, totalBeds - occupiedBeds),
        };
      });
      return res.render('admin/blocks', {
        pageTitle: 'Hostel Block Management',
        blocks: blockStats,
      });
    }

    const blocks = await HostelBlock.find().sort({ blockNumber: 1 });
    
    // Augment with live room counts and occupancy
    const blockStats = await Promise.all(
      blocks.map(async (b) => {
        const rooms = await Room.find({ block: b._id });
        const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
        const occupiedBeds = rooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
        return {
          ...b.toObject(),
          roomCount: rooms.length,
          totalBeds,
          occupiedBeds,
          availableBeds: Math.max(0, totalBeds - occupiedBeds),
        };
      })
    );

    res.render('admin/blocks', {
      pageTitle: 'Hostel Block Management',
      blocks: blockStats,
    });
  } catch (err) {
    console.error('Get blocks error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

exports.postBlock = async (req, res) => {
  try {
    const { name, blockNumber, gender, totalRooms, description } = req.body;

    if (!name || !blockNumber) {
      req.session.flash = { type: 'danger', message: 'Block Name and Block Code are required.' };
      return res.redirect('/admin/blocks');
    }

    const existing = await HostelBlock.findOne({ blockNumber: blockNumber.trim().toUpperCase() });
    if (existing) {
      req.session.flash = { type: 'danger', message: 'A block with this Block Code already exists.' };
      return res.redirect('/admin/blocks');
    }

    await HostelBlock.create({
      name: name.trim(),
      blockNumber: blockNumber.trim().toUpperCase(),
      gender: gender || 'Boys',
      totalRooms: Number(totalRooms) || 0,
      description: description ? description.trim() : '',
    });

    req.session.flash = { type: 'success', message: 'Hostel Block added successfully.' };
    return res.redirect('/admin/blocks');
  } catch (err) {
    console.error('Create block error:', err);
    req.session.flash = { type: 'danger', message: 'Error creating block.' };
    return res.redirect('/admin/blocks');
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, totalRooms, description } = req.body;

    await HostelBlock.findByIdAndUpdate(id, {
      name: name.trim(),
      gender,
      totalRooms: Number(totalRooms) || 0,
      description: description ? description.trim() : '',
    });

    req.session.flash = { type: 'success', message: 'Block details updated successfully.' };
    return res.redirect('/admin/blocks');
  } catch (err) {
    console.error('Update block error:', err);
    req.session.flash = { type: 'danger', message: 'Error updating block.' };
    return res.redirect('/admin/blocks');
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any rooms in this block have students
    const occupiedRoom = await Room.findOne({ block: id, occupiedBeds: { $gt: 0 } });
    if (occupiedRoom) {
      req.session.flash = {
        type: 'danger',
        message: 'Cannot delete block: One or more rooms in this block currently have allotted students. Vacate them first.',
      };
      return res.redirect('/admin/blocks');
    }

    // Delete all associated rooms
    await Room.deleteMany({ block: id });
    await HostelBlock.findByIdAndDelete(id);

    req.session.flash = { type: 'success', message: 'Block and associated empty rooms deleted successfully.' };
    return res.redirect('/admin/blocks');
  } catch (err) {
    console.error('Delete block error:', err);
    req.session.flash = { type: 'danger', message: 'Error deleting block.' };
    return res.redirect('/admin/blocks');
  }
};

// ==========================================
// ROOM MANAGEMENT
// ==========================================

exports.getRooms = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('admin/rooms', {
        pageTitle: 'Room Management',
        rooms: demoData.rooms,
        blocks: demoData.blocks,
        unallottedStudents: demoData.students.filter((s) => !s.room),
        filters: { block: '', roomType: '', status: '', search: '' },
      });
    }

    const { block, roomType, status, search } = req.query;
    const filter = {};

    if (block) filter.block = block;
    if (roomType) filter.roomType = roomType;
    if (status) filter.status = status;
    if (search) {
      filter.roomNumber = { $regex: search.trim(), $options: 'i' };
    }

    const rooms = await Room.find(filter)
      .populate('block')
      .populate('students', 'name studentId email')
      .sort({ roomNumber: 1 });

    const blocks = await HostelBlock.find().sort({ name: 1 });

    // Available unallotted students for manual assignment modal
    const unallottedStudents = await User.find({ role: 'student', room: null }).sort({ name: 1 });

    res.render('admin/rooms', {
      pageTitle: 'Room Management',
      rooms,
      blocks,
      unallottedStudents,
      filters: { block, roomType, status, search: search || '' },
    });
  } catch (err) {
    console.error('Get rooms error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

exports.postRoom = async (req, res) => {
  try {
    const { roomNumber, block, roomType, capacity, status } = req.body;

    if (!roomNumber || !block || !roomType) {
      req.session.flash = { type: 'danger', message: 'Room Number, Block, and Room Type are required.' };
      return res.redirect('/admin/rooms');
    }

    const cap = Number(capacity) || DEFAULT_CAPACITY[roomType] || 2;

    const existing = await Room.findOne({ block, roomNumber: roomNumber.trim().toUpperCase() });
    if (existing) {
      req.session.flash = { type: 'danger', message: 'A room with this number already exists in the selected block.' };
      return res.redirect('/admin/rooms');
    }

    await Room.create({
      roomNumber: roomNumber.trim().toUpperCase(),
      block,
      roomType,
      capacity: cap,
      occupiedBeds: 0,
      status: status || 'Available',
      students: [],
    });

    // Update block's totalRooms count
    await HostelBlock.findByIdAndUpdate(block, { $inc: { totalRooms: 1 } });

    req.session.flash = { type: 'success', message: 'Room created successfully.' };
    return res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Create room error:', err);
    req.session.flash = { type: 'danger', message: 'Error creating room.' };
    return res.redirect('/admin/rooms');
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomType, capacity, status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      req.session.flash = { type: 'danger', message: 'Room not found.' };
      return res.redirect('/admin/rooms');
    }

    const newCapacity = Number(capacity) || room.capacity;
    if (newCapacity < room.occupiedBeds) {
      req.session.flash = {
        type: 'danger',
        message: `Capacity cannot be set lower than the current occupied beds (${room.occupiedBeds}).`,
      };
      return res.redirect('/admin/rooms');
    }

    room.roomNumber = roomNumber ? roomNumber.trim().toUpperCase() : room.roomNumber;
    room.roomType = roomType || room.roomType;
    room.capacity = newCapacity;
    if (status) {
      room.status = status;
    }
    room.status = computeRoomStatus(room);

    await room.save();

    req.session.flash = { type: 'success', message: 'Room updated successfully.' };
    return res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Update room error:', err);
    req.session.flash = { type: 'danger', message: 'Error updating room.' };
    return res.redirect('/admin/rooms');
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      req.session.flash = { type: 'danger', message: 'Room not found.' };
      return res.redirect('/admin/rooms');
    }

    if (room.occupiedBeds > 0 || (room.students && room.students.length > 0)) {
      req.session.flash = {
        type: 'danger',
        message: 'Cannot delete room with active residents. Vacate all students first.',
      };
      return res.redirect('/admin/rooms');
    }

    await Room.findByIdAndDelete(id);
    await HostelBlock.findByIdAndUpdate(room.block, { $inc: { totalRooms: -1 } });

    req.session.flash = { type: 'success', message: 'Room deleted successfully.' };
    return res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Delete room error:', err);
    req.session.flash = { type: 'danger', message: 'Error deleting room.' };
    return res.redirect('/admin/rooms');
  }
};

// ==========================================
// ALLOTMENT & VACATE LOGIC
// ==========================================

/**
 * Direct Manual Allotment by Admin
 */
exports.allotStudentDirect = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;

    if (!roomId || !studentId) {
      req.session.flash = { type: 'danger', message: 'Room and Student must be selected.' };
      return res.redirect('/admin/rooms');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      req.session.flash = { type: 'danger', message: 'Target room does not exist.' };
      return res.redirect('/admin/rooms');
    }

    // Capacity & Status Validation
    if (room.occupiedBeds >= room.capacity || room.status === 'Full' || room.status === 'Maintenance') {
      req.session.flash = { type: 'danger', message: 'Room is already at full capacity or in maintenance!' };
      return res.redirect('/admin/rooms');
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      req.session.flash = { type: 'danger', message: 'Invalid student selected.' };
      return res.redirect('/admin/rooms');
    }

    if (student.room) {
      req.session.flash = { type: 'warning', message: 'Student is already allotted to another room.' };
      return res.redirect('/admin/rooms');
    }

    // Allot student
    room.students.push(student._id);
    room.occupiedBeds += 1;
    room.status = computeRoomStatus(room);
    await room.save();

    student.room = room._id;
    await student.save();

    req.session.flash = {
      type: 'success',
      message: `Successfully allotted ${student.name} to Room ${room.roomNumber}.`,
    };
    return res.redirect('/admin/rooms');
  } catch (err) {
    console.error('Direct allotment error:', err);
    req.session.flash = { type: 'danger', message: 'Failed to allot student.' };
    return res.redirect('/admin/rooms');
  }
};

/**
 * Vacate Student Action
 */
exports.vacateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const redirectPath = req.body.redirectTo || req.query.redirectTo || '/admin/students';

    const student = await User.findById(studentId);
    if (!student) {
      req.session.flash = { type: 'danger', message: 'Student not found.' };
      return res.redirect(redirectPath);
    }

    if (!student.room) {
      req.session.flash = { type: 'warning', message: 'Student does not have an allotted room.' };
      return res.redirect(redirectPath);
    }

    const room = await Room.findById(student.room);
    if (room) {
      // Remove student from room
      room.students = room.students.filter((id) => id.toString() !== student._id.toString());
      room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
      room.status = computeRoomStatus(room);
      await room.save();
    }

    // Clear student's room pointer
    student.room = null;
    await student.save();

    req.session.flash = {
      type: 'success',
      message: `Successfully vacated ${student.name}. Bed is now available.`,
    };
    return res.redirect(redirectPath);
  } catch (err) {
    console.error('Vacate student error:', err);
    req.session.flash = { type: 'danger', message: 'Error vacating student.' };
    return res.redirect('/admin/students');
  }
};

// ==========================================
// ROOM REQUESTS (NEW ALLOTMENTS)
// ==========================================

exports.getRoomRequests = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('admin/room-requests', {
        pageTitle: 'Room Allotment Requests',
        requests: demoData.roomRequests,
        availableRooms: demoData.rooms.filter((r) => r.status === 'Available'),
        selectedStatus: 'All',
      });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await RoomRequest.find(filter)
      .populate('student')
      .populate('preferredBlock')
      .sort({ createdAt: -1 });

    // Available rooms with space for allotment modal
    const availableRooms = await Room.find({
      status: { $in: ['Available', 'Partially Occupied'] },
      $expr: { $lt: ['$occupiedBeds', '$capacity'] },
    }).populate('block').sort({ roomNumber: 1 });

    res.render('admin/room-requests', {
      pageTitle: 'Room Allotment Requests',
      requests,
      availableRooms,
      selectedStatus: status || 'All',
    });
  } catch (err) {
    console.error('Get room requests error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

exports.approveRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedRoomId, remarks } = req.body;

    const request = await RoomRequest.findById(id).populate('student');
    if (!request || request.status !== 'Pending') {
      req.session.flash = { type: 'danger', message: 'Request is either missing or already processed.' };
      return res.redirect('/admin/room-requests');
    }

    const student = await User.findById(request.student._id);
    if (student.room) {
      request.status = 'Rejected';
      request.adminRemarks = 'Student already has an active room allotment.';
      request.reviewedAt = new Date();
      await request.save();
      req.session.flash = { type: 'warning', message: 'Student already has a room. Request rejected.' };
      return res.redirect('/admin/room-requests');
    }

    // Find candidate room
    let targetRoom = null;
    if (assignedRoomId) {
      targetRoom = await Room.findById(assignedRoomId);
    } else {
      // Find room in preferred block with preferred room type and available space
      targetRoom = await Room.findOne({
        block: request.preferredBlock,
        roomType: request.preferredRoomType,
        status: { $in: ['Available', 'Partially Occupied'] },
        $expr: { $lt: ['$occupiedBeds', '$capacity'] },
      });
    }

    if (!targetRoom) {
      req.session.flash = {
        type: 'danger',
        message: 'No available room found matching the requirements. Please specify an alternative room.',
      };
      return res.redirect('/admin/room-requests');
    }

    // Ensure capacity
    if (targetRoom.occupiedBeds >= targetRoom.capacity || targetRoom.status === 'Full' || targetRoom.status === 'Maintenance') {
      req.session.flash = { type: 'danger', message: 'Selected room is full or in maintenance.' };
      return res.redirect('/admin/room-requests');
    }

    // Allot
    targetRoom.students.push(student._id);
    targetRoom.occupiedBeds += 1;
    targetRoom.status = computeRoomStatus(targetRoom);
    await targetRoom.save();

    student.room = targetRoom._id;
    await student.save();

    request.status = 'Approved';
    request.adminRemarks = remarks ? remarks.trim() : `Allotted to Room ${targetRoom.roomNumber}`;
    request.reviewedAt = new Date();
    await request.save();

    req.session.flash = {
      type: 'success',
      message: `Request approved. ${student.name} allotted to Room ${targetRoom.roomNumber}.`,
    };
    return res.redirect('/admin/room-requests');
  } catch (err) {
    console.error('Approve room request error:', err);
    req.session.flash = { type: 'danger', message: 'Error approving room request.' };
    return res.redirect('/admin/room-requests');
  }
};

exports.rejectRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await RoomRequest.findById(id);
    if (!request || request.status !== 'Pending') {
      req.session.flash = { type: 'danger', message: 'Request not found or already reviewed.' };
      return res.redirect('/admin/room-requests');
    }

    request.status = 'Rejected';
    request.adminRemarks = remarks ? remarks.trim() : 'Request declined by warden.';
    request.reviewedAt = new Date();
    await request.save();

    req.session.flash = { type: 'success', message: 'Room request rejected.' };
    return res.redirect('/admin/room-requests');
  } catch (err) {
    console.error('Reject room request error:', err);
    req.session.flash = { type: 'danger', message: 'Error rejecting room request.' };
    return res.redirect('/admin/room-requests');
  }
};

// ==========================================
// ROOM CHANGE REQUESTS (TRANSFERS)
// ==========================================

exports.getRoomChangeRequests = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('admin/room-change-requests', {
        pageTitle: 'Room Change Requests',
        requests: demoData.roomChangeRequests,
        selectedStatus: 'All',
      });
    }

    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await RoomChangeRequest.find(filter)
      .populate('student')
      .populate({ path: 'currentRoom', populate: { path: 'block' } })
      .populate({ path: 'requestedRoom', populate: { path: 'block' } })
      .sort({ createdAt: -1 });

    res.render('admin/room-change-requests', {
      pageTitle: 'Room Change Requests',
      requests,
      selectedStatus: status || 'All',
    });
  } catch (err) {
    console.error('Get room change requests error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

exports.approveRoomChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await RoomChangeRequest.findById(id)
      .populate('student')
      .populate('currentRoom')
      .populate('requestedRoom');

    if (!request || request.status !== 'Pending') {
      req.session.flash = { type: 'danger', message: 'Request not found or already processed.' };
      return res.redirect('/admin/room-change-requests');
    }

    const student = await User.findById(request.student._id);
    const targetRoom = await Room.findById(request.requestedRoom._id);

    if (!targetRoom || targetRoom.occupiedBeds >= targetRoom.capacity || targetRoom.status === 'Full' || targetRoom.status === 'Maintenance') {
      req.session.flash = {
        type: 'danger',
        message: 'Cannot approve: Requested room is already full or undergoing maintenance.',
      };
      return res.redirect('/admin/room-change-requests');
    }

    // 1. Remove from old room if currently allotted
    if (student.room) {
      const oldRoom = await Room.findById(student.room);
      if (oldRoom) {
        oldRoom.students = oldRoom.students.filter((sid) => sid.toString() !== student._id.toString());
        oldRoom.occupiedBeds = Math.max(0, oldRoom.occupiedBeds - 1);
        oldRoom.status = computeRoomStatus(oldRoom);
        await oldRoom.save();
      }
    }

    // 2. Add to new room
    targetRoom.students.push(student._id);
    targetRoom.occupiedBeds += 1;
    targetRoom.status = computeRoomStatus(targetRoom);
    await targetRoom.save();

    // 3. Update student
    student.room = targetRoom._id;
    await student.save();

    // 4. Update request
    request.status = 'Approved';
    request.adminRemarks = remarks ? remarks.trim() : 'Transfer approved by warden.';
    request.reviewedAt = new Date();
    await request.save();

    req.session.flash = {
      type: 'success',
      message: `Room change approved! ${student.name} successfully transferred to Room ${targetRoom.roomNumber}.`,
    };
    return res.redirect('/admin/room-change-requests');
  } catch (err) {
    console.error('Approve room change error:', err);
    req.session.flash = { type: 'danger', message: 'Error approving room change.' };
    return res.redirect('/admin/room-change-requests');
  }
};

exports.rejectRoomChangeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const request = await RoomChangeRequest.findById(id);
    if (!request || request.status !== 'Pending') {
      req.session.flash = { type: 'danger', message: 'Request not found or already processed.' };
      return res.redirect('/admin/room-change-requests');
    }

    request.status = 'Rejected';
    request.adminRemarks = remarks ? remarks.trim() : 'Transfer request declined by warden.';
    request.reviewedAt = new Date();
    await request.save();

    req.session.flash = { type: 'success', message: 'Room change request rejected.' };
    return res.redirect('/admin/room-change-requests');
  } catch (err) {
    console.error('Reject room change error:', err);
    req.session.flash = { type: 'danger', message: 'Error rejecting room change.' };
    return res.redirect('/admin/room-change-requests');
  }
};
