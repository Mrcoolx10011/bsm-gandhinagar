const express = require('express');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
  try {
    const { country, state, city, status } = req.query;
    const filter = {};

    if (country) filter['location.country'] = country;
    if (state) filter['location.state'] = state;
    if (city) filter['location.city'] = city;
    if (status) filter.status = status;

    const members = await Member.find(filter).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create member (admin only)
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.city').notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;