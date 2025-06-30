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
    const inquiriesCollection = db.collection('inquiries');

    if (req.method === 'GET') {
      // Admin endpoint - Get all inquiries
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const inquiries = await inquiriesCollection.find({}).sort({ createdAt: -1 }).toArray();
      
      const formattedInquiries = inquiries.map(inquiry => ({
        id: inquiry._id.toString(),
        ...inquiry,
        createdAt: inquiry.createdAt || new Date()
      }));

      res.status(200).json(formattedInquiries);
    } else if (req.method === 'POST') {
      // Create new inquiry (public endpoint for contact form)
      const inquiryData = {
        ...req.body,
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await inquiriesCollection.insertOne(inquiryData);
      const newInquiry = await inquiriesCollection.findOne({ _id: result.insertedId });

      res.status(201).json({
        id: newInquiry._id.toString(),
        ...newInquiry
      });
    } else if (req.method === 'PUT') {
      // Update inquiry
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await inquiriesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Inquiry not found' });
      }

      const updatedInquiry = await inquiriesCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        id: updatedInquiry._id.toString(),
        ...updatedInquiry
      });
    } else if (req.method === 'DELETE') {
      // Delete inquiry
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const result = await inquiriesCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Inquiry not found' });
      }

      res.status(200).json({ message: 'Inquiry deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Inquiries API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
