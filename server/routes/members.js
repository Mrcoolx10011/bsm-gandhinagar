import express from 'express';
import { body, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../../lib/mongodb.js';

const router = express.Router();

// Public endpoint - Get active members (for frontend display)
router.get('/public', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    
    // Only fetch active members for public display
    const members = await membersCollection
      .find({ status: 'active' })
      .sort({ createdAt: -1 })
      .toArray();
    
    const publicMembers = members.map(member => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.membershipType || 'Member',
      location: member.address || 'India',
      bio: `${member.membershipType || 'Member'} since ${new Date(member.joinDate || member.createdAt).getFullYear()}`,
      image: member.image || '',
      dateJoined: member.joinDate || member.createdAt,
      status: member.status
    }));
    
    res.json(publicMembers);
  } catch (error) {
    console.error('Error fetching public members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all members
router.get('/', auth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');
    
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const members = await membersCollection.find(filter).toArray();
    
    const formattedMembers = members.map(member => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      membershipType: member.membershipType,
      status: member.status,
      joinDate: member.joinDate,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    }));
    
    res.json(formattedMembers);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create member (admin only)
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('membershipType').isIn(['regular', 'premium', 'lifetime']).withMessage('Valid membership type is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, address, membershipType } = req.body;

    const db = await connectToDatabase();
    const membersCollection = db.collection('members');

    // Check if member with email already exists
    const existingMember = await membersCollection.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: 'Member with this email already exists' });
    }

    const memberData = {
      name,
      email,
      phone,
      address,
      membershipType,
      status: 'active',
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await membersCollection.insertOne(memberData);
    
    const newMember = {
      id: result.insertedId.toString(),
      ...memberData
    };

    res.status(201).json(newMember);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member (admin only)
router.put('/:id', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('membershipType').isIn(['regular', 'premium', 'lifetime']).withMessage('Valid membership type is required'),
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Valid status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, phone, address, membershipType, status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const db = await connectToDatabase();
    const membersCollection = db.collection('members');

    const updateData = {
      name,
      email,
      phone,
      address,
      membershipType,
      status,
      updatedAt: new Date().toISOString()
    };

    const result = await membersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const updatedMember = await membersCollection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      id: updatedMember._id.toString(),
      name: updatedMember.name,
      email: updatedMember.email,
      phone: updatedMember.phone,
      address: updatedMember.address,
      membershipType: updatedMember.membershipType,
      status: updatedMember.status,
      joinDate: updatedMember.joinDate,
      createdAt: updatedMember.createdAt,
      updatedAt: updatedMember.updatedAt
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete member (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    const db = await connectToDatabase();
    const membersCollection = db.collection('members');

    const result = await membersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
