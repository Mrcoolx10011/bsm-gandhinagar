#!/usr/bin/env node

/**
 * Simple Development Server
 * A lightweight HTTP server to run the consolidated API locally
 */

import { createServer } from 'http';
import { parse } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the consolidated API handler
import apiHandler from './api/consolidated.js';

const PORT = 3000;

function createMockVercelRequest(req) {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Extract endpoint from path like /api/endpoint-name
  const endpoint = path.replace('/api/', '').replace('/', '');
  
  return {
    ...req,
    query: {
      ...parsedUrl.query,
      endpoint: endpoint || 'health'
    }
  };
}

function createMockVercelResponse(res) {
  return {
    ...res,
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

  // Only handle API routes
  if (!req.url.startsWith('/api/')) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  try {
    // Parse request body for POST/PUT requests
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      // Parse JSON body if present
      if (body && req.headers['content-type']?.includes('application/json')) {
        try {
          req.body = JSON.parse(body);
        } catch (e) {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Create mock Vercel request/response objects
      const mockReq = createMockVercelRequest(req);
      const mockRes = createMockVercelResponse(res);

      // Ensure environment variables are available to the API handler
      mockReq.env = process.env;

      // Call the API handler
      try {
        await apiHandler(mockReq, mockRes);
        console.log(`✅ API Response sent for ${req.method} ${req.url}`);
      } catch (apiError) {
        console.error(`❌ API Error for ${req.method} ${req.url}:`, apiError.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API handler error', details: apiError.message }));
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log('🚀 Simple Development Server Started!');
  console.log('=====================================');
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log('🌐 Frontend: http://localhost:5173 (run separately)');
  console.log('\nAvailable API endpoints:');
  console.log('  📊 Health: http://localhost:3000/api/health');
  console.log('  🔐 Login: http://localhost:3000/api/login');
  console.log('  👥 Members: http://localhost:3000/api/members');
  console.log('  📅 Events: http://localhost:3000/api/events');
  console.log('  💰 Donations: http://localhost:3000/api/donations');
  console.log('  📝 Posts: http://localhost:3000/api/posts');
  console.log('  ❓ Inquiries: http://localhost:3000/api/inquiries');
  console.log('  📈 Recent Activities: http://localhost:3000/api/recent-activities');
  console.log('\n💡 Press Ctrl+C to stop the server\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
