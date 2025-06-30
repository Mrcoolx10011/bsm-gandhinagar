import { connectToDatabase } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const donationsCollection = db.collection('donations');

    if (req.method === 'GET') {
      // Get recent completed donations (for frontend display)
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
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recent donations API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
