const MaintenanceRequest = require('../models/MaintenanceRequest');
const User = require('../models/User');

/**
 * Student Maintenance Page
 */
exports.getStudentMaintenance = async (req, res) => {
  try {
    const student = await User.findById(req.session.userId).populate({
      path: 'room',
      populate: { path: 'block' },
    });

    const requests = await MaintenanceRequest.find({ student: student._id })
      .populate({
        path: 'room',
        populate: { path: 'block' },
      })
      .sort({ createdAt: -1 });

    res.render('student/maintenance', {
      pageTitle: 'Maintenance Requests',
      student,
      room: student.room,
      requests,
    });
  } catch (err) {
    console.error('Student maintenance view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Student Submit Maintenance Request
 */
exports.postStudentMaintenance = async (req, res) => {
  try {
    const student = await User.findById(req.session.userId);

    if (!student.room) {
      req.session.flash = {
        type: 'danger',
        message: 'You must have an allotted room to submit a maintenance request.',
      };
      return res.redirect('/student/maintenance');
    }

    const { category, description, priority } = req.body;

    if (!category || !description) {
      req.session.flash = {
        type: 'danger',
        message: 'Category and description are required.',
      };
      return res.redirect('/student/maintenance');
    }

    await MaintenanceRequest.create({
      student: student._id,
      room: student.room,
      category,
      description: description.trim(),
      priority: priority || 'Medium',
      status: 'Pending',
    });

    req.session.flash = {
      type: 'success',
      message: 'Maintenance ticket created successfully.',
    };
    return res.redirect('/student/maintenance');
  } catch (err) {
    console.error('Post maintenance error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Failed to create maintenance request.',
    };
    return res.redirect('/student/maintenance');
  }
};

/**
 * Admin Maintenance Management View
 */
exports.getAdminMaintenance = async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const requests = await MaintenanceRequest.find(filter)
      .populate('student')
      .populate({
        path: 'room',
        populate: { path: 'block' },
      })
      .sort({ createdAt: -1 });

    res.render('admin/maintenance', {
      pageTitle: 'Maintenance Request Management',
      requests,
      filters: { status: status || 'all', priority: priority || 'all', category: category || 'all' },
    });
  } catch (err) {
    console.error('Admin maintenance view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin Update Maintenance Status
 */
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      req.session.flash = { type: 'danger', message: 'Ticket not found.' };
      return res.redirect('/admin/maintenance');
    }

    request.status = status || request.status;
    if (adminRemarks !== undefined) {
      request.adminRemarks = adminRemarks.trim();
    }
    if (status === 'Resolved') {
      request.resolvedAt = new Date();
    }

    await request.save();

    req.session.flash = { type: 'success', message: 'Ticket status updated.' };
    return res.redirect('/admin/maintenance');
  } catch (err) {
    console.error('Update maintenance error:', err);
    req.session.flash = { type: 'danger', message: 'Error updating maintenance ticket.' };
    return res.redirect('/admin/maintenance');
  }
};
