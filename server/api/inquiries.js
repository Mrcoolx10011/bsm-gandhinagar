import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../../lib/prisma.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all inquiries (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    
    const where = {};
    if (status) where.status = status.toUpperCase();
    if (priority) where.priority = priority.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    const inquiries = await prisma.inquiry.findMany({
      where,
      include: {
        respondedBy: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Create inquiry
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inquiry = await prisma.inquiry.create({
      data: req.body
    });

    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// Update inquiry (admin only)
router.put('/:id', auth, [
  body('status').optional().isIn(['NEW', 'REPLIED', 'ARCHIVED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('response').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = { ...req.body };

    // Convert to uppercase for enums
    if (updateData.status) updateData.status = updateData.status.toUpperCase();
    if (updateData.priority) updateData.priority = updateData.priority.toUpperCase();

    // If responding, set response metadata
    if (req.body.response && req.body.status === 'REPLIED') {
      updateData.respondedAt = new Date();
      updateData.respondedById = req.user.userId;
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        respondedBy: {
          select: { username: true }
        }
      }
    });

    res.json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Delete inquiry (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.inquiry.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

export default router;