import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
