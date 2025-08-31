// Simple test handler for ImageKit endpoints only
// Testing Vercel serverless function compatibility

module.exports = async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get endpoint from query parameter
    const { endpoint } = req.query;
    
    // Simple test responses for ImageKit endpoints
    switch (endpoint) {
      case 'imagekit-auth':
        return res.status(200).json({
          token: 'test-token',
          expire: Date.now() + 3600000,
          signature: 'test-signature'
        });
        
      case 'imagekit-list':
        return res.status(200).json([]);
        
      case 'upload-image':
        return res.status(200).json({
          success: true,
          message: 'Test upload endpoint working'
        });
        
      case 'imagekit-delete':
        return res.status(200).json({
          success: true,
          message: 'Test delete endpoint working'
        });
        
      default:
        return res.status(200).json({
          message: 'API test endpoint working',
          endpoint: endpoint || 'none',
          method: req.method,
          url: req.url
        });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
