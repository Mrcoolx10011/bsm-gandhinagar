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
