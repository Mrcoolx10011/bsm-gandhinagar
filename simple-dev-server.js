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
function createMockVercelRequest(req) {
  const parsedUrl = parse(req.url, true);
  
  return {
    ...req,
    query: parsedUrl.query,
    body: req.body || {}
  };
}

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

  // Convert direct API routes to consolidated format
  const parsedUrl = parse(req.url, true);
  let mockReq;

  if (req.url.startsWith('/api/consolidated')) {
    // Already in consolidated format, use as-is
    mockReq = createMockVercelRequest(req);
  } else {
    // Convert direct API route to consolidated format
    const pathParts = parsedUrl.pathname.split('/');
    const endpoint = pathParts[2]; // Extract endpoint from /api/endpoint
    
    // Create new URL with consolidated format
    const consolidatedQuery = {
      ...parsedUrl.query,
      endpoint: endpoint
    };
    
    // Create modified request object
    const consolidatedReq = {
      ...req,
      url: `/api/consolidated?${new URLSearchParams(consolidatedQuery).toString()}`,
      query: consolidatedQuery,
      body: req.body || {}
    };
    
    mockReq = consolidatedReq;
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
          mockReq.body = JSON.parse(body);
          console.log('📝 Parsed request body:', mockReq.body);
        } catch (e) {
          console.error('❌ Failed to parse JSON body:', e.message);
          mockReq.body = {};
        }
      } else {
        mockReq.body = {};
      }

      // Create mock Vercel response object
      const mockRes = createMockVercelResponse(res);

      // Call the consolidated API handler
      try {
        await consolidatedHandler(mockReq, mockRes);
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
  console.log('  📊 Health: http://localhost:3000/api/consolidated?endpoint=health');
  console.log('  � Health (direct): http://localhost:3000/api/health');
  console.log('  �🔐 Recent Activities: http://localhost:3000/api/consolidated?endpoint=recent-activities');
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
