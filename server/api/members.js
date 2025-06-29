import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all members
router.get('/', async (req, res) => {
  try {
    const { status, state, city, search } = req.query;
    
    const where = {};
    if (status) where.status = status.toUpperCase();
    if (state) where.state = state;
    if (city) where.city = city;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: req.params.id }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create member (admin only)
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').notEmpty().withMessage('Role is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('city').notEmpty().withMessage('City is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await prisma.member.create({
      data: req.body
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.member.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Get members grouped by location
router.get('/location/tree', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [
        { state: 'asc' },
        { city: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group members by state and city
    const locationTree = {};
    
    members.forEach(member => {
      if (!locationTree[member.state]) {
        locationTree[member.state] = {};
      }
      if (!locationTree[member.state][member.city]) {
        locationTree[member.state][member.city] = [];
      }
      locationTree[member.state][member.city].push(member);
    });

    res.json(locationTree);
  } catch (error) {
    console.error('Error fetching location tree:', error);
    res.status(500).json({ error: 'Failed to fetch location tree' });
  }
});

export default router;