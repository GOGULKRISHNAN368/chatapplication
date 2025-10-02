
const express = require('express');
const Group = require('../models/Group');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, members } = req.body;
    const uniqueId = name.substring(0, 2).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    const group = new Group({
      name,
      uniqueId,
      admin: req.user.id,
      members: [...members, req.user.id]
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('members', 'name uniqueId');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;