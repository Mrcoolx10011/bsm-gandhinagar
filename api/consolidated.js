const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const ImageKit = require('imagekit');
const fs = require('fs');

// Try to import formidable, but handle if it's not available
let formidable;
try {
  formidable = require('formidable');
} catch (error) {
  log('⚠️ Formidable not available, using custom parser');
}

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production');
  }
  return 'dev-only-insecure-secret-do-not-use-in-production';
})();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Debug environment variables (no credentials logged)
log('🔍 Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'SET' : 'MISSING',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'SET' : 'MISSING',
});

// Debug log helper — silent in production to avoid leaking data
const log = process.env.NODE_ENV !== 'production' ? console.log : () => {};

// Initialize ImageKit
log('🔑 ImageKit Environment Variables:', {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ? 'SET' : 'MISSING',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'SET' : 'MISSING',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ? 'SET' : 'MISSING'
});

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
});

// Initialize Razorpay
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

log('💳 Razorpay Environment Variables:', {
  keyId: RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
  keySecret: RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING'
});

// Try to import Razorpay SDK
let Razorpay;
try {
  Razorpay = require('razorpay');
  log('✅ Razorpay SDK loaded successfully');
} catch (error) {
  log('⚠️ Razorpay SDK not available:', error.message);
}

let cachedClient = null;
let isDevelopmentMode = false;

// Simple multipart form data parser
function parseMultipartFormData(body, boundary) {
  const fields = {};
  const files = {};

  // Split by boundary - include the boundary markers
  const fullBoundary = `--${boundary}`;
  const parts = body.split(fullBoundary);
  
  log('📊 Total boundary splits:', parts.length);

  for (let i = 1; i < parts.length - 1; i++) { // Skip first empty part and last closing part
    const part = parts[i];
    
    // Skip if part doesn't contain form data
    if (!part.includes('Content-Disposition: form-data')) continue;
    
    log(`📊 Processing part ${i}:`, part.substring(0, 300));
    
    // Find the double CRLF that separates headers from data
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) {
      log('📊 No header separator found');
      continue;
    }
    
    const headerSection = part.substring(0, headerEndIndex);
    const dataSection = part.substring(headerEndIndex + 4);
    
    // Remove trailing CRLF and boundary markers
    const cleanDataSection = dataSection.replace(/\r\n.*$/, '');
    
    log('📊 Headers section:', headerSection);
    log('📊 Data section length:', cleanDataSection.length);
    
    // Parse Content-Disposition header
    const dispositionMatch = headerSection.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
    if (!dispositionMatch) {
      log('📊 No valid Content-Disposition found');
      continue;
    }
    
    const name = dispositionMatch[1];
    const filename = dispositionMatch[2];
    
    // Parse Content-Type header
    const contentTypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
    const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : '';
    
    log('📊 Parsed:', { name, filename, contentType });
    
    if (filename) {
      // It's a file - use binary encoding for file data
      files[name] = {
        filename: filename,
        contentType: contentType,
        data: Buffer.from(cleanDataSection, 'binary')
      };
      log('📊 Added file:', name, 'size:', files[name].data.length);
    } else {
      // It's a regular field
      fields[name] = cleanDataSection.trim();
      log('📊 Added field:', name, '=', fields[name]);
    }
  }

  return { fields, files };
}

// ============================================
// IP DETECTION & USER AGENT PARSING
// ============================================

/**
 * Get client IP address from request headers
 */
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || 
         req.socket?.remoteAddress || 
         req.connection?.remoteAddress ||
         'Unknown';
}

/**
 * Parse User Agent to extract OS and Browser
 */
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return { os: 'Unknown', browser: 'Unknown' };
  }

  let os = 'Unknown';
  if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
  else if (userAgent.includes('Windows NT 11.0')) os = 'Windows 11';
  else if (userAgent.includes('Windows NT')) os = 'Windows';
  else if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('iPhone')) os = 'iOS (iPhone)';
  else if (userAgent.includes('iPad')) os = 'iOS (iPad)';
  else if (userAgent.includes('Android')) os = 'Android';

  let browser = 'Unknown';
  if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';
  // If still unknown, use a portion of the user agent
  else browser = userAgent.substring(0, 20);

  return { os, browser };
}

// ============================================
// SLACK NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send Slack notification for admin login
 */
