const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const ImageKit = require('imagekit');
const formidable = require('formidable');
const fs = require('fs');

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Initialize ImageKit
console.log('🔑 ImageKit Environment Variables:', {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? 'SET' : 'MISSING',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'SET' : 'MISSING',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? 'SET' : 'MISSING'
});

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

let cachedClient = null;
let isDevelopmentMode = false;

// Simple multipart form data parser
function parseMultipartFormData(body, boundary) {
  const fields = {};
  const files = {};

  // Split by boundary - include the boundary markers
  const fullBoundary = `--${boundary}`;
  const parts = body.split(fullBoundary);
  
  console.log('📊 Total boundary splits:', parts.length);

  for (let i = 1; i < parts.length - 1; i++) { // Skip first empty part and last closing part
    const part = parts[i];
    
    // Skip if part doesn't contain form data
    if (!part.includes('Content-Disposition: form-data')) continue;
    
    console.log(`📊 Processing part ${i}:`, part.substring(0, 300));
    
    // Find the double CRLF that separates headers from data
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) {
      console.log('📊 No header separator found');
      continue;
    }
    
    const headerSection = part.substring(0, headerEndIndex);
    const dataSection = part.substring(headerEndIndex + 4);
    
    // Remove trailing CRLF and boundary markers
    const cleanDataSection = dataSection.replace(/\r\n.*$/, '');
    
    console.log('📊 Headers section:', headerSection);
    console.log('📊 Data section length:', cleanDataSection.length);
    
    // Parse Content-Disposition header
    const dispositionMatch = headerSection.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!dispositionMatch) {
      console.log('📊 No valid Content-Disposition found');
      continue;
    }
    
    const name = dispositionMatch[1];
    const filename = dispositionMatch[2];
    
    // Parse Content-Type header
    const contentTypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
    const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : '';
    
    console.log('📊 Parsed:', { name, filename, contentType });
    
    if (filename) {
      // It's a file - use binary encoding for file data
      files[name] = {
        filename: filename,
        contentType: contentType,
        data: Buffer.from(cleanDataSection, 'binary')
      };
      console.log('📊 Added file:', name, 'size:', files[name].data.length);
    } else {
      // It's a regular field
      fields[name] = cleanDataSection.trim();
      console.log('📊 Added field:', name, '=', fields[name]);
    }
  }

  return { fields, files };
}

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

