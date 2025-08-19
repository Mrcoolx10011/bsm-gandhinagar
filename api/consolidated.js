import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let cachedClient = null;
let isDevelopmentMode = false;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  // Check if MongoDB URI is properly configured
  console.log('🔍 Checking MongoDB URI:', MONGODB_URI ? 'URI provided' : 'URI missing');
  
  if (!MONGODB_URI || MONGODB_URI.includes('your-username') || MONGODB_URI.includes('your-password')) {
    console.log('⚠️  MongoDB not configured - running in development mode with mock data');
    console.log('⚠️  MONGODB_URI:', MONGODB_URI);
    isDevelopmentMode = true;
    return null;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    console.log('✅ Connected to MongoDB');
    return client;
  } catch (error) {
    console.log('⚠️  MongoDB connection failed - falling back to development mode:', error.message);
    isDevelopmentMode = true;
    return null;
  }
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
    const db = client ? client.db('bsm-gandhinagar') : null;

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
      case 'health':
        if (db) {
          const collections = await db.listCollections().toArray();
          console.log('📋 Available collections:', collections.map(c => c.name));
          return res.status(200).json({ 
            status: 'healthy', 
            message: 'BSM Gandhinagar API is running',
            database: 'connected',
            collections: collections.map(c => c.name),
            timestamp: new Date().toISOString()
          });
        } else {
          return res.status(200).json({ 
            status: 'healthy', 
            message: 'BSM Gandhinagar API is running (development mode)',
            database: 'development',
            collections: ['mock-data'],
            timestamp: new Date().toISOString()
          });
        }
        return res.status(200).json({ 
          status: 'healthy', 
          message: 'BSM Gandhinagar API is running',
          database: cachedClient ? 'connected' : 'disconnected',
          collections: collections.map(c => c.name),
          timestamp: new Date().toISOString()
        });
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
      console.log('🔍 Fetching members from database...');
      const members = await collection.find({}).toArray();
      console.log(`📊 Found ${members.length} members in database`);
      if (members.length > 0) {
        console.log('📋 Sample member:', JSON.stringify(members[0], null, 2));
      }
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
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Member updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new ObjectId(deleteId) });
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
      console.log('🔍 Fetching events from database...');
      const events = await collection.find({}).sort({ date: -1 }).toArray();
      console.log(`📊 Found ${events.length} events in database`);
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
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Event updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new ObjectId(deleteId) });
      return res.status(200).json({ message: 'Event deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Donations API Handler
async function handleDonations(req, res, db) {
  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    return handleDonationsDevelopmentMode(req, res);
  }

  const collection = db.collection('donations');

  switch (req.method) {
    case 'GET':
      const { recent, id: getDonationId } = req.query;
      
      if (getDonationId) {
        // Get specific donation
        const donation = await collection.findOne({ _id: new ObjectId(getDonationId) });
        return res.status(200).json(donation);
      }
      
      if (recent === 'true') {
        // Get recent approved donations for public display (limit 10)
        const recentDonations = await collection
          .find({ approved: true, status: 'completed' })
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();
        return res.status(200).json(recentDonations);
      }
      
      // Get all donations (admin view)
      const donations = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(donations);

    case 'POST':
      const newDonation = {
        ...req.body,
        createdAt: new Date(),
        status: 'pending',
        approved: false
      };
      const result = await collection.insertOne(newDonation);
      return res.status(201).json({ _id: result.insertedId, ...newDonation });

    case 'PUT':
      const { id: updateId } = req.query;
      const updateData = { ...req.body, updatedAt: new Date() };
      
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(updateId) },
        { $set: updateData }
      );
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      const updatedDonation = await collection.findOne({ _id: new ObjectId(updateId) });
      return res.status(200).json(updatedDonation);

    case 'DELETE':
      const { id: deleteId } = req.query;
      
      if (!deleteId) {
        return res.status(400).json({ error: 'Donation ID is required' });
      }
      
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
      
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      return res.status(200).json({ message: 'Donation deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Development mode handler for donations
function handleDonationsDevelopmentMode(req, res) {
  console.log('🔧 Running donations in development mode');
  
  // Mock data for development
  const mockDonations = [
    {
      _id: '66c123456789012345678901',
      id: '66c123456789012345678901',
      donorName: 'Test Donor 1',
      email: 'donor1@test.com',
      phone: '+91-9876543210',
      amount: 1000,
      campaign: 'Education for All',
      paymentMethod: 'upi',
      status: 'completed',
      approved: true,
      isAnonymous: false,
      message: 'Keep up the good work!',
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-08-15')
    },
    {
      _id: '66c123456789012345678902',
      id: '66c123456789012345678902',
      donorName: 'Anonymous',
      email: '',
      phone: '',
      amount: 500,
      campaign: 'Healthcare Support',
      paymentMethod: 'card',
      status: 'completed',
      approved: true,
      isAnonymous: true,
      message: '',
      createdAt: new Date('2024-08-14'),
      updatedAt: new Date('2024-08-14')
    }
  ];

  switch (req.method) {
    case 'GET':
      const { recent, id: getDonationId } = req.query;
      
      if (getDonationId) {
        const donation = mockDonations.find(d => d._id === getDonationId || d.id === getDonationId);
        return res.status(200).json(donation || null);
      }
      
      if (recent === 'true') {
        const recentDonations = mockDonations
          .filter(d => d.approved && d.status === 'completed')
          .slice(0, 10);
        return res.status(200).json(recentDonations);
      }
      
      return res.status(200).json(mockDonations);

    case 'POST':
      const newId = Date.now().toString();
      const newDonation = {
        _id: newId,
        id: newId,
        ...req.body,
        createdAt: new Date(),
        status: 'pending',
        approved: false
      };
      console.log('🆕 Created mock donation:', newDonation);
      return res.status(201).json(newDonation);

    case 'PUT':
      const { id: updateId } = req.query;
      const donation = mockDonations.find(d => d._id === updateId || d.id === updateId);
      
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      const updatedDonation = { ...donation, ...req.body, updatedAt: new Date() };
      console.log('✏️  Updated mock donation:', updatedDonation);
      return res.status(200).json(updatedDonation);

    case 'DELETE':
      const { id: deleteId } = req.query;
      
      if (!deleteId) {
        return res.status(400).json({ error: 'Donation ID is required' });
      }
      
      const donationExists = mockDonations.find(d => d._id === deleteId || d.id === deleteId);
      
      if (!donationExists) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      console.log('🗑️ Deleted mock donation:', deleteId);
      return res.status(200).json({ message: 'Donation deleted successfully' });

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
      // Check if this is a like/view action
      if (req.query.action === 'like') {
        const { id } = req.query;
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        const updatedPost = await collection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json({ likes: updatedPost.likes });
      }
      
      if (req.query.action === 'view') {
        const { id } = req.query;
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { views: 1 } }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        const updatedPost = await collection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json({ views: updatedPost.views });
      }

      // Regular post creation
      const newPost = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        views: 0,
        author: req.body.author || 'Admin'
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
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Post updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new ObjectId(deleteId) });
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
  // Handle admin login - check for login in the endpoint or body
  if (req.method === 'POST' && (req.query.action === 'login' || req.body?.action === 'login' || req.url?.includes('/login'))) {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(200).json({ token, user: { username, role: 'admin' } });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  // Check if this is a public admin stats request
  const { type } = req.query;
  
  // For dashboard stats, allow public access temporarily
  if (req.method === 'GET' && type) {
    console.log(`📊 Public admin stats request for: ${type}`);
    
    switch (type) {
      case 'posts':
        const posts = await db.collection('posts').find({}).toArray();
        console.log(`📝 Found ${posts.length} posts`);
        return res.status(200).json(posts);
        
      case 'members':
        const members = await db.collection('members').find({}).toArray();
        return res.status(200).json(members);
        
      case 'events':
        const events = await db.collection('events').find({}).toArray();
        return res.status(200).json(events);
        
      case 'donations':
        const donations = await db.collection('donations').find({}).toArray();
        return res.status(200).json(donations);
        
      case 'recent-activities':
        // Generate recent activities from existing data
        const activities = [];
        
        // Get recent donations
        const recentDonations = await db.collection('donations')
          .find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray();
        
        recentDonations.forEach(donation => {
          activities.push({
            _id: donation._id,
            type: 'donation',
            title: 'New Donation',
            description: `${donation.name || 'Anonymous'} donated ₹${donation.amount || 0}`,
            timestamp: donation.createdAt || new Date(),
            icon: '💰'
          });
        });

        // Get recent members
        const recentMembers = await db.collection('members')
          .find({})
          .sort({ createdAt: -1 })
          .limit(2)
          .toArray();
        
        recentMembers.forEach(member => {
          activities.push({
            _id: member._id,
            type: 'member',
            title: 'New Member',
            description: `${member.name || 'New member'} joined`,
            timestamp: member.createdAt || member.joinDate || new Date(),
            icon: '👥'
          });
        });

        // Get recent events
        const recentEvents = await db.collection('events')
          .find({})
          .sort({ createdAt: -1 })
          .limit(2)
          .toArray();
        
        recentEvents.forEach(event => {
          activities.push({
            _id: event._id,
            type: 'event',
            title: 'Event Created',
            description: event.title || event.name || 'New event',
            timestamp: event.createdAt || new Date(),
            icon: '📅'
          });
        });

        // Sort by timestamp and return top 10
        const sortedActivities = activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

        return res.status(200).json(sortedActivities);
        
      default:
        return res.status(400).json({ error: 'Invalid type parameter' });
    }
  }

  // Verify admin token for other operations (temporarily disabled for testing)
  /*
  console.log('🔐 Admin request headers:', req.headers);
  const token = req.headers?.authorization?.replace('Bearer ', '');
  console.log('🔑 Token extracted:', token ? 'Present' : 'Missing');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    console.log('❌ Admin authentication failed');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  */

  // Admin dashboard stats
  if (req.method === 'GET') {
    // For now, allow public access to stats for testing
    // TODO: Re-enable authentication later
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
      try {
        // Generate recent activities from existing collections
        const activities = [];
        
        // Get recent donations
        const recentDonations = await db.collection('donations')
          .find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray();
        
        recentDonations.forEach(donation => {
          activities.push({
            _id: donation._id,
            type: 'donation',
            title: 'New Donation Received',
            description: `${donation.name || 'Anonymous'} donated ₹${donation.amount || 0}`,
            timestamp: donation.createdAt || new Date(),
            data: donation
          });
        });

        // Get recent members
        const recentMembers = await db.collection('members')
          .find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray();
        
        recentMembers.forEach(member => {
          activities.push({
            _id: member._id,
            type: 'member',
            title: 'New Member Joined',
            description: `${member.name || 'New member'} joined the organization`,
            timestamp: member.createdAt || member.joinDate || new Date(),
            data: member
          });
        });

        // Get recent events
        const recentEvents = await db.collection('events')
          .find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray();
        
        recentEvents.forEach(event => {
          activities.push({
            _id: event._id,
            type: 'event',
            title: 'Event Created',
            description: `New event: ${event.title || event.name}`,
            timestamp: event.createdAt || new Date(),
            data: event
          });
        });

        // Get recent posts
        const recentPosts = await db.collection('posts')
          .find({})
          .sort({ createdAt: -1 })
          .limit(2)
          .toArray();
        
        recentPosts.forEach(post => {
          activities.push({
            _id: post._id,
            type: 'post',
            title: 'New Post Published',
            description: post.title || 'New post published',
            timestamp: post.createdAt || new Date(),
            data: post
          });
        });

        // Sort all activities by timestamp and limit to 10
        const sortedActivities = activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

        return res.status(200).json(sortedActivities);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        return res.status(500).json({ error: 'Failed to fetch recent activities' });
      }

    case 'POST':
      // Create a real recent_activities collection entry if needed
      try {
        const newActivity = {
          ...req.body,
          timestamp: new Date()
        };
        const result = await db.collection('recent_activities').insertOne(newActivity);
        return res.status(201).json({ _id: result.insertedId, ...newActivity });
      } catch (error) {
        console.error('Error creating activity:', error);
        return res.status(500).json({ error: 'Failed to create activity' });
      }

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
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Content updated successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
