import { MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Utility function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;
  
  try {
    const client = await connectToDatabase();
    const db = client.db('bsm_gandhinagar');

    switch (endpoint) {
      case 'members':
        return await handleMembers(req, res, db);
      case 'events':
        return await handleEvents(req, res, db);
      case 'donations':
        return await handleDonations(req, res, db);
      case 'inquiries':
        return await handleInquiries(req, res, db);
      case 'posts':
        return await handlePosts(req, res, db);
      case 'campaigns':
        return await handleCampaigns(req, res, db);
      case 'admin':
        return await handleAdmin(req, res, db);
      case 'recent-activities':
        return await handleRecentActivities(req, res, db);
      case 'content':
        return await handleContent(req, res, db);
      case 'hello':
        return res.status(200).json({ message: 'Hello from BSM Gandhinagar API!' });
      case 'env-check':
        return res.status(200).json({ 
          mongodb: !!MONGODB_URI,
          jwt: !!JWT_SECRET,
          timestamp: new Date().toISOString()
        });
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Members API Handler
async function handleMembers(req, res, db) {
  const collection = db.collection('members');

  switch (req.method) {
    case 'GET':
      const members = await collection.find({}).toArray();
      return res.status(200).json(members);

    case 'POST':
      const newMember = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newMember);
      return res.status(201).json({ _id: result.insertedId, ...newMember });

    case 'PUT':
      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      await collection.updateOne(
        { _id: new MongoClient.ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Member updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new MongoClient.ObjectId(deleteId) });
      return res.status(200).json({ message: 'Member deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Events API Handler
async function handleEvents(req, res, db) {
  const collection = db.collection('events');

  switch (req.method) {
    case 'GET':
      const events = await collection.find({}).sort({ date: -1 }).toArray();
      return res.status(200).json(events);

    case 'POST':
      const newEvent = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newEvent);
      return res.status(201).json({ _id: result.insertedId, ...newEvent });

    case 'PUT':
      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      await collection.updateOne(
        { _id: new MongoClient.ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Event updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new MongoClient.ObjectId(deleteId) });
      return res.status(200).json({ message: 'Event deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Donations API Handler
async function handleDonations(req, res, db) {
  const collection = db.collection('donations');

  switch (req.method) {
    case 'GET':
      const donations = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(donations);

    case 'POST':
      const newDonation = {
        ...req.body,
        createdAt: new Date(),
        status: 'pending'
      };
      const result = await collection.insertOne(newDonation);
      return res.status(201).json({ _id: result.insertedId, ...newDonation });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Inquiries API Handler
async function handleInquiries(req, res, db) {
  const collection = db.collection('inquiries');

  switch (req.method) {
    case 'GET':
      const inquiries = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(inquiries);

    case 'POST':
      const newInquiry = {
        ...req.body,
        createdAt: new Date(),
        status: 'new'
      };
      const result = await collection.insertOne(newInquiry);
      return res.status(201).json({ _id: result.insertedId, ...newInquiry });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Posts API Handler
async function handlePosts(req, res, db) {
  const collection = db.collection('posts');

  switch (req.method) {
    case 'GET':
      const posts = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(posts);

    case 'POST':
      const newPost = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newPost);
      return res.status(201).json({ _id: result.insertedId, ...newPost });

    case 'PUT':
      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      await collection.updateOne(
        { _id: new MongoClient.ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Post updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new MongoClient.ObjectId(deleteId) });
      return res.status(200).json({ message: 'Post deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Campaigns API Handler
async function handleCampaigns(req, res, db) {
  const collection = db.collection('campaigns');

  switch (req.method) {
    case 'GET':
      const campaigns = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(campaigns);

    case 'POST':
      const newCampaign = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newCampaign);
      return res.status(201).json({ _id: result.insertedId, ...newCampaign });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Admin API Handler
async function handleAdmin(req, res, db) {
  if (req.method === 'POST' && req.url?.includes('/login')) {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(200).json({ token, user: { username, role: 'admin' } });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  // Verify admin token for other operations
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Admin dashboard stats
  if (req.method === 'GET') {
    const [members, events, donations, inquiries] = await Promise.all([
      db.collection('members').countDocuments(),
      db.collection('events').countDocuments(),
      db.collection('donations').countDocuments(),
      db.collection('inquiries').countDocuments()
    ]);

    return res.status(200).json({
      totalMembers: members,
      totalEvents: events,
      totalDonations: donations,
      totalInquiries: inquiries
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Recent Activities API Handler
async function handleRecentActivities(req, res, db) {
  switch (req.method) {
    case 'GET':
      const activities = await db.collection('recent_activities')
        .find({})
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();
      return res.status(200).json(activities);

    case 'POST':
      const newActivity = {
        ...req.body,
        timestamp: new Date()
      };
      const result = await db.collection('recent_activities').insertOne(newActivity);
      return res.status(201).json({ _id: result.insertedId, ...newActivity });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Content API Handler
async function handleContent(req, res, db) {
  const collection = db.collection('content');

  switch (req.method) {
    case 'GET':
      const content = await collection.find({}).toArray();
      return res.status(200).json(content);

    case 'POST':
      const newContent = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newContent);
      return res.status(201).json({ _id: result.insertedId, ...newContent });

    case 'PUT':
      const { id } = req.query;
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      await collection.updateOne(
        { _id: new MongoClient.ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Content updated successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}