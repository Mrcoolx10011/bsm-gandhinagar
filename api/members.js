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
    const membersCollection = db.collection('members');

    if (req.method === 'GET') {
      const { public: isPublic } = req.query;
      
      if (isPublic) {
        // Public endpoint - Get active members (for frontend display)
        const members = await membersCollection
          .find({ status: 'active' })
          .limit(12)
          .toArray();

        const publicMembers = members.map(member => ({
          id: member._id.toString(),
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.membershipType || 'Member',
          location: member.address || 'India',
          bio: `${member.membershipType || 'Member'} since ${new Date(member.joinDate || member.createdAt).getFullYear()}`,
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          dateJoined: member.joinDate || member.createdAt,
          status: member.status
        }));
        
        res.status(200).json(publicMembers);
      } else {
        // Admin endpoint - Get all members
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!verifyToken(token)) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const members = await membersCollection.find({}).sort({ createdAt: -1 }).toArray();
        
        const formattedMembers = members.map(member => ({
          id: member._id.toString(),
          ...member,
          createdAt: member.createdAt || new Date()
        }));

        res.status(200).json(formattedMembers);
      }
    } else if (req.method === 'POST') {
      // Create new member
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const memberData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        joinDate: new Date()
      };

      const result = await membersCollection.insertOne(memberData);
      const newMember = await membersCollection.findOne({ _id: result.insertedId });

      res.status(201).json({
        id: newMember._id.toString(),
        ...newMember
      });
    } else if (req.method === 'PUT') {
      // Update member
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      const result = await membersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }

      const updatedMember = await membersCollection.findOne({ _id: new ObjectId(id) });
      res.status(200).json({
        id: updatedMember._id.toString(),
        ...updatedMember
      });
    } else if (req.method === 'DELETE') {
      // Delete member
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      const result = await membersCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.status(200).json({ message: 'Member deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Members API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
