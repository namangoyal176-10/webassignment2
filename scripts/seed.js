require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');
const MealAttendance = require('../models/MealAttendance');
const MessBill = require('../models/MessBill');

async function seedDatabase() {
  console.log('🌱 Starting Hostel & Mess Management Database Seeding...');
  await connectDB();

  // Clean collections
  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    HostelBlock.deleteMany({}),
    Room.deleteMany({}),
    RoomRequest.deleteMany({}),
    RoomChangeRequest.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    MessMenu.deleteMany({}),
    MealFeedback.deleteMany({}),
    MealAttendance.deleteMany({}),
    MessBill.deleteMany({}),
  ]);

  // 1. Create Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hostel.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const adminName = process.env.ADMIN_NAME || 'Chief Warden Dr. Rajesh Verma';
  const adminPhone = process.env.ADMIN_PHONE || '9876543210';

  const adminUser = await User.create({
    name: adminName,
    email: adminEmail.toLowerCase().trim(),
    studentId: 'ADMIN-001',
    phone: adminPhone,
    password: adminPassword, // Will be hashed by pre-save hook
    role: 'admin',
  });
  console.log(`✅ Admin created: ${adminEmail} (Password: ${adminPassword})`);

  // 2. Create 3 Hostel Blocks
  const blockA = await HostelBlock.create({
    name: 'Aryabhata Hall of Residence',
    blockNumber: 'A',
    gender: 'Boys',
    totalRooms: 10,
    description: 'Premier residential block for undergraduate engineers featuring high-speed optical WiFi and study rooms.',
  });

  const blockB = await HostelBlock.create({
    name: 'Bhaskara Hall of Residence',
    blockNumber: 'B',
    gender: 'Boys',
    totalRooms: 8,
    description: 'Spacious block equipped with recreational table tennis room, gym corner, and open courtyard.',
  });

  const blockC = await HostelBlock.create({
    name: 'Gargi Hall of Residence',
    blockNumber: 'C',
    gender: 'Girls',
    totalRooms: 10,
    description: 'Modern women resident facility with biometric security, solar heating, and indoor reading lounges.',
  });

  console.log('✅ Created 3 Hostel Blocks (Block A, Block B, Block C)');

  // 3. Create 24+ Rooms across blocks
  const roomDefinitions = [
    // Block A Rooms (Single, Double, Triple, Four Sharing)
    { roomNumber: 'A-101', block: blockA._id, roomType: 'Single', capacity: 1 },
    { roomNumber: 'A-102', block: blockA._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'A-103', block: blockA._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'A-104', block: blockA._id, roomType: 'Triple', capacity: 3 },
    { roomNumber: 'A-105', block: blockA._id, roomType: 'Four Sharing', capacity: 4 },
    { roomNumber: 'A-201', block: blockA._id, roomType: 'Single', capacity: 1 },
    { roomNumber: 'A-202', block: blockA._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'A-203', block: blockA._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'A-204', block: blockA._id, roomType: 'Four Sharing', capacity: 4 },
    { roomNumber: 'A-205', block: blockA._id, roomType: 'Double', capacity: 2, status: 'Maintenance' },

    // Block B Rooms
    { roomNumber: 'B-101', block: blockB._id, roomType: 'Single', capacity: 1 },
    { roomNumber: 'B-102', block: blockB._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'B-103', block: blockB._id, roomType: 'Triple', capacity: 3 },
    { roomNumber: 'B-104', block: blockB._id, roomType: 'Four Sharing', capacity: 4 },
    { roomNumber: 'B-201', block: blockB._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'B-202', block: blockB._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'B-203', block: blockB._id, roomType: 'Triple', capacity: 3 },
    { roomNumber: 'B-204', block: blockB._id, roomType: 'Four Sharing', capacity: 4 },

    // Block C Rooms (Girls)
    { roomNumber: 'C-101', block: blockC._id, roomType: 'Single', capacity: 1 },
    { roomNumber: 'C-102', block: blockC._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'C-103', block: blockC._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'C-104', block: blockC._id, roomType: 'Triple', capacity: 3 },
    { roomNumber: 'C-105', block: blockC._id, roomType: 'Four Sharing', capacity: 4 },
    { roomNumber: 'C-201', block: blockC._id, roomType: 'Single', capacity: 1 },
    { roomNumber: 'C-202', block: blockC._id, roomType: 'Double', capacity: 2 },
    { roomNumber: 'C-203', block: blockC._id, roomType: 'Four Sharing', capacity: 4 },
  ];

  const createdRooms = await Room.insertMany(
    roomDefinitions.map((r) => ({
      ...r,
      occupiedBeds: 0,
      status: r.status || 'Available',
      students: [],
    }))
  );
  console.log(`✅ Created ${createdRooms.length} Rooms with capacities`);

  // Map rooms by roomNumber for easy reference
  const roomMap = {};
  createdRooms.forEach((r) => {
    roomMap[r.roomNumber] = r;
  });

  // 4. Create 12 Students
  const studentData = [
    { name: 'Aarav Sharma', email: 'aarav.sharma@hostel.edu', studentId: 'STU-2026-001', phone: '9871100001' },
    { name: 'Rohan Gupta', email: 'rohan.gupta@hostel.edu', studentId: 'STU-2026-002', phone: '9871100002' },
    { name: 'Aditya Singh', email: 'aditya.singh@hostel.edu', studentId: 'STU-2026-003', phone: '9871100003' },
    { name: 'Kunal Patel', email: 'kunal.patel@hostel.edu', studentId: 'STU-2026-004', phone: '9871100004' },
    { name: 'Devansh Verma', email: 'devansh.verma@hostel.edu', studentId: 'STU-2026-005', phone: '9871100005' },
    { name: 'Ananya Roy', email: 'ananya.roy@hostel.edu', studentId: 'STU-2026-006', phone: '9871100006' },
    { name: 'Priya Iyer', email: 'priya.iyer@hostel.edu', studentId: 'STU-2026-007', phone: '9871100007' },
    { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@hostel.edu', studentId: 'STU-2026-008', phone: '9871100008' },
    { name: 'Ishita Sen', email: 'ishita.sen@hostel.edu', studentId: 'STU-2026-009', phone: '9871100009' },
    { name: 'Tanmay Joshi', email: 'tanmay.joshi@hostel.edu', studentId: 'STU-2026-010', phone: '9871100010' },
    { name: 'Vikram Malhotra', email: 'vikram.m@hostel.edu', studentId: 'STU-2026-011', phone: '9871100011' },
    { name: 'Meera Nambiar', email: 'meera.n@hostel.edu', studentId: 'STU-2026-012', phone: '9871100012' },
  ];

  const students = [];
  for (const s of studentData) {
    const createdStudent = await User.create({
      ...s,
      password: 'student123',
      role: 'student',
    });
    students.push(createdStudent);
  }
  console.log(`✅ Created ${students.length} Student Accounts (Password: student123)`);

  // Helper function to safely allot student to room
  async function allotStudent(student, targetRoom) {
    targetRoom.students.push(student._id);
    targetRoom.occupiedBeds += 1;
    if (targetRoom.occupiedBeds >= targetRoom.capacity) {
      targetRoom.status = 'Full';
    } else {
      targetRoom.status = 'Partially Occupied';
    }
    await targetRoom.save();

    student.room = targetRoom._id;
    await student.save();
  }

  // 5. Allot some students to rooms
  // Aarav & Rohan into Room A-102 (Full Double room)
  await allotStudent(students[0], roomMap['A-102']);
  await allotStudent(students[1], roomMap['A-102']);

  // Aditya into Room A-101 (Full Single room)
  await allotStudent(students[2], roomMap['A-101']);

  // Kunal into Room A-105 (Four sharing room with 1 bed occupied)
  await allotStudent(students[3], roomMap['A-105']);

  // Ananya & Priya into Room C-102 (Full Double room)
  await allotStudent(students[5], roomMap['C-102']);
  await allotStudent(students[6], roomMap['C-102']);

  // Sneha into Room C-104 (Triple room, 1/3 occupied)
  await allotStudent(students[7], roomMap['C-104']);

  // Devansh, Ishita, Tanmay, Vikram, Meera remain unallotted or pending!
  console.log('✅ Pre-allotted 6 students into rooms with accurate capacities and statuses');

  // 6. Create Room Requests
  // Devansh requests Room in Block A
  await RoomRequest.create({
    student: students[4]._id, // Devansh
    preferredBlock: blockA._id,
    preferredRoomType: 'Double',
    reason: 'Department of Computer Science proximity required for lab projects.',
    status: 'Pending',
  });

  // Ishita requests Room in Block C
  await RoomRequest.create({
    student: students[8]._id, // Ishita
    preferredBlock: blockC._id,
    preferredRoomType: 'Single',
    reason: 'Need quiet room for competitive exam preparation.',
    status: 'Pending',
  });

  // Tanmay had an approved request
  await RoomRequest.create({
    student: students[0]._id, // Aarav
    preferredBlock: blockA._id,
    preferredRoomType: 'Double',
    reason: 'Allotment request for standard semester housing.',
    status: 'Approved',
    adminRemarks: 'Allotted to Room A-102',
    reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  console.log('✅ Created sample room requests');

  // 7. Create Room Change Request
  // Kunal (currently in A-105) requests transfer to B-102
  await RoomChangeRequest.create({
    student: students[3]._id, // Kunal
    currentRoom: roomMap['A-105']._id,
    requestedRoom: roomMap['B-102']._id,
    reason: 'Joining project group with students residing on Block B first floor.',
    status: 'Pending',
  });
  console.log('✅ Created sample room change request');

  // 8. Create Maintenance Requests
  await MaintenanceRequest.create({
    student: students[0]._id, // Aarav in A-102
    room: roomMap['A-102']._id,
    category: 'Electrical',
    description: 'Ceiling fan regulator is stuck at speed 2 and vibrating noisily.',
    priority: 'Medium',
    status: 'In Progress',
    adminRemarks: 'Electrician assigned work order #104.',
  });

  await MaintenanceRequest.create({
    student: students[5]._id, // Ananya in C-102
    room: roomMap['C-102']._id,
    category: 'Plumbing',
    description: 'Bathroom washbasin faucet is leaking water continuously.',
    priority: 'High',
    status: 'Pending',
  });

  await MaintenanceRequest.create({
    student: students[2]._id, // Aditya in A-101
    room: roomMap['A-101']._id,
    category: 'Internet',
    description: 'LAN port wall socket pins are bent, Wi-Fi signal weak.',
    priority: 'Medium',
    status: 'Resolved',
    adminRemarks: 'Replaced RJ-45 jack and verified throughput.',
    resolvedAt: new Date(),
  });
  console.log('✅ Created sample maintenance tickets');

  // 9. Create 7-Day Weekly Mess Timetable
  await MessMenu.create({
    title: 'Autumn 2026 Dining Schedule',
    weekStartDate: new Date(),
    isActive: true,
    createdBy: adminUser._id,
    monday: {
      breakfast: 'Masala Dosa, Sambar, Coconut Chutney, Banana & Tea/Coffee',
      lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka, Boondi Raita',
      snacks: 'Veg Cutlet, Green Chutney, Ginger Tea / Milk',
      dinner: 'Aloo Gobi Adraki, Mixed Veg Kadai, Steamed Basmati Rice, Chapati, Kheer',
    },
    tuesday: {
      breakfast: 'Aloo Paratha with Curd, Mint Pickle, Fresh Fruit, Tea/Coffee',
      lunch: 'Rajma Masala, Kadhi Pakora, Steamed Rice, Tandoori Roti, Salad',
      snacks: 'Samosa, Tamarind Chutney, Masala Chai',
      dinner: 'Palak Corn Subzi, Dal Makhani, Pulao, Chapati, Gulab Jamun',
    },
    wednesday: {
      breakfast: 'Idli, Medu Vada, Coconut Chutney, Tomato Chutney, Coffee',
      lunch: 'Chole Masala, Amritsari Bhature, Veg Pulao, Cucumber Raita, Papad',
      snacks: 'Poha with Sev & Roasted Peanuts, Lemon Tea',
      dinner: 'Bhindi Do Pyaza, Dal Fry, Jeera Rice, Roti, Seasonal Fruit',
    },
    thursday: {
      breakfast: 'Upma with Coconut Chutney, Boiled Eggs / Sprouted Moong, Milk',
      lunch: 'Veg Kolhapuri, Dal Tadka, Steamed Rice, Chapati, Fresh Onion Salad',
      snacks: 'Bread Pakora, Tomato Ketchup, Cardamom Tea',
      dinner: 'Mutter Mushroom, Yellow Moong Dal, Ghee Rice, Phulka, Custard',
    },
    friday: {
      breakfast: 'Puri Bhaji with Pickle, Sweet Lassi / Warm Milk',
      lunch: 'Dum Aloo Kashmiri, Panchmel Dal, Peas Pulao, Roti, Green Salad',
      snacks: 'Pav Bhaji, Chopped Onions & Lemon, Masala Chai',
      dinner: 'Paneer Tikka Masala, Dal Tadka, Biryani Rice, Garlic Naan, Rasgulla',
    },
    saturday: {
      breakfast: 'Uttapam with Onion & Tomato, Sambar, Filter Coffee',
      lunch: 'Kashmiri Pulao, Chana Dal, Baingan Bharta, Chapati, Curd',
      snacks: 'Bhel Puri, Tangy Chutney, Cold Coffee',
      dinner: 'Veg Jalfrezi, Dal Palak, Steamed Rice, Roti, Ice Cream',
    },
    sunday: {
      breakfast: 'Chole Kulche with Pickle, Halwa, Special Masala Tea',
      lunch: 'Hyderabadi Veg Dum Biryani, Mirchi Ka Salan, Veg Raita, Gulab Jamun',
      snacks: 'Veg Spring Rolls, Sweet Corn, Tea / Coffee',
      dinner: 'Shahi Paneer, Dal Makhani, Jeera Rice, Butter Roti, Moong Dal Halwa',
    },
  });
  console.log('✅ Created 7-Day Weekly Mess Timetable with realistic menus');

  // 10. Create Sample Meal Feedbacks
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  await MealFeedback.create({
    student: students[0]._id, // Aarav
    date: todayStr,
    mealType: 'Breakfast',
    rating: 5,
    comment: 'The dosas were crispy and the sambar was rich in flavor. Very good!',
  });

  await MealFeedback.create({
    student: students[1]._id, // Rohan
    date: todayStr,
    mealType: 'Lunch',
    rating: 4,
    comment: 'Paneer was fresh and hot rotis were served continuously.',
  });

  await MealFeedback.create({
    student: students[2]._id, // Aditya
    date: yesterdayStr,
    mealType: 'Dinner',
    rating: 4,
    comment: 'Gulab jamun was warm and delicious.',
  });

  await MealFeedback.create({
    student: students[5]._id, // Ananya
    date: yesterdayStr,
    mealType: 'Lunch',
    rating: 5,
    comment: 'Kadhi pakora tasted authentic like home cooked food.',
  });

  console.log('✅ Created sample meal feedbacks');

  // 11. Create Meal Attendance records
  await MealAttendance.create({
    student: students[0]._id,
    date: todayStr,
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: false,
  });

  await MealAttendance.create({
    student: students[1]._id,
    date: todayStr,
    breakfast: true,
    lunch: true,
    snacks: false,
    dinner: true,
  });

  console.log('✅ Created sample meal attendance records');

  // 12. Create Sample Mess Bills
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  await MessBill.create({
    student: students[0]._id, // Aarav
    month: currentMonth,
    year: currentYear,
    daysPresent: 26,
    perDayRate: 120,
    totalAmount: 26 * 120,
    status: 'Paid',
    paidAt: new Date(),
  });

  await MessBill.create({
    student: students[1]._id, // Rohan
    month: currentMonth,
    year: currentYear,
    daysPresent: 24,
    perDayRate: 120,
    totalAmount: 24 * 120,
    status: 'Unpaid',
  });

  await MessBill.create({
    student: students[2]._id, // Aditya
    month: currentMonth,
    year: currentYear,
    daysPresent: 28,
    perDayRate: 120,
    totalAmount: 28 * 120,
    status: 'Unpaid',
  });

  console.log('✅ Created sample mess bills');

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('------------------------------------------------------');
  console.log(`🔐 Admin Login:    ${adminEmail}`);
  console.log(`🔑 Admin Password: ${adminPassword}`);
  console.log(`👨‍🎓 Student Login:  aarav.sharma@hostel.edu`);
  console.log(`🔑 Student Pass:   student123`);
  console.log('======================================================\n');

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
