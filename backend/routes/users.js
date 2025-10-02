const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.get('/search/:uniqueId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ uniqueId: req.params.uniqueId }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/contacts', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('contacts', '-password');
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/contacts', authenticateToken, async (req, res) => {
  try {
    const { uniqueId } = req.body;
    const contact = await User.findOne({ uniqueId });
    
    if (!contact) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = await User.findById(req.user.id);
    if (user.contacts.includes(contact._id)) {
      return res.status(400).json({ message: 'Contact already added' });
    }
    
    user.contacts.push(contact._id);
    await user.save();
    
    res.json({ message: 'Contact added successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;