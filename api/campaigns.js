import { connectToDatabase } from './_lib/mongodb.js';
import { ObjectId } from 'mongodb';
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
    const db = await connectToDatabase();
    const campaignsCollection = db.collection('campaigns');
    const donationsCollection = db.collection('donations');

    if (req.method === 'GET') {
      const { active } = req.query;
      
      if (active) {
        // Public endpoint - Get active campaigns with donation statistics
        const campaigns = await campaignsCollection
          .find({ status: 'active' })
          .sort({ createdAt: -1 })
          .toArray();

        // Calculate donation statistics for each campaign
        const campaignsWithStats = await Promise.all(
          campaigns.map(async (campaign) => {
            const campaignDonations = await donationsCollection
              .find({ 
                campaign: campaign.title,
                status: 'completed',
                approved: true
              })
              .toArray();

            const raised = campaignDonations.reduce((sum, donation) => sum + donation.amount, 0);
            const donors = campaignDonations.length;

            return {
              id: campaign._id.toString(),
              title: campaign.title,
              description: campaign.description,
              target: campaign.target || 50000,
              raised: raised,
              donors: donors,
              image: campaign.image || 'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=400',
              category: campaign.category || 'General',
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              status: campaign.status
            };
          })
        );
        
        res.status(200).json(campaignsWithStats);
      } else {
        // Admin endpoint - Get all campaigns with donation statistics
        const token = req.headers.authorization;
        const verified = verifyToken(token);
        if (!verified) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const campaigns = await campaignsCollection.find({}).sort({ createdAt: -1 }).toArray();
        
        // Calculate donation statistics for each campaign (same as public endpoint)
        const campaignsWithStats = await Promise.all(
          campaigns.map(async (campaign) => {
            const campaignDonations = await donationsCollection
              .find({ 
                campaign: campaign.title,
                status: 'completed',
                approved: true
              })
              .toArray();

            const raised = campaignDonations.reduce((sum, donation) => sum + donation.amount, 0);
            const donors = campaignDonations.length;

            return {
              id: campaign._id.toString(),
              title: campaign.title,
              description: campaign.description,
              target: campaign.target || 50000,
              raised: raised,
              donors: donors,
              image: campaign.image || 'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=400',
              category: campaign.category || 'General',
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              status: campaign.status,
              createdAt: campaign.createdAt || new Date(),
              updatedAt: campaign.updatedAt || new Date()
            };
          })
        );

        res.status(200).json(campaignsWithStats);
      }
    } else if (req.method === 'POST') {
      // Create new campaign - Admin only
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, description, target, image, category, startDate, endDate } = req.body;
      
      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const campaignData = {
        title,
        description,
        target: parseFloat(target) || 50000,
        image: image || 'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: category || 'General',
        startDate: startDate || new Date().toISOString(),
        endDate: endDate,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await campaignsCollection.insertOne(campaignData);
      const newCampaign = await campaignsCollection.findOne({ _id: result.insertedId });

      res.status(201).json({
        id: newCampaign._id.toString(),
        ...newCampaign
      });
    } else if (req.method === 'PUT') {
      // Update campaign - Admin only
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Valid campaign ID is required' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await campaignsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      const updatedCampaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        id: updatedCampaign._id.toString(),
        ...updatedCampaign
      });
    } else if (req.method === 'DELETE') {
      // Delete campaign - Admin only
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Valid campaign ID is required' });
      }

      const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      res.status(200).json({ message: 'Campaign deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Campaigns API error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
