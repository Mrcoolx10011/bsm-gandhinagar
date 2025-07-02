import { connectToDatabase } from './_lib/mongodb.js';
import jwt from 'jsonwebtoken';

// JWT verification helper
const verifyToken = (token) => {
  if (!token) return false;
  
  try {
    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

export default async function handler(req, res) {
  // Add CORS headers
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
    if (req.method === 'GET') {
      // Verify admin token
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const db = await connectToDatabase();
      
      // Get recent activities from various collections
      const recentMembers = await db.collection('members')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
        
      const recentDonations = await db.collection('donations')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
        
      const recentInquiries = await db.collection('inquiries')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      
      // Format activities for frontend
      const activities = [
        ...recentMembers.map(member => ({
          id: member._id.toString(),
          type: 'member',
          title: 'New Member',
          description: `${member.name} joined as a member`,
          timestamp: member.createdAt || new Date(),
          status: member.status || 'active'
        })),
        ...recentDonations.map(donation => ({
          id: donation._id.toString(),
          type: 'donation',
          title: 'New Donation',
          description: `${donation.donorName} donated ₹${donation.amount} to ${donation.campaign || 'general fund'}`,
          timestamp: donation.createdAt || new Date(),
          status: donation.status || 'completed',
          amount: donation.amount,
          approved: donation.approved
        })),
        ...recentInquiries.map(inquiry => ({
          id: inquiry._id.toString(),
          type: 'inquiry',
          title: 'New Inquiry',
          description: `${inquiry.name} sent an inquiry about ${inquiry.subject || 'general information'}`,
          timestamp: inquiry.createdAt || new Date(),
          status: inquiry.status || 'new'
        }))
      ];
      
      // Sort by timestamp descending
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return res.status(200).json(activities.slice(0, 10));
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Recent activities API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
