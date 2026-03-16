const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Create user (similar to /api/auth/register, mainly for testing)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
    });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash');
    return res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

