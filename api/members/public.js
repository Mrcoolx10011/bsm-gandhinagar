import { connectToDatabase } from '../_lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const membersCollection = db.collection('members');

    if (req.method === 'GET') {
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
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Public members API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
