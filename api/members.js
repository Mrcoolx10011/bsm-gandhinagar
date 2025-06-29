import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';

const app = express();
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all members
app.get('/', async (req, res) => {
  try {
    const { state, city, status, search } = req.query;
    
    let whereConditions = {};
    
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }
    
    const members = await prisma.member.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' }
    });
    
    // Filter by search if provided
    let filteredMembers = members;
    if (search) {
      filteredMembers = members.filter(member => 
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json(filteredMembers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get member by ID
app.get('/:id', async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new member (Admin only)
app.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('membership_type').notEmpty().withMessage('Membership type is required')
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member (Admin only)
app.put('/:id', auth, async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(member);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member (Admin only)
app.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.member.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get members grouped by location
app.get('/location/tree', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' }
    });

    // Group by state and city
    const locationTree = {};
    
    members.forEach(member => {
      const state = member.state || 'Unknown';
      const city = member.city || 'Unknown';
      
      if (!locationTree[state]) {
        locationTree[state] = {};
      }
      
      if (!locationTree[state][city]) {
        locationTree[state][city] = [];
      }
      
      locationTree[state][city].push(member);
    });

    res.json(locationTree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;
