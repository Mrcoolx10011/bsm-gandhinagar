// Single Vercel serverless function handling all API routes
// This approach works better for hobby plans to avoid complexity

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import the consolidated handler
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the consolidated.js file content
let consolidatedHandler;

try {
  // Import consolidated handler dynamically
  const { default: handler } = await import('./consolidated.js');
  consolidatedHandler = handler;
} catch (error) {
  console.error('Error importing consolidated handler:', error);
}

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Route to consolidated handler
    if (consolidatedHandler) {
      return await consolidatedHandler(req, res);
    } else {
      return res.status(500).json({ error: 'Handler not available' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
