const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');
const MealAttendance = require('../models/MealAttendance');
const User = require('../models/User');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_NAMES = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getCurrentDayKey() {
  const jsDay = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[jsDay];
}

/**
 * Student View Mess Menu
 */
exports.getStudentMess = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('student/mess', {
        pageTitle: 'Weekly Mess Menu',
        menu: demoData.messMenu,
        currentDay: getCurrentDayKey(),
        days: DAYS,
        dayNames: DAY_NAMES,
      });
    }

    let menu = await MessMenu.findOne({ isActive: true });
    if (!menu) {
      menu = await MessMenu.findOne().sort({ createdAt: -1 });
    }

    const currentDay = getCurrentDayKey();

    res.render('student/mess', {
      pageTitle: 'Weekly Mess Menu',
      menu,
      currentDay,
      days: DAYS,
      dayNames: DAY_NAMES,
    });
  } catch (err) {
    console.error('Student mess view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Student Meal Feedback Page
 */
exports.getStudentFeedback = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('student/feedback', {
        pageTitle: 'Meal Feedback',
        today: getTodayString(),
        feedbacks: demoData.mealFeedback,
      });
    }

    const today = getTodayString();
    const feedbacks = await MealFeedback.find({ student: req.session.userId })
      .sort({ createdAt: -1 });

    res.render('student/feedback', {
      pageTitle: 'Meal Feedback',
      today,
      feedbacks,
    });
  } catch (err) {
    console.error('Student feedback view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Student Submit Meal Feedback
 */
exports.postStudentFeedback = async (req, res) => {
  try {
    const { date, mealType, rating, comment } = req.body;

    if (!date || !mealType || !rating) {
      req.session.flash = {
        type: 'danger',
        message: 'Date, Meal Type, and Rating (1-5) are required.',
      };
      return res.redirect('/student/feedback');
    }

    // Check duplicate feedback
    const existing = await MealFeedback.findOne({
      student: req.session.userId,
      date,
      mealType,
    });

    if (existing) {
      req.session.flash = {
        type: 'warning',
        message: `You have already submitted feedback for ${mealType} on ${date}.`,
      };
      return res.redirect('/student/feedback');
    }

    await MealFeedback.create({
      student: req.session.userId,
      date,
      mealType,
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
    });

    req.session.flash = {
      type: 'success',
      message: 'Thank you! Your meal feedback has been recorded.',
    };
    return res.redirect('/student/feedback');
  } catch (err) {
    if (err.code === 11000) {
      req.session.flash = {
        type: 'warning',
        message: 'Feedback for this meal and date already exists.',
      };
      return res.redirect('/student/feedback');
    }
    console.error('Submit feedback error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Failed to submit feedback.',
    };
    return res.redirect('/student/feedback');
  }
};

// ==========================================
// ADMIN MESS MANAGEMENT
// ==========================================

/**
 * Admin Mess Menu Editor
 */
exports.getAdminMessMenu = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('admin/mess-menu', {
        pageTitle: 'Manage Weekly Mess Menu',
        menu: demoData.messMenu,
        days: DAYS,
        dayNames: DAY_NAMES,
      });
    }

    let menu = await MessMenu.findOne({ isActive: true });
    if (!menu) {
      menu = await MessMenu.create({
        title: 'Weekly Hostel Mess Timetable',
        isActive: true,
        createdBy: req.session.userId,
      });
    }

    res.render('admin/mess-menu', {
      pageTitle: 'Manage Weekly Mess Menu',
      menu,
      days: DAYS,
      dayNames: DAY_NAMES,
    });
  } catch (err) {
    console.error('Admin mess menu view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin Update Mess Menu
 */
exports.postAdminMessMenu = async (req, res) => {
  try {
    const { title } = req.body;
    let menu = await MessMenu.findOne({ isActive: true });
    if (!menu) {
      menu = new MessMenu({ isActive: true, createdBy: req.session.userId });
    }

    if (title) menu.title = title.trim();

    DAYS.forEach((day) => {
      menu[day] = {
        breakfast: req.body[`${day}_breakfast`] || 'Not specified',
        lunch: req.body[`${day}_lunch`] || 'Not specified',
        snacks: req.body[`${day}_snacks`] || 'Not specified',
        dinner: req.body[`${day}_dinner`] || 'Not specified',
      };
    });

    await menu.save();

    req.session.flash = {
      type: 'success',
      message: 'Weekly Mess Menu updated successfully!',
    };
    return res.redirect('/admin/mess-menu');
  } catch (err) {
    console.error('Update mess menu error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Error updating mess menu.',
    };
    return res.redirect('/admin/mess-menu');
  }
};

/**
 * Admin View Meal Feedback & Analytics
 */
exports.getAdminFeedback = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoData = require('../services/demoData');
      return res.render('admin/feedback', {
        pageTitle: 'Student Meal Feedback & Ratings',
        feedbacks: demoData.mealFeedback,
        mealStats: {
          Breakfast: { avg: '4.2', count: 1 },
          Lunch: { avg: '4.0', count: 1 },
          Snacks: { avg: '4.5', count: 1 },
          Dinner: { avg: '4.8', count: 1 },
        },
        overallAvg: '4.3',
        totalCount: demoData.mealFeedback.length,
        filters: { mealType: 'all', rating: 'all' },
      });
    }

    const { mealType, rating } = req.query;
    const filter = {};

    if (mealType) filter.mealType = mealType;
    if (rating) filter.rating = Number(rating);

    const feedbacks = await MealFeedback.find(filter)
      .populate('student', 'name studentId email')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const statsAgg = await MealFeedback.aggregate([
      {
        $group: {
          _id: '$mealType',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const mealStats = {
      Breakfast: { avg: '0.0', count: 0 },
      Lunch: { avg: '0.0', count: 0 },
      Snacks: { avg: '0.0', count: 0 },
      Dinner: { avg: '0.0', count: 0 },
    };

    let totalRatingSum = 0;
    let totalCount = 0;

    statsAgg.forEach((s) => {
      if (mealStats[s._id]) {
        mealStats[s._id].avg = s.avgRating.toFixed(1);
        mealStats[s._id].count = s.count;
        totalRatingSum += s.avgRating * s.count;
        totalCount += s.count;
      }
    });

    const overallAvg = totalCount > 0 ? (totalRatingSum / totalCount).toFixed(1) : '0.0';

    res.render('admin/feedback', {
      pageTitle: 'Student Meal Feedback & Ratings',
      feedbacks,
      mealStats,
      overallAvg,
      totalCount,
      filters: { mealType: mealType || 'all', rating: rating || 'all' },
    });
  } catch (err) {
    console.error('Admin feedback view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin Manage Meal Attendance
 */
exports.getAdminMealAttendance = async (req, res) => {
  try {
    const date = req.query.date || getTodayString();
    const students = await User.find({ role: 'student' }).populate('room').sort({ name: 1 });

    const attendanceRecords = await MealAttendance.find({ date });
    const recordMap = {};
    attendanceRecords.forEach((r) => {
      recordMap[r.student.toString()] = r;
    });

    res.render('admin/meal-attendance', {
      pageTitle: 'Student Meal Attendance',
      date,
      students,
      recordMap,
    });
  } catch (err) {
    console.error('Meal attendance view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin Save Meal Attendance
 */
exports.postAdminMealAttendance = async (req, res) => {
  try {
    const { date, attendance } = req.body;
    // attendance is an object keyed by studentId: { [studentId]: { breakfast: 'on', lunch: 'on', ... } }
    const targetDate = date || getTodayString();

    const students = await User.find({ role: 'student' });

    for (const student of students) {
      const sId = student._id.toString();
      const studentData = (attendance && attendance[sId]) || {};

      await MealAttendance.findOneAndUpdate(
        { student: student._id, date: targetDate },
        {
          student: student._id,
          date: targetDate,
          breakfast: Boolean(studentData.breakfast),
          lunch: Boolean(studentData.lunch),
          snacks: Boolean(studentData.snacks),
          dinner: Boolean(studentData.dinner),
        },
        { upsert: true, new: true }
      );
    }

    req.session.flash = {
      type: 'success',
      message: `Meal attendance recorded for ${targetDate}.`,
    };
    return res.redirect(`/admin/meal-attendance?date=${targetDate}`);
  } catch (err) {
    console.error('Save meal attendance error:', err);
    req.session.flash = {
      type: 'danger',
      message: 'Failed to record meal attendance.',
    };
    return res.redirect('/admin/meal-attendance');
  }
};
