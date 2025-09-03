#!/usr/bin/env node

/**
 * Simple Development Server for Consolidated API
 * Serves the consolidated.js API handler in development mode
 */

import { createServer } from 'http';
import { parse } from 'url';
import consolidatedHandler from './api/consolidated.js';

const PORT = 3000;

// Create mock Vercel-style request/response objects
function createMockVercelResponse(res) {
  return {
    status: (code) => {
      res.statusCode = code;
      return {
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        },
        end: () => res.end()
      };
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    setHeader: (name, value) => res.setHeader(name, value)
  };
}

const server = createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Handle both consolidated and direct API routes
  if (!req.url.startsWith('/api/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  // Convert direct API routes to consolidated format by adding a query parameter
  const parsedUrl = parse(req.url, true);
  
  // Logic to determine the endpoint
  let endpoint;
  if (req.url.startsWith('/api/consolidated')) {
    endpoint = parsedUrl.query.endpoint;
  } else {
    const pathParts = parsedUrl.pathname.split('/');
    endpoint = pathParts[2]; // e.g., 'members' from '/api/members'
  }

  // Attach the final query object to the original request.
  // The consolidated handler expects the endpoint to be in the query.
  req.query = {
    ...parsedUrl.query,
    endpoint: endpoint
  };

  // Special handling for multipart/form-data (file uploads)
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    let rawBody = Buffer.alloc(0);
    
    req.on('data', chunk => {
      rawBody = Buffer.concat([rawBody, chunk]);
    });

    req.on('end', async () => {
      // Add raw body to request object for the upload handler
      req.rawBody = rawBody;
      req.body = {}; // Initialize empty body
      
      const mockRes = createMockVercelResponse(res);
      
      try {
        await consolidatedHandler(req, mockRes);
        console.log(`✅ API Response sent for ${req.method} ${req.url}`);
      } catch (apiError) {
        console.error(`❌ API Error for ${req.method} ${req.url}:`, apiError.message);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API handler error', details: apiError.message }));
        }
      }
    });
    
    return;
  }

  // Handle JSON and other non-multipart requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    // Parse JSON body if present
    if (body && req.headers['content-type']?.includes('application/json')) {
      try {
        req.body = JSON.parse(body);
        console.log('📝 Parsed request body:', req.body);
      } catch (e) {
        console.error('❌ Failed to parse JSON body:', e.message);
        req.body = {};
      }
    } else {
      req.body = {};
    }

    const mockRes = createMockVercelResponse(res);

    try {
      await consolidatedHandler(req, mockRes);
      console.log(`✅ API Response sent for ${req.method} ${req.url}`);
    } catch (apiError) {
      console.error(`❌ API Error for ${req.method} ${req.url}:`, apiError.message);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API handler error', details: apiError.message }));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log('🚀 Simple Development Server Started!');
  console.log('=====================================');
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log('🌐 Frontend: http://localhost:5173 (run separately)');
  console.log('');
  console.log('Available API endpoints:');
  console.log('  📊 Health: http://localhost:3000/api/consolidated?endpoint=health');
  console.log('  📈 Health (direct): http://localhost:3000/api/health');
  console.log('  🔐 Recent Activities: http://localhost:3000/api/consolidated?endpoint=recent-activities');
  console.log('  🔐 Recent Activities (direct): http://localhost:3000/api/recent-activities');
  console.log('  👥 Members: http://localhost:3000/api/consolidated?endpoint=members');
  console.log('  👥 Members (direct): http://localhost:3000/api/members');
  console.log('  📅 Events: http://localhost:3000/api/consolidated?endpoint=events');
  console.log('  📅 Events (direct): http://localhost:3000/api/events');
  console.log('  💰 Donations: http://localhost:3000/api/consolidated?endpoint=donations');
  console.log('  💰 Donations (direct): http://localhost:3000/api/donations');
  console.log('  📝 Posts: http://localhost:3000/api/consolidated?endpoint=posts');
  console.log('  📝 Posts (direct): http://localhost:3000/api/posts');
  console.log('  🎯 Campaigns: http://localhost:3000/api/consolidated?endpoint=campaigns');
  console.log('  🎯 Campaigns (direct): http://localhost:3000/api/campaigns');
  console.log('');
  console.log('💡 Press Ctrl+C to stop the server');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});