async function sendSlackNotification(data) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('⚠️ SLACK_WEBHOOK_URL not configured - skipping notification');
    return;
  }

  try {
    const istTime = new Date(data.timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🔐 Admin Login',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Admin:*\n${data.email || data.username}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${istTime}`
            },
            {
              type: 'mrkdwn',
              text: `*IP Address:*\n${data.ip}`
            },
            {
              type: 'mrkdwn',
              text: `*Device:*\n${data.deviceInfo.os} - ${data.deviceInfo.browser}`
            }
          ]
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Status: ✅ Verified | User Agent: ${data.userAgent.substring(0, 50)}...`
            }
          ]
        }
      ]
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const result = await response.text();
    log('✅ Slack notification sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Slack notification failed:', error.message);
    // Don't throw - notification failure shouldn't break login
  }
}

// ============================================
// DONATION SLACK NOTIFICATION
// ============================================

/**
 * Send Slack notification for new donation
 */
async function sendDonationSlackNotification(data) {
  if (!SLACK_WEBHOOK_URL) {
    console.warn('⚠️ SLACK_WEBHOOK_URL not configured - skipping donation notification');
    return;
  }

  try {
    const istTime = new Date(data.timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '💰 New Donation Received',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Donor Name:*\n${data.name}`
            },
            {
              type: 'mrkdwn',
              text: `*Amount:*\n${data.currency}${data.amount.toLocaleString('en-IN')}`
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${data.email}`
            },
            {
              type: 'mrkdwn',
              text: `*Payment Method:*\n${data.paymentMethod}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${istTime}`
            },
            {
              type: 'mrkdwn',
              text: `*IP Address:*\n${data.ip}`
            }
          ]
        }
      ]
    };

    // Add message if provided
    if (data.message && data.message.trim()) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Message:*\n${data.message}`
        }
      });
    }

    // Add action button to view donation
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Status:* ⏳ Pending verification\n*ID:* ${data.donationId}`
      }
    });

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const result = await response.text();
    log('✅ Donation notification sent to Slack:', result);
    return result;
  } catch (error) {
    console.error('❌ Donation notification failed:', error.message);
    // Don't throw - notification failure shouldn't break donation process
  }
}

// ============================================
// DATABASE CONNECTION
// ============================================

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  // Check if MongoDB URI is properly configured
  log('🔍 Checking MongoDB URI:', MONGODB_URI ? 'URI provided' : 'URI missing');
  
  if (!MONGODB_URI || MONGODB_URI.includes('your-username') || MONGODB_URI.includes('your-password')) {
    log('⚠️  MongoDB not configured - running in development mode with mock data');
    log('⚠️  MONGODB_URI:', MONGODB_URI);
    isDevelopmentMode = true;
    return null;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    log('✅ Connected to MongoDB');
    return client;
  } catch (error) {
    log('⚠️  MongoDB connection failed - falling back to development mode:', error.message);
    isDevelopmentMode = true;
    return null;
  }
}

// In-memory login rate limiter (10 attempts per IP per 15 min)
const loginAttempts = new Map();

// Utility function to verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// CORS headers (restrict origin via ALLOWED_ORIGIN env var)
function setCorsHeaders(res) {
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  log('🚀 API Request:', {
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

  // Parse JSON body for POST/PUT requests (if not already parsed by dev server)
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']?.includes('application/json')) {
    try {
      // Check if body is already parsed by development server
      if (req.body && Object.keys(req.body).length > 0) {
        log('📥 Body already parsed by dev server:', req.body);
      } else {
        log('📥 Parsing JSON body manually...');
        let body = '';
        if (req.setEncoding && typeof req.setEncoding === 'function') {
          req.setEncoding('utf8');
        }
        req.on('data', chunk => {
          body += chunk;
        });
        
        await new Promise(resolve => {
          req.on('end', () => {
            try {
              if (body) {
                req.body = JSON.parse(body);
                log('📥 Parsed JSON body:', req.body);
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
      }
    } catch (error) {
      console.error('❌ Body parsing error:', error);
      req.body = {};
    }
  }

  const { endpoint } = req.query;
  log('🎯 Processing endpoint:', endpoint);
  log('🔍 About to enter switch statement for endpoint:', endpoint);
  
  try {
    const client = await connectToDatabase();
    const db = client ? client.db('bsm-gandhinagar') : null;
    
    log('💾 Database status:', {
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
      case 'razorpay-order':
        return await handleRazorpayCreateOrder(req, res);
      case 'razorpay-verify':
        return await handleRazorpayVerifyPayment(req, res, db);
      case 'razorpay-qrcode':
        return await handleRazorpayQRCode(req, res);
      case 'auth':
      case 'login':
        return await handleAuth(req, res, db);
      case 'members':
        return await handleMembers(req, res, db);
      case 'events':
        return await handleEvents(req, res, db);
      case 'registrations':
        return await handleRegistrations(req, res, db);
      case 'donations':
        return await handleDonations(req, res, db);
      case 'inquiries':
        return await handleInquiries(req, res, db);
      case 'posts':
        return await handlePosts(req, res, db);
      case 'campaigns':
        return await handleCampaigns(req, res, db);
      case 'admin':
        log('🎯 Processing endpoint: admin (entering case)');
        log('🔍 Admin handler debug:', { method: req.method, hasBody: !!req.body, bodyKeys: Object.keys(req.body || {}) });
        try {
          const result = await handleAdmin(req, res, db);
          log('✅ Admin handler completed successfully');
          return result;
        } catch (adminError) {
          console.error('❌ Admin handler error:', adminError);
          return res.status(500).json({ error: 'Admin handler failed', details: adminError.message });
        }
      case 'recent-activities':
        return await handleRecentActivities(req, res, db);
      case 'content':
        return await handleContent(req, res, db);
      case 'send-email-with-pdf':
        return await handleSendEmailWithPDF(req, res);
      case 'upload-pdf-to-imagekit':
        return await handleUploadPDFToImageKit(req, res);
      case 'hello':
        return res.status(200).json({ message: 'Hello from BSM Gandhinagar API!' });
      case 'health':
        if (db) {
          const collections = await db.listCollections().toArray();
          log('📋 Available collections:', collections.map(c => c.name));
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
        // Removed: this endpoint leaked infrastructure info publicly
        return res.status(404).json({ error: 'Endpoint not found' });
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
  log('👥 handleMembers called with:', {
    method: req.method,
    query: req.query,
    hasDb: !!db,
    isDevelopmentMode
  });

  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    log('🔄 Redirecting to development mode handler');
    return handleMembersDevelopmentMode(req, res);
  }

  try {
    const collection = db.collection('members');

    switch (req.method) {
      case 'GET':
        log('🔍 Fetching members from database...');
        const members = await collection.find({}).toArray();
        log(`📊 Found ${members.length} members in database`);
        if (members.length > 0) {
          log('📋 Sample member:', JSON.stringify(members[0], null, 2));
        }
        return res.status(200).json(members);

      case 'POST':
        log('🆕 Creating new member:', req.body);
        const newMember = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newMember);
        log('✅ Member created successfully:', result.insertedId);
        return res.status(201).json({ _id: result.insertedId, ...newMember });

      case 'PUT':
        const { id } = req.query;
        log('✏️  Updating member:', { id, data: req.body });
        
        if (!id) {
          return res.status(400).json({ error: 'Member ID is required' });
        }
        
        // Remove immutable fields that shouldn't be updated
        const { _id, id: idField, createdAt, ...updateFields } = req.body;
        const updateData = {
          ...updateFields,
          updatedAt: new Date()
        };
        
        log('🔧 Cleaned update data:', updateData);
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Member not found' });
        }
        
        log('✅ Member updated successfully');
        return res.status(200).json({ message: 'Member updated successfully' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        log('🗑️ Deleting member:', deleteId);
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Member ID is required' });
        }
        
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Member not found' });
        }
        
        log('✅ Member deleted successfully');
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
  log('👥 Running members in development mode');

  switch (req.method) {
    case 'GET':
      log('🔍 Returning mock members data');
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
      log('🆕 Created mock member:', newMember);
      return res.status(201).json(newMember);

    case 'PUT':
      const { id: updateId } = req.query;
      log('✏️  Attempting to update member with ID:', updateId);
      
      if (!updateId) {
        log('❌ No ID provided for update');
        return res.status(400).json({ error: 'Member ID is required' });
      }
      
      log('✅ Accepting update for any ID in development mode');
      log('📝 Update data:', req.body);
      
      return res.status(200).json({ 
        message: 'Member updated successfully (development mode)',
        id: updateId,
        data: req.body
      });

    case 'DELETE':
      const { id: deleteId } = req.query;
      log('🗑️ Attempting to delete member with ID:', deleteId);
      
      if (!deleteId) {
        log('❌ No ID provided for deletion');
        return res.status(400).json({ error: 'Member ID is required' });
      }
      
      log('✅ Accepting deletion for any ID in development mode');
      
      return res.status(200).json({ 
        message: 'Member deleted successfully (development mode)',
        id: deleteId
      });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Registrations Handler
async function handleRegistrations(req, res, db) {
  log('📋 handleRegistrations called:', req.query);

  try {
    const { eventId } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Development mode - return mock data
    if (!db || isDevelopmentMode) {
      log('🔄 Development mode - returning mock registrations');
      return res.status(200).json([
        {
          _id: '1',
          registrationId: 'BSM/2025/REG0001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          numberOfAttendees: 2,
          status: 'confirmed',
          registeredAt: new Date().toISOString(),
          confirmationSent: true
        },
        {
          _id: '2',
          registrationId: 'BSM/2025/REG0002',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '0987654321',
          numberOfAttendees: 1,
          status: 'confirmed',
          registeredAt: new Date().toISOString(),
          confirmationSent: false
        }
      ]);
    }

    // Production mode with database
    const registrationsCollection = db.collection('event_registrations');
    const registrations = await registrationsCollection
      .find({ eventId })
      .sort({ registeredAt: -1 })
      .toArray();

    log(`✅ Found ${registrations.length} registrations for event ${eventId}`);
    return res.status(200).json(registrations);

  } catch (error) {
    console.error('❌ Registrations Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    });
  }
}

// Event Registration Handler
async function handleEventRegistration(req, res, db) {
  log('📝 handleEventRegistration called:', req.body);

  try {
    const { eventId, name, email, phone, numberOfAttendees, recaptchaToken } = req.body;

    // Validation
    if (!eventId || !name || !email || !phone || !numberOfAttendees) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify reCAPTCHA token
    if (recaptchaToken) {
      try {
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        const recaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
          { method: 'POST' }
        );
        const recaptchaData = await recaptchaResponse.json();
        
        log('🤖 reCAPTCHA verification:', recaptchaData);

        if (!recaptchaData.success || recaptchaData.score < 0.5) {
          return res.status(400).json({
            success: false,
            message: 'Bot detection failed. Please try again.'
          });
        }
      } catch (recaptchaError) {
        console.error('❌ reCAPTCHA verification error:', recaptchaError);
        // Continue without reCAPTCHA in development
        if (!isDevelopmentMode) {
          return res.status(400).json({
            success: false,
            message: 'Security verification failed'
          });
        }
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 10 digits'
      });
    }

    // Number validation
    if (numberOfAttendees < 1 || numberOfAttendees > 10) {
      return res.status(400).json({
        success: false,
        message: 'Number of attendees must be between 1 and 10'
      });
    }

    // Development mode - simulate registration
    if (!db || isDevelopmentMode) {
      log('🔄 Development mode - simulating registration');
      const registrationId = `BSM/2025/REG${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      log('✅ Registration simulated:', registrationId);
      return res.status(200).json({
        success: true,
        registrationId,
        message: 'Registration successful (development mode)',
        data: {
          eventId,
          name,
          email,
          numberOfAttendees
        }
      });
    }

    // Production mode with database
    const eventsCollection = db.collection('events');
    const registrationsCollection = db.collection('event_registrations');

    // Check if event exists
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check capacity
    const spotsLeft = event.maxAttendees - event.attendees;
    if (spotsLeft < numberOfAttendees) {
      return res.status(400).json({
        success: false,
        message: `Only ${spotsLeft} spots available`
      });
    }

    // Check for duplicate registration
    const existingRegistration = await registrationsCollection.findOne({
      eventId,
      email: email.toLowerCase()
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event'
      });
    }

    // Generate registration ID
    const count = await registrationsCollection.countDocuments({});
    const registrationId = `BSM/2025/REG${String(count + 1).padStart(4, '0')}`;

    // Create registration
    const registration = {
      eventId,
      registrationId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      numberOfAttendees,
      status: 'confirmed',
      registeredAt: new Date(),
      confirmationSent: false
    };

    await registrationsCollection.insertOne(registration);

    // Update event attendee count
    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { 
        $inc: { attendees: numberOfAttendees },
        $set: { updatedAt: new Date() }
      }
    );

    log('✅ Registration successful:', registrationId);

    // TODO: Send confirmation email via EmailJS (disabled for now)
    // await sendConfirmationEmail(registration, event);

    return res.status(200).json({
      success: true,
      registrationId,
      message: 'Registration successful! Confirmation email will be sent shortly.',
      data: {
        name,
        email,
        numberOfAttendees
      }
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process registration. Please try again.',
      error: error.message
    });
  }
}

