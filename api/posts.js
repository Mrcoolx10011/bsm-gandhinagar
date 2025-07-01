import { connectToDatabase } from './_lib/mongodb.js';
import { verifyJWTToken } from './_lib/auth.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all posts (public endpoint)
      const { db } = await connectToDatabase();
      const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
      
      return res.status(200).json({ posts });
    }

    if (req.method === 'POST') {
      // Create new post (admin only)
      console.log('POST /api/posts - Creating new post');
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
      }

      console.log('Token received:', token.substring(0, 20) + '...');
      const user = verifyJWTToken(token);
      if (!user) {
        console.log('Token verification failed');
        return res.status(401).json({ error: 'Invalid token' });
      }

      console.log('User verified:', user);
      const { title, content, image, category, featured } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const { db } = await connectToDatabase();
      
      const newPost = {
        title,
        content,
        image: image || '',
        category: category || 'general',
        featured: featured || false,
        author: user.username || 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        views: 0
      };

      console.log('Creating post:', newPost);
      const result = await db.collection('posts').insertOne(newPost);
      console.log('Post created with ID:', result.insertedId);
      
      return res.status(201).json({ 
        message: 'Post created successfully',
        postId: result.insertedId
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

      const { db } = await connectToDatabase();
      
      const updateData = {
        title,
        content,
        image,
        category,
        featured,
        updatedAt: new Date().toISOString()
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

      return res.status(200).json({ message: 'Post updated successfully' });
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

      const { db } = await connectToDatabase();
      
      const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      return res.status(200).json({ message: 'Post deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Posts API error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
