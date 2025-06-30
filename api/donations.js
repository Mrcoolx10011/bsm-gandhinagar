import { connectToDatabase } from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Improved JWT verification
const verifyToken = (token) => {
  if (!token) return false;
  
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Add CORS and cache control headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');

    if (req.method === 'GET') {
      const { recent } = req.query;
      
      if (recent) {
        // Public endpoint - Get recent completed donations (for frontend display)
        const donations = await donationsCollection
          .find({ 
            status: 'completed',
            isAnonymous: false 
          })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();

        const publicDonations = donations.map(donation => ({
          id: donation._id.toString(),
          donorName: donation.donorName,
          amount: donation.amount,
          campaign: donation.campaign,
          date: donation.createdAt || new Date(),
          message: donation.message || ''
        }));

        res.status(200).json(publicDonations);
      } else {
        // Admin endpoint - Get all donations
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const donations = await donationsCollection.find({}).sort({ createdAt: -1 }).toArray();
        
        const formattedDonations = donations.map(donation => ({
          id: donation._id.toString(),
          ...donation,
          createdAt: donation.createdAt || new Date()
        }));

        res.status(200).json(formattedDonations);
      }
    } else if (req.method === 'POST') {
      // Create new donation
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const donationData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await donationsCollection.insertOne(donationData);
      const newDonation = await donationsCollection.findOne({ _id: result.insertedId });

      res.status(201).json({
        id: newDonation._id.toString(),
        ...newDonation
      });
    } else if (req.method === 'PUT') {
      // Update donation
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await donationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      const updatedDonation = await donationsCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        id: updatedDonation._id.toString(),
        ...updatedDonation
      });
    } else if (req.method === 'DELETE') {
      // Delete donation
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const result = await donationsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Donation not found' });
      }

      res.status(200).json({ message: 'Donation deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Donations API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