// Events API Handler
async function handleEvents(req, res, db) {
  log('🎯 handleEvents called with:', {
    method: req.method,
    query: req.query,
    hasDb: !!db,
    isDevelopmentMode
  });

  const { action } = req.query;

  // Handle registration action
  if (action === 'register' && req.method === 'POST') {
    return handleEventRegistration(req, res, db);
  }

  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    log('🔄 Redirecting to development mode handler');
    return handleEventsDevelopmentMode(req, res);
  }

  try {
    const collection = db.collection('events');

    switch (req.method) {
      case 'GET':
        log('🔍 Fetching events from database...');
        const events = await collection.find({}).sort({ date: -1 }).toArray();
        log(`📊 Found ${events.length} events in database`);
        return res.status(200).json(events);

      case 'POST':
        log('🆕 Creating new event:', req.body);
        const newEvent = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const result = await collection.insertOne(newEvent);
        log('✅ Event created successfully:', result.insertedId);
        return res.status(201).json({ _id: result.insertedId, ...newEvent });

      case 'PUT':
        const { id } = req.query;
        log('✏️  Updating event:', { id, data: req.body });
        
        if (!id) {
          return res.status(400).json({ error: 'Event ID is required' });
        }
        
        // Remove immutable fields that shouldn't be updated
        const { _id, id: idField, createdAt, ...updateFields } = req.body;
        const updateData = {
          ...updateFields,
          updatedAt: new Date()
        };
        
        log('🔧 Cleaned update data:', updateData);
        
        const updateResult = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        log('✅ Event updated successfully');
        return res.status(200).json({ message: 'Event updated successfully' });

      case 'DELETE':
        const { id: deleteId } = req.query;
        log('🗑️ Deleting event:', deleteId);
        
        if (!deleteId) {
          return res.status(400).json({ error: 'Event ID is required' });
        }
        
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ error: 'Event not found' });
        }
        
        log('✅ Event deleted successfully');
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
  log('🔧 Running events in development mode');
  log('🔧 Request method:', req.method);
  log('🔧 Request query:', req.query);
  log('🔧 Request body:', req.body);
  
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
      log('📋 Returning mock events:', mockEvents.length);
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
      log('🆕 Created mock event:', newEvent);
      return res.status(201).json(newEvent);

    case 'PUT':
      const { id: updateId } = req.query;
      log('✏️  Attempting to update event with ID:', updateId);
      
      if (!updateId) {
        log('❌ No ID provided for update');
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // In development mode, we'll accept any ID format and just return success
      // This handles both mock IDs and real MongoDB ObjectIds
      log('✅ Accepting update for any ID in development mode');
      log('📝 Update data:', req.body);
      
      const updatedEvent = { 
        _id: updateId,
        id: updateId,
        ...req.body, 
        updatedAt: new Date() 
      };
      log('✅ Mock event updated successfully');
      return res.status(200).json({ message: 'Event updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      log('🗑️  Attempting to delete event with ID:', deleteId);
      
      if (!deleteId) {
        log('❌ No ID provided for delete');
        return res.status(400).json({ error: 'Event ID is required' });
      }
      
      // In development mode, we'll accept any ID format and just return success
      log('✅ Accepting delete for any ID in development mode');
      log('✅ Mock event deleted successfully');
      return res.status(200).json({ message: 'Event deleted successfully' });

    default:
      log('❌ Method not allowed:', req.method);
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
      
      // Send Slack notification for new donation
      try {
        log('💰 New donation received, sending Slack notification...');
        sendDonationSlackNotification({
          donationId: result.insertedId,
          name: newDonation.name || 'Anonymous',
          email: newDonation.email || 'Not provided',
          amount: newDonation.amount || 0,
          currency: newDonation.currency || '₹',
          message: newDonation.message || '',
          paymentMethod: newDonation.paymentMethod || 'Unknown',
          ip: getClientIP(req),
          timestamp: newDonation.createdAt
        }).catch(err => console.error('❌ Donation notification error:', err));
        
        log('✅ Donation notification queued');
      } catch (notifError) {
        console.error('❌ Failed to queue donation notification:', notifError);
        // Continue with response even if Slack fails
      }
      
      return res.status(201).json({ _id: result.insertedId, ...newDonation });

    case 'PUT':
      const { id: updateId } = req.query;
      
      if (!updateId) {
        console.error('❌ No ID provided for update');
        return res.status(400).json({ error: 'Donation ID is required' });
      }
      
      log('📝 Updating donation:', updateId);
      
      let objectId;
      try {
        objectId = new ObjectId(updateId);
      } catch (error) {
        console.error('❌ Invalid ObjectId format:', updateId);
        return res.status(400).json({ error: 'Invalid donation ID format' });
      }
      
      const updateData = { ...req.body, updatedAt: new Date() };
      log('📝 Update data:', updateData);
      
      const updateResult = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      log('📝 Update result:', { matchedCount: updateResult.matchedCount, modifiedCount: updateResult.modifiedCount });
      
      if (updateResult.matchedCount === 0) {
        console.error('❌ Donation not found:', updateId);
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      const updatedDonation = await collection.findOne({ _id: objectId });
      log('✅ Donation updated successfully');
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
  log('🔧 Running donations in development mode');
  
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
      log('🆕 Created mock donation:', newDonation);
      return res.status(201).json(newDonation);

    case 'PUT':
      const { id: updateId } = req.query;
      const donation = mockDonations.find(d => d._id === updateId || d.id === updateId);
      
      if (!donation) {
        return res.status(404).json({ error: 'Donation not found' });
      }
      
      const updatedDonation = { ...donation, ...req.body, updatedAt: new Date() };
      log('✏️  Updated mock donation:', updatedDonation);
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
      
      log('🗑️ Deleted mock donation:', deleteId);
      return res.status(200).json({ message: 'Donation deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Inquiries API Handler
async function handleInquiries(req, res, db) {
  // Handle development mode when database is not available
  if (!db || isDevelopmentMode) {
    return handleInquiriesDevelopmentMode(req, res);
  }

  const collection = db.collection('inquiries');

  switch (req.method) {
    case 'GET':
      const inquiries = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(inquiries);

    case 'POST':
      const newInquiry = {
        ...req.body,
        createdAt: new Date(),
        status: 'new',
        priority: req.body.priority || 'medium'
      };
      const result = await collection.insertOne(newInquiry);
      return res.status(201).json({ _id: result.insertedId, ...newInquiry });

    case 'PUT':
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Inquiry ID is required' });
      }
      
      // Remove immutable fields that shouldn't be updated
      const { _id, id: idField, createdAt, ...updateFields } = req.body;
      const updateData = {
        ...updateFields,
        updatedAt: new Date()
      };
      
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
      
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }
      
      return res.status(200).json({ message: 'Inquiry updated successfully' });

    case 'DELETE':
      const { id: deleteId } = req.query;
      if (!deleteId) {
        return res.status(400).json({ error: 'Inquiry ID is required' });
      }
      
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(deleteId) });
      
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }
      
      return res.status(200).json({ message: 'Inquiry deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Development mode handler for inquiries
function handleInquiriesDevelopmentMode(req, res) {
  log('🔧 Running inquiries in development mode');
  
  // Mock data for development
  const mockInquiries = [
    {
      _id: '66c123456789012345678901',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91-9876543210',
      subject: 'General Inquiry',
      message: 'I would like to know more about your organization.',
      status: 'new',
      priority: 'medium',
      createdAt: new Date('2024-08-15'),
      updatedAt: new Date('2024-08-15')
    },
    {
      _id: '66c123456789012345678902',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91-9876543211',
      subject: 'Volunteer Opportunities',
      message: 'I am interested in volunteering for your events.',
      status: 'responded',
      priority: 'high',
      createdAt: new Date('2024-08-14'),
      updatedAt: new Date('2024-08-16')
    }
  ];

  switch (req.method) {
    case 'GET':
      log('📋 Returning mock inquiries:', mockInquiries.length);
      return res.status(200).json(mockInquiries);

    case 'POST':
      const newId = Date.now().toString();
      const newInquiry = {
        _id: newId,
        ...req.body,
        createdAt: new Date(),
        status: 'new',
        priority: req.body.priority || 'medium'
      };
      log('🆕 Created mock inquiry:', newInquiry);
      return res.status(201).json(newInquiry);

    case 'PUT':
      const { id: updateId } = req.query;
      log('✏️  Attempting to update inquiry with ID:', updateId);
      
      if (!updateId) {
        return res.status(400).json({ error: 'Inquiry ID is required' });
      }
      
      log('✅ Accepting update for any ID in development mode');
      log('📝 Update data:', req.body);
      
      return res.status(200).json({ 
        message: 'Inquiry updated successfully (development mode)',
        id: updateId,
        data: req.body
      });

    case 'DELETE':
      const { id: deleteId } = req.query;
      log('🗑️ Attempting to delete inquiry with ID:', deleteId);
      
      if (!deleteId) {
        return res.status(400).json({ error: 'Inquiry ID is required' });
      }
      
      log('✅ Accepting deletion for any ID in development mode');
      
      return res.status(200).json({ 
        message: 'Inquiry deleted successfully (development mode)',
        id: deleteId
      });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Posts API Handler
async function handlePosts(req, res, db) {
  // Dev-mode guard (matches pattern of all other handlers)
  if (!db || isDevelopmentMode) {
    return handlePostsDevelopmentMode(req, res);
  }

  // Require authentication for all mutating operations
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    // Skip auth for public actions (like/view are lightweight public interactions)
    const isPublicAction = req.query.action === 'like' || req.query.action === 'view';
    if (!isPublicAction) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!verifyToken(token)) {
        return res.status(401).json({ error: 'Authentication required' });
      }
    }
  }

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

// Development mode handler for posts
function handlePostsDevelopmentMode(req, res) {
  log('📝 Running posts in development mode');
  const mockPosts = [
    {
      _id: 'post-1',
      title: 'Welcome to BSM Gandhinagar',
      content: 'This is a sample post in development mode.',
      author: 'Admin',
      category: 'General',
      tags: ['welcome', 'bsm'],
      likes: 5,
      views: 42,
      status: 'published',
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date('2024-08-01')
    }
  ];

  switch (req.method) {
    case 'GET':
      return res.status(200).json(mockPosts);
    case 'POST':
      const newPost = { _id: `post-${Date.now()}`, ...req.body, likes: 0, views: 0, createdAt: new Date(), updatedAt: new Date() };
      return res.status(201).json(newPost);
    case 'PUT':
      return res.status(200).json({ message: 'Post updated successfully (development mode)' });
    case 'DELETE':
      return res.status(200).json({ message: 'Post deleted successfully (development mode)' });
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

  // Require authentication for all mutating operations
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Authentication required' });
    }
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
  log('🔧 Running campaigns in development mode');
  
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
      log('🆕 Created mock campaign:', newCampaign);
      return res.status(201).json(newCampaign);

    case 'PUT':
      const { id: updateId } = req.query;
      const campaign = mockCampaigns.find(c => c._id === updateId || c.id === updateId);
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      const updatedCampaign = { ...campaign, ...req.body, updatedAt: new Date() };
      log('✏️  Updated mock campaign:', updatedCampaign);
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
      
      log('🗑️ Deleted mock campaign:', deleteId);
      return res.status(200).json({ message: 'Campaign deleted successfully' });

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Auth API Handler (dedicated authentication endpoint)
async function handleAuth(req, res, db) {
  log('🔐 Auth request:', {
    method: req.method,
    endpoint: req.query.endpoint,
    action: req.query.action,
    body: req.body
  });

  // Handle admin login
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Rate limiting: max 10 attempts per IP per 15 minutes
    const ip = getClientIP(req);
    const now = Date.now();
    const window = 15 * 60 * 1000; // 15 minutes
    const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + window };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + window;
    }
    if (entry.count >= 10) {
      return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
    }
    entry.count++;
    loginAttempts.set(ip, entry);

    log('🔑 Login attempt:', { username, hasPassword: !!password });

    // Backward-compatible password check: supports plain text or bcrypt hash in env var
    const isBcryptHash = ADMIN_PASSWORD.startsWith('$2a$') || ADMIN_PASSWORD.startsWith('$2b$');
    const passwordMatch = isBcryptHash
      ? bcrypt.compareSync(password, ADMIN_PASSWORD)
      : password === ADMIN_PASSWORD;

    if (username === ADMIN_USERNAME && passwordMatch) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      log('✅ Login successful for:', username);
      
      // Send Slack notification (fire & forget - don't block login)
      try {
        log('📤 Attempting to send Slack notification...');
        log('🔍 SLACK_WEBHOOK_URL configured:', SLACK_WEBHOOK_URL ? '✅ YES' : '❌ NO');
        
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);
        
        log('📊 Login data:', { ip, deviceInfo, userAgent: userAgent.substring(0, 50) });
        
        sendSlackNotification({
          email: 'admin@bsmgandhinagar.org',
          username: username,
          ip: ip,
          deviceInfo: deviceInfo,
          userAgent: userAgent,
          timestamp: new Date()
        }).catch(err => console.error('❌ Slack notification error:', err));
        
        log('✅ Slack notification function called');
        
      } catch (notifError) {
        console.error('❌ Failed to send Slack notification:', notifError);
        // Continue with login even if Slack fails
      }
      
      return res.status(200).json({ 
        token, 
        user: { 
          username, 
          role: 'admin',
          email: 'admin@bsmgandhinagar.org'
        } 
      });
    } else {
      log('❌ Invalid credentials');
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
  log('🔐 handleAdmin called:', {
    method: req.method,
    query: req.query,
    body: req.body,
    hasAction: req.body?.action === 'login' || req.query.action === 'login'
  });

  // Handle admin login - check for login in the endpoint or body
  if (req.method === 'POST' && (req.query.action === 'login' || req.body?.action === 'login' || req.url?.includes('/login'))) {
    const { username, password } = req.body;
    
    log('🔑 Credential comparison:', {
      received: { username, password },
      expected: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
      usernameMatch: username === ADMIN_USERNAME,
      passwordMatch: password === ADMIN_PASSWORD,
      envVars: {
        ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
      }
    });
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      log('✅ Admin login successful');
      
      // Send Slack notification (fire & forget - don't block login)
      try {
        log('📡 Attempting to send Slack notification...');
        log('🔍 SLACK_WEBHOOK_URL configured:', SLACK_WEBHOOK_URL ? '✅ YES' : '❌ NO');
        
        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const deviceInfo = parseUserAgent(userAgent);
        
        log('📊 Login data:', { ip, deviceInfo, userAgent: userAgent.substring(0, 50) });
        
        sendSlackNotification({
          email: 'admin@bsmgandhinagar.org',
          username: username,
          ip: ip,
          deviceInfo: deviceInfo,
          userAgent: userAgent,
          timestamp: new Date()
        }).catch(err => console.error('❌ Slack notification error:', err));
        
        log('✅ Slack notification function called');
        
      } catch (notifError) {
        console.error('❌ Failed to send Slack notification:', notifError);
        // Continue with login even if Slack fails
      }
      
      return res.status(200).json({ token, user: { username, role: 'admin' } });
    } else {
      log('❌ Admin login failed - credential mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  // Check if this is a public admin stats request
  const { type } = req.query;
  
  // For dashboard stats, allow public access temporarily
  if (req.method === 'GET' && type) {
    log(`📊 Public admin stats request for: ${type}`);
    
    switch (type) {
      case 'posts':
        const posts = await db.collection('posts').find({}).toArray();
        log(`📝 Found ${posts.length} posts`);
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
  log('🔐 Admin request headers:', req.headers);
  const token = req.headers?.authorization?.replace('Bearer ', '');
  log('🔑 Token extracted:', token ? 'Present' : 'Missing');
  const decoded = verifyToken(token);
  
  if (!decoded) {
    log('❌ Admin authentication failed');
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

// ImageKit Upload Handler (Works in both Local and Vercel)
async function handleImageUpload(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    log('📊 Upload request received');
    log('📊 Environment:', { 
      isVercel: !!process.env.VERCEL,
      hasFormidable: !!formidable,
      nodeEnv: process.env.NODE_ENV 
    });
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error('❌ Missing ImageKit environment variables');
      return res.status(500).json({ 
        error: 'ImageKit not configured',
        envCheck: {
          hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
          hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY
        }
      });
    }

    let uploadedFile = null;
    let folder = '';

    // Try formidable first (for local development), but only if not pre-parsed
    if (formidable && !process.env.VERCEL && !req.rawBody) {
      log('📊 Using formidable for local development');
      try {
        const form = formidable({
          maxFileSize: 10 * 1024 * 1024, // 10MB limit
        });

        const [fields, files] = await form.parse(req);
        const file = files.image?.[0];
        folder = fields.folder?.[0] || '';

        if (!file) {
          return res.status(400).json({ error: 'No image file provided' });
        }

        // Validate file type
        if (!file.mimetype?.startsWith('image/')) {
          return res.status(400).json({ error: 'Please upload only image files' });
        }

        // Read file as buffer
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Convert to our standard format
        uploadedFile = {
          filename: file.originalFilename,
          contentType: file.mimetype,
          data: fileBuffer,
          size: file.size
        };

        // Clean up temp file
        fs.unlinkSync(file.filepath);

      } catch (formidableError) {
        log('⚠️ Formidable failed, falling back to custom parser:', formidableError.message);
        uploadedFile = null;
      }
    }

    // If formidable failed or we're on Vercel, use custom parser
    if (!uploadedFile) {
      log('📊 Using custom multipart parser');
      
      const contentType = req.headers['content-type'] || '';
      
      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Expected multipart/form-data' });
      }

      // Extract boundary from content-type
      const boundary = contentType.split('boundary=')[1];
      if (!boundary) {
        return res.status(400).json({ error: 'Missing boundary in multipart data' });
      }

      // Read raw body data
      let rawBody = '';
      
      // Handle different ways to read the body
      if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
        // Our development server provides rawBody for multipart uploads
        rawBody = req.rawBody.toString('binary');
        log('📊 Using rawBody from development server');
      } else if (req.body && typeof req.body === 'string') {
        rawBody = req.body;
      } else if (req.body && Buffer.isBuffer(req.body)) {
        rawBody = req.body.toString('binary');
      } else {
        // Fallback for other environments that support streaming
        const chunks = [];
        try {
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          rawBody = Buffer.concat(chunks).toString('binary');
        } catch (streamError) {
          log('⚠️ Stream reading failed:', streamError.message);
          return res.status(400).json({ error: 'Could not read request body' });
        }
      }

      log('📊 Raw body length:', rawBody.length);

      // Parse multipart form data
      const { fields, files } = parseMultipartFormData(rawBody, boundary);
      
      uploadedFile = files.image;
      folder = fields.folder || '';

      if (!uploadedFile) {
        log('❌ No image file found in:', Object.keys(files));
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Validate file type
      if (!uploadedFile.contentType?.startsWith('image/')) {
        return res.status(400).json({ error: 'Please upload only image files' });
      }
    }

    // Build the folder path
    const folderPath = folder && folder.trim() !== '' ? `/bsm-gandhinagar/${folder}/` : '/bsm-gandhinagar/';

    log('📊 Uploading to ImageKit:', {
      filename: uploadedFile.filename,
      contentType: uploadedFile.contentType,
      size: uploadedFile.data.length,
      folderPath: folderPath
    });

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: uploadedFile.data,
      fileName: `${folder || 'image'}-${Date.now()}-${uploadedFile.filename}`,
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

    log('✅ ImageKit upload result:', {
      fileId: result.fileId,
      url: result.url,
      name: result.name,
      size: result.size
    });

    // Generate thumbnail for posts and root uploads
    let thumbnailResult = null;
    if (folder === 'posts' || folder === '') {
      const thumbnailPath = folder && folder.trim() !== '' ? `/bsm-gandhinagar/${folder}/thumbnails/` : '/bsm-gandhinagar/thumbnails/';
      
      try {
        thumbnailResult = await imagekit.upload({
          file: uploadedFile.data,
          fileName: `thumb-${Date.now()}-${uploadedFile.filename}`,
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
        log('✅ Thumbnail created:', thumbnailResult.url);
      } catch (thumbError) {
        log('⚠️ Thumbnail creation failed:', thumbError.message);
        // Continue without thumbnail
      }
    }

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

    log('✅ Upload successful:', response);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message,
      stack: error.stack
    });
  }
}

// Parse multipart form data manually (Vercel and custom dev server compatible)
function parseMultipartFormData(body, boundary) {
  const fields = {};
  const files = {};

  // Split by boundary
  const boundaryMarker = `--${boundary}`;
  const parts = body.split(boundaryMarker);

  for (const part of parts) {
    if (!part.trim() || part === '--\r\n' || part === '--') continue;

    // Find the double newline that separates headers from content
    const headerEndIndex = part.indexOf('\r\n\r\n');
    if (headerEndIndex === -1) continue;

    const headerSection = part.substring(0, headerEndIndex);
    const contentSection = part.substring(headerEndIndex + 4);

    // Parse headers
    const headers = {};
    const headerLines = headerSection.split('\r\n');
    
    for (const line of headerLines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':').map(s => s.trim());
        headers[key.toLowerCase()] = value;
      }
    }

    // Parse Content-Disposition header
    const contentDisposition = headers['content-disposition'];
    if (!contentDisposition) continue;

    // Extract field name
    const nameMatch = contentDisposition.match(/name="([^"]+)"/);
    if (!nameMatch) continue;
    
    const fieldName = nameMatch[1];
    
    // Check if it's a file upload
    const filenameMatch = contentDisposition.match(/filename="([^"]*)"/);
    
    if (filenameMatch) {
      // This is a file field
      const filename = filenameMatch[1];
      const contentType = headers['content-type'] || 'application/octet-stream';
      
      // Remove the final \r\n from content
      let fileContent = contentSection;
      if (fileContent.endsWith('\r\n')) {
        fileContent = fileContent.slice(0, -2);
      }
      
      // Convert binary string to Buffer
      const buffer = Buffer.from(fileContent, 'binary');
      
      files[fieldName] = {
        filename: filename,
        contentType: contentType,
        data: buffer,
        size: buffer.length
      };
    } else {
      // This is a regular form field
      let fieldValue = contentSection;
      if (fieldValue.endsWith('\r\n')) {
        fieldValue = fieldValue.slice(0, -2);
      }
      fields[fieldName] = fieldValue;
    }
  }

  return { fields, files };
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
    
    log('📊 Listing ImageKit files for folder:', folder);
    
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
    
    log('📊 Searching ImageKit with options:', searchOptions);
    
    const result = await imagekit.listFiles(searchOptions);

    log('📊 ImageKit list result:', result.length, 'files found');

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

    log('📊 Deleting ImageKit file:', fileId);
    
    // Delete file from ImageKit
    const result = await imagekit.deleteFile(fileId);
    
    log('📊 ImageKit delete result:', result);

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

// ==================== RAZORPAY HANDLERS ====================

/**
 * Create Razorpay Order
 * Creates an order for payment processing
 */
async function handleRazorpayCreateOrder(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if Razorpay is configured
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to environment variables.' 
      });
    }

    if (!Razorpay) {
      console.error('❌ Razorpay SDK not loaded');
      return res.status(500).json({ 
        success: false,
        error: 'Razorpay SDK not available. Please install: npm install razorpay' 
      });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid amount is required' 
      });
    }

    log('💳 Creating Razorpay order:', { amount, currency });

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    // Create order options
    const options = {
      amount: amount * 100, // Amount in paise (smallest currency unit)
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        created_at: new Date().toISOString(),
      },
    };

    // Create order
    const order = await razorpay.orders.create(options);

    log('✅ Razorpay order created:', order.id);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });

  } catch (error) {
    console.error('❌ Razorpay order creation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create order', 
      details: error.message 
    });
  }
}

