import { connectToDatabase } from '../_lib/mongodb.js';
import { addCORSHeaders } from '../_lib/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Add CORS headers
  addCORSHeaders(res, req);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Environment check endpoint - GET request
  if (req.method === 'GET') {
    const envStatus = {
      timestamp: new Date().toISOString(),
      hasDatabase: !!(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL),
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminUsername: !!process.env.ADMIN_USERNAME,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      nodeEnv: process.env.NODE_ENV || 'not-set',
      adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET',
      databaseVar: process.env.DATABASE_URL ? 'DATABASE_URL' : 
                   process.env.MONGODB_URI ? 'MONGODB_URI' : 
                   process.env.MONGO_URL ? 'MONGO_URL' : 'NONE'
    };
    
    return res.status(200).json({
      message: 'Environment check completed',
      environment: envStatus
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if environment variables are set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' });
    }

    const dbUri = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!dbUri) {
      console.error('Database environment variable is not set (DATABASE_URL, MONGODB_URI, or MONGO_URL)');
      return res.status(500).json({ message: 'Server configuration error: Database URL not set' });
    }

    // For demo purposes, check against environment variables first
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', username: username },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: 'admin',
          username: username,
          email: process.env.ADMIN_EMAIL || 'admin@bsmgandhinagar.org',
          role: 'admin'
        }
      });
    }

    // Also check database
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Environment check:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabase: !!(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL),
      hasAdminUsername: !!process.env.ADMIN_USERNAME,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      nodeEnv: process.env.NODE_ENV
    });
    res.status(500).json({ 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error' 
    });
  }
}