module.exports = async function handler(req, res) {
  console.log('🚀 API Request:', {
    method: req.method,
    url: req.url,
    query: req.query,
    endpoint: req.query.endpoint,
    timestamp: new Date().toISOString()
  });

  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse JSON body for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']?.includes('application/json')) {
    try {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', chunk => {
        body += chunk;
      });
      
      await new Promise(resolve => {
        req.on('end', () => {
          try {
            if (body) {
              req.body = JSON.parse(body);
              console.log('📥 Parsed JSON body:', req.body);
            } else {
              req.body = {};
            }
          } catch (parseError) {
            console.error('❌ JSON parsing error:', parseError);
            req.body = {};
          }
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Body parsing error:', error);
      req.body = {};
    }
  }

  const { endpoint } = req.query;
  console.log('🎯 Processing endpoint:', endpoint);
  
  try {
    const client = await connectToDatabase();
    const db = client ? client.db('bsm-gandhinagar') : null;
    
    console.log('💾 Database status:', {
      client: !!client,
      db: !!db,
      isDevelopmentMode
    });

    switch (endpoint) {
      case 'upload-image':
        return await handleImageUpload(req, res);
      case 'imagekit-auth':
        return await handleImageKitAuth(req, res);
      case 'imagekit-list':
        return await handleImageKitList(req, res);
      case 'imagekit-delete':
        return await handleImageKitDelete(req, res);
      case 'auth':
      case 'login':
        return await handleAuth(req, res, db);
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
// Members API Handler
async function handleMembers(req, res, db) {
  console.log('👥 handleMembers called with:', {
    method: req.method,
    query: req.query,
    hasDb: !!db,
    isDevelopmentMode
  });

  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    console.log('🔄 Redirecting to development mode handler');
    return handleMembersDevelopmentMode(req, res);
  }

  try {
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
        console.log('🆕 Creating new member:', req.body);
        const newMember = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newMember);
        console.log('✅ Member created successfully:', result.insertedId);
        return res.status(201).json({ _id: result.insertedId, ...newMember });

      case 'PUT':
        const { id } = req.query;
        console.log('✏️  Updating member:', { id, data: req.body });
        
        if (!id) {
          return res.status(400).json({ error: 'Member ID is required' });
        }
        
        // Remove immutable fields that shouldn't be updated
        const { _id, id: idField, createdAt, ...updateFields } = req.body;
        const updateData = {
          ...updateFields,
          updatedAt: new Date()
        };
        
        console.log('🔧 Cleaned update data:', updateData);
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Member not found' });
        }
        
        console.log('✅ Member updated successfully');
        return res.status(200).json({ message: 'Member updated successfully' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        console.log('🗑️ Deleting member:', deleteId);
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Member ID is required' });
        }
        
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Member not found' });
        }
        
        console.log('✅ Member deleted successfully');
        return res.status(200).json({ message: 'Member deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Members API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Development mode handler for members
function handleMembersDevelopmentMode(req, res) {
  console.log('👥 Running members in development mode');

  switch (req.method) {
    case 'GET':
      console.log('🔍 Returning mock members data');
      const mockMembers = [
        {
          _id: 'member-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91-9876543210',
          membershipType: 'Active',
          joinDate: '2024-01-15',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'member-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+91-9876543211',
          membershipType: 'Lifetime',
          joinDate: '2023-05-20',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      return res.status(200).json(mockMembers);

    case 'POST':
      const newMember = {
        _id: `member-${Date.now()}`,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('🆕 Created mock member:', newMember);
      return res.status(201).json(newMember);

    case 'PUT':
      const { id: updateId } = req.query;
      console.log('✏️  Attempting to update member with ID:', updateId);
      
      if (!updateId) {
        console.log('❌ No ID provided for update');
        return res.status(400).json({ error: 'Member ID is required' });
      }
      
      console.log('✅ Accepting update for any ID in development mode');
      console.log('📝 Update data:', req.body);
      
      return res.status(200).json({ 
        message: 'Member updated successfully (development mode)',
        id: updateId,
        data: req.body
      });

    case 'DELETE':
      const { id: deleteId } = req.query;
      console.log('🗑️ Attempting to delete member with ID:', deleteId);
      
      if (!deleteId) {
        console.log('❌ No ID provided for deletion');
        return res.status(400).json({ error: 'Member ID is required' });
      }
      
      console.log('✅ Accepting deletion for any ID in development mode');
      
      return res.status(200).json({ 
        message: 'Member deleted successfully (development mode)',
        id: deleteId
      });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Events API Handler
async function handleEvents(req, res, db) {
  console.log('🎯 handleEvents called with:', {
    method: req.method,
    query: req.query,
    hasDb: !!db,
    isDevelopmentMode
  });

  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    console.log('🔄 Redirecting to development mode handler');
    return handleEventsDevelopmentMode(req, res);
  }

  try {
    const collection = db.collection('events');

    switch (req.method) {
      case 'GET':
        console.log('🔍 Fetching events from database...');
        const events = await collection.find({}).sort({ date: -1 }).toArray();
        console.log(`📊 Found ${events.length} events in database`);
        return res.status(200).json(events);

      case 'POST':
        console.log('🆕 Creating new event:', req.body);
        const newEvent = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newEvent);
        console.log('✅ Event created successfully:', result.insertedId);
        return res.status(201).json({ _id: result.insertedId, ...newEvent });

      case 'PUT':
        const { id } = req.query;
        console.log('✏️  Updating event:', { id, data: req.body });
        
        if (!id) {
          return res.status(400).json({ error: 'Event ID is required' });
        }
        
        // Remove immutable fields that shouldn't be updated
        const { _id, id: idField, createdAt, ...updateFields } = req.body;
        const updateData = {
          ...updateFields,
          updatedAt: new Date()
        };
        
        console.log('🔧 Cleaned update data:', updateData);
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('✅ Event updated successfully');
        return res.status(200).json({ message: 'Event updated successfully' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        console.log('🗑️ Deleting event:', deleteId);
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Event ID is required' });
        }
        
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        console.log('✅ Event deleted successfully');
        return res.status(200).json({ message: 'Event deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Events API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Development mode handler for events
function handleEventsDevelopmentMode(req, res) {
  console.log('🔧 Running events in development mode');
  console.log('🔧 Request method:', req.method);
  console.log('🔧 Request query:', req.query);
  console.log('🔧 Request body:', req.body);
  
  // Mock data for development
  const mockEvents = [
    {
      _id: '66c123456789012345678901',
      id: '66c123456789012345678901',
      title: 'Bihar Cultural Festival',
      description: 'Annual cultural festival celebrating Bihar heritage',
      date: '2024-09-15T00:00:00.000Z',
      time: '10:00 AM',
      location: 'Gandhinagar Community Center',
      category: 'Cultural',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
      gallery: [],
      attendees: 45,
      maxAttendees: 100,
      status: 'active',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    },
    {
      _id: '66c123456789012345678902',
      id: '66c123456789012345678902',
      title: 'Educational Workshop',
      description: 'Workshop on modern teaching methods',
      date: '2024-09-20T00:00:00.000Z',
      time: '2:00 PM',
      location: 'BSM School Campus',
      category: 'Education',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500',
      gallery: [],
      attendees: 25,
      maxAttendees: 50,
      status: 'active',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    }
  ];

  switch (req.method) {
    case 'GET':
      console.log('📋 Returning mock events:', mockEvents.length);
      return res.status(200).json(mockEvents);

    case 'POST':
      const newId = Date.now().toString();
      const newEvent = {
        _id: newId,
        id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('🆕 Created mock event:', newEvent);
      return res.status(201).json(newEvent);

    case 'PUT':
      const { id: updateId } = req.query;
      console.log('✏️  Attempting to update event with ID:', updateId);
      
      if (!updateId) {
        console.log('❌ No ID provided for update');
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // In development mode, we'll accept any ID format and just return success
      // This handles both mock IDs and real MongoDB ObjectIds
      console.log('✅ Accepting update for any ID in development mode');
      console.log('📝 Update data:', req.body);
      
      const updatedEvent = { 
        _id: updateId,
        id: updateId,
        ...req.body, 
        updatedAt: new Date() 
      };
      console.log('✅ Mock event updated successfully');
      return res.status(200).json({ message: 'Event updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      console.log('🗑️  Attempting to delete event with ID:', deleteId);
      
      if (!deleteId) {
        console.log('❌ No ID provided for delete');
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // In development mode, we'll accept any ID format and just return success
      console.log('✅ Accepting delete for any ID in development mode');
      console.log('✅ Mock event deleted successfully');
      return res.status(200).json({ message: 'Event deleted successfully' });

    default:
      console.log('❌ Method not allowed:', req.method);
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
      // Remove immutable fields that shouldn't be updated
      const { _id, id: idField, createdAt, ...updateFields } = req.body;
      const updateData = {
        ...updateFields,
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
  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    return handleCampaignsDevelopmentMode(req, res);
  }

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

    case 'PUT':
      const { id } = req.query;
      // Remove immutable fields that shouldn't be updated
      const { _id, id: idField, createdAt, ...updateFields } = req.body;
      const updateData = {
        ...updateFields,
        updatedAt: new Date()
      };
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      return res.status(200).json({ message: 'Campaign updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      await collection.deleteOne({ _id: new ObjectId(deleteId) });
      return res.status(200).json({ message: 'Campaign deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Development mode handler for campaigns
function handleCampaignsDevelopmentMode(req, res) {
  console.log('🔧 Running campaigns in development mode');
  
  // Mock data for development
  const mockCampaigns = [
    {
      _id: '66c123456789012345678901',
      id: '66c123456789012345678901',
      title: 'Education for All',
      description: 'Supporting education initiatives in rural Bihar',
      target: 100000,
      raised: 45000,
      donors: 25,
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=500',
      category: 'Education',
      startDate: '2024-08-01T00:00:00.000Z',
      endDate: '2024-12-31T00:00:00.000Z',
      status: 'active',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    },
    {
      _id: '66c123456789012345678902',
      id: '66c123456789012345678902',
      title: 'Healthcare Support',
      description: 'Providing medical assistance to underprivileged communities',
      target: 75000,
      raised: 30000,
      donors: 18,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500',
      category: 'Healthcare',
      startDate: '2024-07-15T00:00:00.000Z',
      endDate: '2024-11-30T00:00:00.000Z',
      status: 'active',
      createdAt: new Date('2024-07-15'),
      updatedAt: new Date('2024-07-15')
    }
  ];

  switch (req.method) {
    case 'GET':
      return res.status(200).json(mockCampaigns);

    case 'POST':
      const newId = Date.now().toString();
      const newCampaign = {
        _id: newId,
        id: newId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('🆕 Created mock campaign:', newCampaign);
      return res.status(201).json(newCampaign);

    case 'PUT':
      const { id: updateId } = req.query;
      const campaign = mockCampaigns.find(c => c._id === updateId || c.id === updateId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      const updatedCampaign = { ...campaign, ...req.body, updatedAt: new Date() };
      console.log('✏️  Updated mock campaign:', updatedCampaign);
      return res.status(200).json({ message: 'Campaign updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      
      if (!deleteId) {
        return res.status(400).json({ error: 'Campaign ID is required' });
      }
      
      const campaignExists = mockCampaigns.find(c => c._id === deleteId || c.id === deleteId);
      
      if (!campaignExists) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      console.log('🗑️ Deleted mock campaign:', deleteId);
      return res.status(200).json({ message: 'Campaign deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Auth API Handler (dedicated authentication endpoint)
async function handleAuth(req, res, db) {
  console.log('🔐 Auth request:', {
    method: req.method,
    endpoint: req.query.endpoint,
    action: req.query.action,
    body: req.body
  });

  // Handle admin login
  if (req.method === 'POST') {
    const { username, password } = req.body;
    
    console.log('🔑 Login attempt:', { username, hasPassword: !!password });
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      console.log('✅ Login successful for:', username);
      return res.status(200).json({ 
        token, 
        user: { 
          username, 
          role: 'admin',
          email: 'admin@bsmgandhinagar.org'
        } 
      });
    } else {
      console.log('❌ Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  // Handle token verification
  if (req.method === 'GET') {
    const token = req.headers?.authorization?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (decoded) {
      return res.status(200).json({ 
        user: { 
          username: decoded.username, 
          role: decoded.role,
          email: 'admin@bsmgandhinagar.org'
        } 
      });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
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

// ImageKit Upload Handler (Enhanced with Formidable)
async function handleImageUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Upload request received');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error('Missing ImageKit environment variables');
      return res.status(500).json({ 
        error: 'ImageKit not configured',
        envCheck: {
          hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
          hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY
        }
      });
    }

    // Parse form data using formidable (more reliable)
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.image?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    if (!uploadedFile.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Please upload only image files' });
    }

    // Read file as buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    // Get folder from form data - allow empty folder for root directory
    const folder = fields.folder?.[0] !== undefined ? fields.folder[0] : '';

    // Build the folder path - handle empty folder for root directory  
    const folderPath = folder && folder.trim() !== '' ? `/bsm-gandhinagar/${folder}/` : '/bsm-gandhinagar/';

    console.log('📊 Uploading to ImageKit:', {
      filename: uploadedFile.originalFilename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      folderPath: folderPath
    });

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: `${folder || 'image'}-${Date.now()}-${uploadedFile.originalFilename}`,
      folder: folderPath,
      useUniqueFileName: true,
      transformation: {
        post: [
          {
            type: 'transformation',
            value: 'w-1200,h-800,c-at_max,q-80'
          }
        ]
      },
      tags: [folder || 'general', 'bsm-gandhinagar']
    });

    // Generate thumbnail for posts and root uploads
    let thumbnailResult = null;
    if (folder === 'posts' || folder === '') {
      const thumbnailPath = folder && folder.trim() !== '' ? `/bsm-gandhinagar/${folder}/thumbnails/` : '/bsm-gandhinagar/thumbnails/';
      
      thumbnailResult = await imagekit.upload({
        file: fileBuffer,
        fileName: `thumb-${Date.now()}-${uploadedFile.originalFilename}`,
        folder: thumbnailPath,
        useUniqueFileName: true,
        transformation: {
          post: [
            {
              type: 'transformation',
              value: 'w-400,h-250,c-maintain_ratio,q-70'
            }
          ]
        },
        tags: ['thumbnail', 'bsm-gandhinagar']
      });
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    const response = {
      success: true,
      imageUrl: result.url,
      fileId: result.fileId,
      imageName: result.name,
      size: result.size,
      width: result.width,
      height: result.height
    };

    // Add thumbnail data if created
    if (thumbnailResult) {
      response.thumbnailUrl = thumbnailResult.url;
      response.thumbnailId = thumbnailResult.fileId;
    }

    console.log('✅ Upload successful:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
}

// ImageKit Auth Handler
async function handleImageKitAuth(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// ImageKit List Files Handler
async function handleImageKitList(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { folder = '' } = req.query;
    
    console.log('📊 Listing ImageKit files for folder:', folder);
    
    // List files from ImageKit
    const searchOptions = {
      limit: 100,
      sort: 'DESC_CREATED' // Most recent first
    };
    
    // Only add path if folder is specified and not empty
    if (folder && folder.trim() !== '') {
      searchOptions.path = `/bsm-gandhinagar/${folder}/`;
    }
    // If folder is empty, search all images without path restriction
    
    console.log('📊 Searching ImageKit with options:', searchOptions);
    
    const result = await imagekit.listFiles(searchOptions);

    console.log('📊 ImageKit list result:', result.length, 'files found');

    // Filter out thumbnail files manually and transform the results
    const files = result
      .filter(file => !file.name.startsWith('thumb-')) // Filter out thumbnails
      .map(file => ({
        fileId: file.fileId,
        name: file.name,
        url: file.url,
        thumbnailUrl: file.url + '?tr=w-300,h-300,c-at_max,q-70', // Generate thumbnail on the fly
        size: file.size,
        width: file.width,
        height: file.height,
        filePath: file.filePath,
        tags: file.tags || [],
        createdAt: file.createdAt
      }));

    return res.status(200).json({
      success: true,
      files: files,
      total: files.length
    });

  } catch (error) {
    console.error('ImageKit list error:', error);
    return res.status(500).json({ 
      error: 'Failed to list images', 
      details: error.message 
    });
  }
}

// ImageKit Delete File Handler
async function handleImageKitDelete(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    console.log('📊 Deleting ImageKit file:', fileId);
    
    // Delete file from ImageKit
    const result = await imagekit.deleteFile(fileId);
    
    console.log('📊 ImageKit delete result:', result);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('ImageKit delete error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete image', 
      details: error.message 
    });
  }
}

// Export config for formidable to work with file uploads
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
