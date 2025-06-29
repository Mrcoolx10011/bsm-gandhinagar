import express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../lib/mongodb.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
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

// Get recent completed donations (Public - for frontend recent donors)
router.get('/recent', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    // Fetch only completed donations for public display
    const donations = await donationsCollection
      .find({ status: 'completed' })
      .sort({ date: -1 })
      .limit(10)
      .toArray();
    
    const formattedDonations = donations.map(donation => ({
      id: donation._id.toString(),
      donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
      amount: donation.amount,
      date: donation.date,
      isAnonymous: donation.isAnonymous || false
    }));
    
    res.json(formattedDonations);
  } catch (error) {
    console.error('Error fetching recent donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all donations (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    const { status, campaign } = req.query;
    const filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (campaign && campaign !== 'all') filter.campaign = campaign;
    
    const donations = await donationsCollection.find(filter).sort({ date: -1 }).toArray();
    
    const formattedDonations = donations.map(donation => ({
      id: donation._id.toString(),
      donorName: donation.donorName,
      email: donation.email,
      phone: donation.phone || '',
      amount: donation.amount,
      campaign: donation.campaign,
      paymentMethod: donation.paymentMethod,
      transactionId: donation.transactionId,
      status: donation.status,
      isAnonymous: donation.isAnonymous || false,
      message: donation.message || '',
      date: donation.date,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt
    }));
    
    res.json(formattedDonations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new donation (Public)
router.post('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    const { donorName, email, phone, amount, campaign, paymentMethod, isAnonymous, message } = req.body;

    if (!donorName || !email || !amount || !campaign || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const donation = {
      donorName,
      email,
      phone: phone || '',
      amount: parseFloat(amount),
      campaign,
      paymentMethod,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      isAnonymous: isAnonymous || false,
      message: message || '',
      date: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await donationsCollection.insertOne(donation);
    const newDonation = await donationsCollection.findOne({ _id: result.insertedId });

    res.status(201).json({
      id: newDonation._id.toString(),
      donorName: newDonation.donorName,
      email: newDonation.email,
      phone: newDonation.phone,
      amount: newDonation.amount,
      campaign: newDonation.campaign,
      paymentMethod: newDonation.paymentMethod,
      transactionId: newDonation.transactionId,
      status: newDonation.status,
      isAnonymous: newDonation.isAnonymous,
      message: newDonation.message,
      date: newDonation.date,
      createdAt: newDonation.createdAt,
      updatedAt: newDonation.updatedAt
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation (Admin only)
router.put('/', auth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    const { id } = req.query;
    const { status, ...updateData } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };

    if (status) updateFields.status = status;

    const result = await donationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updatedDonation = await donationsCollection.findOne({ _id: new ObjectId(id) });

    res.json({
      id: updatedDonation._id.toString(),
      donorName: updatedDonation.donorName,
      email: updatedDonation.email,
      phone: updatedDonation.phone,
      amount: updatedDonation.amount,
      campaign: updatedDonation.campaign,
      paymentMethod: updatedDonation.paymentMethod,
      transactionId: updatedDonation.transactionId,
      status: updatedDonation.status,
      isAnonymous: updatedDonation.isAnonymous,
      message: updatedDonation.message,
      date: updatedDonation.date,
      createdAt: updatedDonation.createdAt,
      updatedAt: updatedDonation.updatedAt
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation (Admin only)
router.delete('/', auth, async (req, res) => {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');
    
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: 'Donation ID is required' });
    }

    const result = await donationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