/**
 * Verify Razorpay Payment
 * Verifies payment signature and saves donation
 */
async function handleRazorpayVerifyPayment(req, res, db) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      donationData 
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing payment verification data' 
      });
    }

    log('🔐 Verifying Razorpay payment:', razorpay_payment_id);

    // Verify signature using crypto
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      return res.status(400).json({ 
        success: false,
        error: 'Payment verification failed' 
      });
    }

    log('✅ Payment signature verified');

    // Save donation to database if donation data provided
    if (donationData && db) {
      const collection = db.collection('donations');
      
      const donation = {
        ...donationData,
        razorpay_payment_id,
        razorpay_order_id,
        transactionId: razorpay_payment_id, // Store payment ID as transaction ID for admin panel
        status: 'completed',
        approved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(donation);
      log('💾 Donation saved to database:', result.insertedId);

      return res.status(200).json({
        success: true,
        message: 'Payment verified and donation saved',
        donationId: result.insertedId,
        paymentId: razorpay_payment_id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Payment verification failed', 
      details: error.message 
    });
  }
}

/**
 * Generate UPI Payment String for QR Code
 * Since Razorpay test accounts don't support QR Code API or Payment Links,
 * we generate a UPI intent string that the frontend will convert to QR code
 */
async function handleRazorpayQRCode(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, orderId, customerName } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid amount is required' 
      });
    }

    log('📱 Generating UPI payment string for QR:', { amount, orderId });

    // BHIM requires strict UPI QR format
    const upiId = process.env.UPI_ID || 'test@razorpay';
    const merchantName = process.env.UPI_MERCHANT_NAME || 'BSM Gandhinagar';
    const transactionNote = orderId || 'Donation';
    
    log('🔑 UPI ID being used:', upiId);
    log('🏪 Merchant Name:', merchantName);
    log('💰 Amount:', amount);
    
    // Validate UPI ID format
    if (!upiId.includes('@')) {
      console.error('❌ Invalid UPI ID format:', upiId);
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI ID format. Must be like: name@paytm, name@ybl, etc.'
      });
    }
    
    // BHIM-compliant UPI QR format (without special characters in note)
    // Format: upi://pay?pa=VPA&pn=Name&am=Amount&cu=Currency&tn=Note
    const cleanMerchantName = merchantName.replace(/[^a-zA-Z0-9\s]/g, '');
    const cleanNote = transactionNote.replace(/[^a-zA-Z0-9\s]/g, '');
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${cleanMerchantName}&am=${amount}&cu=INR&tn=${cleanNote}`;
    
    log('🔗 Generated UPI URL:', upiUrl);
    
    // Generate unique ID for this QR code
    const qrCodeId = `upi_qr_${Date.now()}`;
    
    log('✅ UPI payment string generated:', qrCodeId);

    return res.status(200).json({
      success: true,
      qrCodeId,
      qrCodeUrl: upiUrl, // Frontend will convert this to QR code image
      qrCodeData: upiUrl,
      amount: amount * 100,
      currency: 'INR',
      status: 'active',
      expiresAt: Math.floor(Date.now() / 1000) + (30 * 60), // 30 min expiry
      paymentMethod: 'upi',
      merchantName,
      upiId,
      note: transactionNote,
    });

  } catch (error) {
    console.error('❌ QR code generation error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to generate payment QR code', 
      details: error.message 
    });
  }
}

// Email with PDF attachment handler
async function handleSendEmailWithPDF(req, res) {
  log('📧 Processing email with PDF attachment request');
  
  try {
    const nodemailer = require('nodemailer');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { donorEmail, donorName, amount, campaign, pdfBase64, receiptData } = req.body;
    
    if (!donorEmail || !donorName || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    log('📧 Email request details:', {
      donorEmail,
      donorName,
      amount,
      campaign,
      hasPDF: !!pdfBase64
    });

    // Create a test transporter (for development - replace with real SMTP in production)
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com', // Add to .env.local
        pass: process.env.SMTP_PASS || 'your-app-password'     // Add to .env.local
      },
    });

    // Convert base64 to buffer for attachment
    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');
    const fileName = `BSM_Receipt_${receiptData.receiptNo}_${donorName.replace(/\s+/g, '_')}.pdf`;

    // Upload PDF to ImageKit for permanent public URL
    let downloadLinkHtml = '';
    let uploadResponse = null;
    try {
      log('📤 Uploading PDF to ImageKit...');
      
      uploadResponse = await imagekit.upload({
        file: pdfBuffer,
        fileName: fileName,
        folder: '/bsm-gandhinagar/receipts/',
        useUniqueFileName: true,
        tags: ['receipt', 'donation', receiptData.receiptNo]
      });

      log('✅ PDF uploaded to ImageKit:', uploadResponse.url);
      
      // Create download link HTML
      downloadLinkHtml = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${uploadResponse.url}" target="_blank" 
             style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;display:inline-block;font-weight:bold;">
             📄 Download Receipt (PDF)
          </a>
        </div>
        <p style="font-size: 12px; color: #666;">
          Receipt URL: <a href="${uploadResponse.url}" target="_blank">${uploadResponse.url}</a>
        </p>`;
        
    } catch (uploadError) {
      console.error('❌ Failed to upload PDF to ImageKit:', uploadError);
      downloadLinkHtml = '<p style="color: #e53e3e;">Receipt will be available as email attachment.</p>';
    }

    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Bihar Purvanchal Samaj" <noreply@bsmgandhinagar.org>',
      to: donorEmail,
      subject: 'BSM Gandhinagar - Donation Receipt & Approval Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bihar Purvanchal Samaj Gandhinagar</h2>
          <p>Dear ${donorName},</p>
          
          <p>Thank you for your generous donation of <strong>₹${amount.toLocaleString('en-IN')}</strong> for the campaign "<strong>${campaign}</strong>".</p>
          
          <p>Your donation has been <strong style="color: #059669;">approved and processed successfully</strong>.</p>
          
          <p>Please find your official receipt attached to this email and available for download below:</p>
          
          ${downloadLinkHtml}
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Receipt Details:</h3>
            <p style="margin: 5px 0;"><strong>Receipt No:</strong> ${receiptData.receiptNo}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${receiptData.date}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
            <p style="margin: 5px 0;"><strong>Campaign:</strong> ${campaign}</p>
          </div>
          
          <p>For any queries, please contact us.</p>
          
          <p>Best regards,<br>
          <strong>Bihar Purvanchal Samaj Gandhinagar</strong><br>
          Registration Number: BSM/2024/REG001</p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    log('📧 Attempting to send email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    
    log('✅ Email with PDF sent successfully:', info.messageId);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email with PDF sent successfully',
      messageId: info.messageId,
      pdfUrl: uploadResponse?.url || null
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    
    // Return error but don't break the whole flow
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send email with PDF', 
      details: error.message 
    });
  }
}

// Upload PDF to ImageKit handler
async function handleUploadPDFToImageKit(req, res) {
  log('📤 Processing PDF upload to ImageKit request');
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pdfBase64, fileName, receiptData } = req.body;
    
    if (!pdfBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    log('📤 ImageKit upload details:', {
      fileName,
      hasBase64: !!pdfBase64,
      receiptNo: receiptData?.receiptNo
    });

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: pdfBuffer,
      fileName: fileName,
      folder: '/bsm-gandhinagar/receipts/',
      useUniqueFileName: true,
      tags: ['receipt', 'donation', receiptData?.receiptNo || 'unknown']
    });

    log('✅ PDF uploaded to ImageKit successfully:', uploadResponse.url);
    
    return res.status(200).json({ 
      success: true, 
      message: 'PDF uploaded to ImageKit successfully',
      url: uploadResponse.url,
      fileId: uploadResponse.fileId
    });

  } catch (error) {
    console.error('❌ ImageKit upload error:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'Failed to upload PDF to ImageKit', 
      details: error.message 
    });
  }
}

