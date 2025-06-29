import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all donations (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, campaign, search } = req.query;
    
    const where = {};
    if (status) where.status = status.toUpperCase();
    if (campaign) where.campaign = campaign;
    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { campaign: { contains: search, mode: 'insensitive' } }
      ];
    }

    const donations = await prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Create donation
router.post('/', [
  body('donorName').notEmpty().withMessage('Donor name is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('campaign').notEmpty().withMessage('Campaign is required'),
  body('method').isIn(['CARD', 'UPI', 'QR', 'BANK']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    const donationData = {
      ...req.body,
      method: req.body.method.toUpperCase(),
      transactionId,
      status: 'COMPLETED' // In real app, this would be 'PENDING' until payment confirmation
    };

    const donation = await prisma.donation.create({
      data: donationData
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Get donation statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalStats, campaignStats, monthlyStats] = await Promise.all([
      // Total donations
      prisma.donation.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true
      }),

      // Campaign-wise stats
      prisma.donation.groupBy({
        by: ['campaign'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } }
      }),

      // Monthly stats (last 12 months)
      prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM "createdAt") as year,
          EXTRACT(MONTH FROM "createdAt") as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM donations 
        WHERE status = 'COMPLETED' 
          AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
        ORDER BY year DESC, month DESC
        LIMIT 12
      `
    ]);

    res.json({
      total: {
        total: totalStats._sum.amount || 0,
        count: totalStats._count || 0
      },
      campaigns: campaignStats.map(stat => ({
        campaign: stat.campaign,
        total: stat._sum.amount,
        count: stat._count
      })),
      monthly: monthlyStats.map(stat => ({
        year: Number(stat.year),
        month: Number(stat.month),
        total: Number(stat.total),
        count: Number(stat.count)
      }))
    });
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

// Update donation status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const donation = await prisma.donation.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(donation);
  } catch (error) {
    console.error('Error updating donation:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Donation not found' });
    }
    res.status(500).json({ error: 'Failed to update donation' });
  }
});

export default router;