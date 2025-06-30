import { connectToDatabase } from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';

// Middleware for JWT verification
const verifyToken = (token) => {
  // Simple token validation for Vercel serverless
  return token === process.env.ADMIN_TOKEN || token?.includes('Bearer');
};

export default async function handler(req, res) {
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
