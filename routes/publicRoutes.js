const express = require('express');
const router = express.Router();
const HostelBlock = require('../models/HostelBlock');
const Room = require('../models/Room');

const mongoose = require('mongoose');

// Landing page
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.render('public/index', {
        pageTitle: 'CampusNest - Modern Hostel & Mess Management',
        stats: { totalBlocks: 3, totalRooms: 24, totalBeds: 60, availableBeds: 25 },
        blocks: [],
      });
    }

    const blocks = await HostelBlock.find().sort({ name: 1 });
    const rooms = await Room.find();
    const totalBeds = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + r.occupiedBeds, 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);

    res.render('public/index', {
      pageTitle: 'CampusNest - Modern Hostel & Mess Management',
      stats: {
        totalBlocks: blocks.length,
        totalRooms: rooms.length,
        totalBeds,
        availableBeds,
      },
      blocks,
    });
  } catch (err) {
    console.error('Landing page error:', err.message);
    res.render('public/index', {
      pageTitle: 'CampusNest - Modern Hostel & Mess Management',
      stats: { totalBlocks: 3, totalRooms: 24, totalBeds: 60, availableBeds: 25 },
      blocks: [],
    });
  }
});

// About / Guidelines page
router.get('/about', (req, res) => {
  res.render('public/about', {
    pageTitle: 'Hostel Guidelines & Information',
  });
});

module.exports = router;
