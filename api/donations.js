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

// Get all donations (Admin only)
app.get('/', auth, async (req, res) => {
  try {
    const { status, method, campaign } = req.query;
    
    let whereConditions = {};
    
    if (status && status !== 'all') {
      whereConditions.status = status.toUpperCase();
    }
    
    if (method && method !== 'all') {
      whereConditions.method = method.toUpperCase();
    }
    
    if (campaign && campaign !== 'all') {
      whereConditions.campaign = campaign;
    }
    
    const donations = await prisma.donation.findMany({
      where: whereConditions,
      orderBy: { created_at: 'desc' }
    });
    
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new donation
app.post('/', [
  body('donor_name').notEmpty().withMessage('Donor name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('method').notEmpty().withMessage('Payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donation = await prisma.donation.create({
      data: {
        ...req.body,
        transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending'
      }
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation statistics (Admin only)
app.get('/stats', auth, async (req, res) => {
  try {
    const totalDonations = await prisma.donation.aggregate({
      _sum: { amount: true }
    });
    
    const totalCount = await prisma.donation.count();
    const completedCount = await prisma.donation.count({
      where: { status: 'completed' }
    });
    
    const recentDonations = await prisma.donation.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    });

    res.json({
      totalAmount: totalDonations._sum.amount || 0,
      totalCount,
      completedCount,
      recentDonations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation status (Admin only)
app.put('/:id', auth, async (req, res) => {
  try {
    const donation = await prisma.donation.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;
