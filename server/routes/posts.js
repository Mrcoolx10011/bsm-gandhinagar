import express from 'express';
import { connectToDatabase } from '../../lib/mongodb.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const router = express.Router();

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

// GET /api/posts - Get all posts (public)
router.get('/', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const posts = await db.collection('posts').find({}).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/posts - Create new post (admin only)
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/posts - Creating new post');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    console.log('Token received:', token.substring(0, 20) + '...');
    const user = verifyToken(token);
    if (!user) {
      console.log('Token verification failed');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('User verified:', user);
    const { title, content, image, category, featured } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = await connectToDatabase();
    
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
    
    res.status(201).json({ 
      message: 'Post created successfully',
      postId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/posts - Update post (admin only)
router.put('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id, title, content, image, category, featured } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const db = await connectToDatabase();
    
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

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/posts - Delete post (admin only)
router.delete('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    const db = await connectToDatabase();
    
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
