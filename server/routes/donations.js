const express = require('express');
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all donations (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, campaign } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (campaign) filter.campaign = campaign;

    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation
router.post('/', [
  body('donorName').notEmpty().withMessage('Donor name is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('campaign').notEmpty().withMessage('Campaign is required'),
  body('paymentMethod').isIn(['card', 'upi', 'qr', 'bank']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    const donation = new Donation({
      ...req.body,
      transactionId,
      status: 'completed' // In real app, this would be 'pending' until payment confirmation
    });

    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const totalDonations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const campaignStats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$campaign', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);

    const monthlyStats = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      total: totalDonations[0] || { total: 0, count: 0 },
      campaigns: campaignStats,
      monthly: monthlyStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;