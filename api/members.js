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
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Prevent caching for admin endpoints
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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

        // Generate avatar URL based on first letter of name
        const generateAvatarUrl = (name) => {
          if (!name) return 'https://ui-avatars.com/api/?name=U&background=random&color=fff&size=150';
          
          const firstLetter = name.charAt(0).toUpperCase();
          const colors = [
            '3B82F6', // blue
            '10B981', // emerald
            'F59E0B', // amber
            'EF4444', // red
            '8B5CF6', // violet
            '06B6D4', // cyan
            'F97316', // orange
            '84CC16', // lime
            'EC4899', // pink
            '6366F1'  // indigo
          ];
          
          // Use name length to pick a consistent color for each person
          const colorIndex = name.length % colors.length;
          const backgroundColor = colors[colorIndex];
          
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=${backgroundColor}&color=fff&size=150&font-size=0.6`;
        };

        const publicMembers = members.map((member) => ({
          id: member._id.toString(),
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.membershipType || 'Member',
          location: member.address || 'India',
          bio: `${member.membershipType || 'Member'} since ${new Date(member.joinDate || member.createdAt).getFullYear()}`,
          image: member.profileImage || member.image || generateAvatarUrl(member.name),
          dateJoined: member.joinDate || member.createdAt,
          status: member.status
        }));
        
        res.status(200).json(publicMembers);
      } else {
        // Admin endpoint - Get all members
        const token = req.headers.authorization;
        const verified = verifyToken(token);
        if (!verified) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const members = await membersCollection.find({}).sort({ createdAt: -1 }).toArray();
        
        // Generate avatar URL based on first letter of name
        const generateAvatarUrl = (name) => {
          if (!name) return 'https://ui-avatars.com/api/?name=U&background=random&color=fff&size=150';
          
          const firstLetter = name.charAt(0).toUpperCase();
          const colors = [
            '3B82F6', // blue
            '10B981', // emerald
            'F59E0B', // amber
            'EF4444', // red
            '8B5CF6', // violet
            '06B6D4', // cyan
            'F97316', // orange
            '84CC16', // lime
            'EC4899', // pink
            '6366F1'  // indigo
          ];
          
          // Use name length to pick a consistent color for each person
          const colorIndex = name.length % colors.length;
          const backgroundColor = colors[colorIndex];
          
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=${backgroundColor}&color=fff&size=150&font-size=0.6`;
        };
        
        const formattedMembers = members.map(member => ({
          id: member._id.toString(),
          ...member,
          image: member.profileImage || member.image || generateAvatarUrl(member.name),
          createdAt: member.createdAt || new Date()
        }));

        res.status(200).json(formattedMembers);
      }
    } else if (req.method === 'POST') {
      // Create new member
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate required fields
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      // Check if member with email already exists
      const existingMember = await membersCollection.findOne({ email: email });
      if (existingMember) {
        return res.status(400).json({ message: 'Member with this email already exists' });
      }

      const memberData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        joinDate: new Date()
      };

      console.log('Creating member:', memberData);

      const result = await membersCollection.insertOne(memberData);
      const newMember = await membersCollection.findOne({ _id: result.insertedId });

      console.log('Created member:', newMember);

      res.status(201).json({
        id: newMember._id.toString(),
        ...newMember
      });
    } else if (req.method === 'PUT') {
      // Update member
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Member ID is required' });
      }

      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid member ID format' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };

      console.log('Updating member:', id, updateData);

      const result = await membersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      console.log('Update result:', result);

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
      const token = req.headers.authorization;
      const verified = verifyToken(token);
      if (!verified) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Member ID is required' });
      }

      // Validate ObjectId format
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid member ID format' });
      }

      console.log('Deleting member:', id);

      const result = await membersCollection.deleteOne({ _id: new ObjectId(id) });

      console.log('Delete result:', result);

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Member not found' });
      }

      res.status(200).json({ message: 'Member deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Members API error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate entry detected' });
      }
    }
    
    // Handle ObjectId conversion errors
    if (error.message && error.message.includes('ObjectId')) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
