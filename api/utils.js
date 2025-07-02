// Consolidated utility API endpoints
// Combines: hello, simple-check, test, test-cjs, debug/env-check
import { addCORSHeaders } from './_lib/auth.js';

export default async function handler(req, res) {
  // Add CORS headers
  addCORSHeaders(res, req);
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get the endpoint type from query parameter or URL
    const { type } = req.query;
    const endpoint = type || 'hello';

    switch(endpoint.toLowerCase()) {
      case 'hello':
        return res.status(200).json({ 
          message: 'Hello from Vercel API!', 
          timestamp: new Date().toISOString(),
          method: req.method
        });
      
      case 'simple-check':
        return res.json({ message: "Simple API working!" });
      
      case 'test':
        return res.status(200).json({
          message: 'Test API endpoint working!',
          timestamp: new Date().toISOString(),
          method: req.method
        });
      
      case 'test-cjs':
        return res.status(200).json({
          message: 'Hello from Vercel API (CommonJS)!',
          timestamp: new Date().toISOString(),
          method: req.method
        });
        
      case 'env-check':
        const envStatus = {
          timestamp: new Date().toISOString(),
          hasDatabase: !!(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL),
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasAdminUsername: !!process.env.ADMIN_USERNAME,
          hasAdminPassword: !!process.env.ADMIN_PASSWORD,
          nodeEnv: process.env.NODE_ENV || 'not-set'
        };
        return res.status(200).json({
          message: 'Environment check completed',
          environment: envStatus
        });
      
      default:
        return res.status(200).json({ 
          message: 'Utility API endpoint', 
          timestamp: new Date().toISOString(),
          availableTypes: ['hello', 'simple-check', 'test', 'test-cjs', 'env-check']
        });
    }
  } catch (error) {
    console.error('Utility API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
