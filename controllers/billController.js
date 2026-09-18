const MessBill = require('../models/MessBill');
const User = require('../models/User');
const MealAttendance = require('../models/MealAttendance');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Student View Mess Bills
 */
exports.getStudentBills = async (req, res) => {
  try {
    const bills = await MessBill.find({ student: req.session.userId }).sort({ year: -1, generatedAt: -1 });

    const totalDue = bills
      .filter((b) => b.status === 'Unpaid')
      .reduce((acc, b) => acc + b.totalAmount, 0);

    res.render('student/bills', {
      pageTitle: 'My Mess Bills',
      bills,
      totalDue,
    });
  } catch (err) {
    console.error('Student bills view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin View Mess Bills
 */
exports.getAdminBills = async (req, res) => {
  try {
    const { month, year, status } = req.query;
    const filter = {};

    if (month && month !== 'all') filter.month = month;
    if (year && year !== 'all') filter.year = Number(year);
    if (status && status !== 'all') filter.status = status;

    const bills = await MessBill.find(filter)
      .populate('student', 'name studentId email room')
      .sort({ year: -1, generatedAt: -1 });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    const totalBilled = bills.reduce((acc, b) => acc + b.totalAmount, 0);
    const totalCollected = bills
      .filter((b) => b.status === 'Paid')
      .reduce((acc, b) => acc + b.totalAmount, 0);
    const totalPending = totalBilled - totalCollected;

    res.render('admin/bills', {
      pageTitle: 'Mess Bills & Collections',
      bills,
      months: MONTHS,
      currentMonth,
      currentYear,
      totalBilled,
      totalCollected,
      totalPending,
      filters: { month: month || 'all', year: year || 'all', status: status || 'all' },
    });
  } catch (err) {
    console.error('Admin bills view error:', err);
    res.status(500).render('errors/500', { pageTitle: 'Server Error' });
  }
};

/**
 * Admin Generate Monthly Mess Bills
 */
exports.postGenerateBills = async (req, res) => {
  try {
    const { month, year, perDayRate, defaultDays } = req.body;

    if (!month || !year) {
      req.session.flash = { type: 'danger', message: 'Month and Year are required.' };
      return res.redirect('/admin/bills');
    }

    const rate = Number(perDayRate) || 120;
    const fallbackDays = Number(defaultDays) || 25;
    const targetYear = Number(year);

    // Fetch all active students
    const students = await User.find({ role: 'student' });
    let createdCount = 0;
    let updatedCount = 0;

    for (const student of students) {
      // Calculate days present from attendance if available
      const monthIndex = MONTHS.indexOf(month) + 1;
      const monthPrefix = `${targetYear}-${String(monthIndex).padStart(2, '0')}`;

      // Count distinct dates where student had at least one meal attendance checked
      const attendanceCount = await MealAttendance.countDocuments({
        student: student._id,
        date: { $regex: `^${monthPrefix}` },
        $or: [{ breakfast: true }, { lunch: true }, { snacks: true }, { dinner: true }],
      });

      const daysPresent = attendanceCount > 0 ? attendanceCount : fallbackDays;
      const totalAmount = daysPresent * rate;

      const existingBill = await MessBill.findOne({
        student: student._id,
        month,
        year: targetYear,
      });

      if (existingBill) {
        // If unpaid, update calculation
        if (existingBill.status === 'Unpaid') {
          existingBill.daysPresent = daysPresent;
          existingBill.perDayRate = rate;
          existingBill.totalAmount = totalAmount;
          await existingBill.save();
          updatedCount++;
        }
      } else {
        await MessBill.create({
          student: student._id,
          month,
          year: targetYear,
          daysPresent,
          perDayRate: rate,
          totalAmount,
          status: 'Unpaid',
        });
        createdCount++;
      }
    }

    req.session.flash = {
      type: 'success',
      message: `Bills generated for ${month} ${year}: ${createdCount} created, ${updatedCount} updated.`,
    };
    return res.redirect('/admin/bills');
  } catch (err) {
    console.error('Generate bills error:', err);
    req.session.flash = { type: 'danger', message: 'Error generating mess bills.' };
    return res.redirect('/admin/bills');
  }
};

/**
 * Toggle or Update Bill Payment Status
 */
exports.updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const bill = await MessBill.findById(id);
    if (!bill) {
      req.session.flash = { type: 'danger', message: 'Bill not found.' };
      return res.redirect('/admin/bills');
    }

    bill.status = status || (bill.status === 'Paid' ? 'Unpaid' : 'Paid');
    if (bill.status === 'Paid') {
      bill.paidAt = new Date();
    } else {
      bill.paidAt = null;
    }

    await bill.save();

    req.session.flash = {
      type: 'success',
      message: `Bill status updated to ${bill.status}.`,
    };
    return res.redirect('/admin/bills');
  } catch (err) {
    console.error('Update bill status error:', err);
    req.session.flash = { type: 'danger', message: 'Error updating bill status.' };
    return res.redirect('/admin/bills');
  }
};
