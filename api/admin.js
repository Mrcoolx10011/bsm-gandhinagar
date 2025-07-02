// Consolidated admin API endpoints
// Combines: posts and recent-activities
import { connectToDatabase } from './_lib/mongodb.js';
import { verifyJWTToken, addCORSHeaders } from './_lib/auth.js';
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
  addCORSHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Determine endpoint from URL path or query
    const urlPath = req.url;
    const { type } = req.query;
    
    let endpoint = type || 'posts';
    if (urlPath.includes('/recent-activities')) {
      endpoint = 'recent-activities';
    } else if (urlPath.includes('/posts')) {
      endpoint = 'posts';
    }

    const db = await connectToDatabase();

    // Handle posts endpoints
    if (endpoint === 'posts') {
      if (req.method === 'GET') {
        // Get all posts (public endpoint)
        const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
        
        const formattedPosts = posts.map(post => ({
          id: post._id.toString(),
          ...post,
          createdAt: post.createdAt || new Date()
        }));
        
        return res.status(200).json({ posts: formattedPosts });
      }

      if (req.method === 'POST') {
        // Create new post (admin only)
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const user = verifyJWTToken(token);
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        const { title, content, image, category, featured } = req.body;
        
        if (!title || !content) {
          return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const newPost = {
          title,
          content,
          image: image || '',
          category: category || 'general',
          featured: featured || false,
          author: user.username || 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          likes: 0,
          views: 0
        };

        const result = await db.collection('posts').insertOne(newPost);
        
        return res.status(201).json({ 
          message: 'Post created successfully',
          id: result.insertedId.toString(),
          ...newPost
        });
      }

      if (req.method === 'PUT') {
        // Update post (admin only)
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const user = verifyJWTToken(token);
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        const { id, title, content, image, category, featured } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: 'Post ID is required' });
        }
        
        const updateData = {
          title,
          content,
          image,
          category,
          featured,
          updatedAt: new Date()
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );

        const result = await db.collection('posts').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }

        const updatedPost = await db.collection('posts').findOne({ _id: new ObjectId(id) });
        return res.status(200).json({ 
          message: 'Post updated successfully',
          id: updatedPost._id.toString(),
          ...updatedPost
        });
      }

      if (req.method === 'DELETE') {
        // Delete post (admin only)
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }

        const user = verifyJWTToken(token);
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ error: 'Post ID is required' });
        }
        
        const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json({ message: 'Post deleted successfully' });
      }
    }
    
    // Handle recent activities endpoint
    else if (endpoint === 'recent-activities') {
      if (req.method === 'GET') {
        // Verify admin token
        const token = req.headers.authorization?.replace('Bearer ', '');
        const user = verifyToken(token);
        
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        
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
      }
    }
    
    // Handle unknown endpoints
    else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    
    // If we reach here, the method isn't supported
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
