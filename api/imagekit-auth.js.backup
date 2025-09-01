// Real ImageKit authentication
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = async function handler(req, res) {
  try {
    console.log('ImageKit Auth called:', req.method);
    
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

    // Get real authentication parameters from ImageKit
    const authenticationParameters = imagekit.getAuthenticationParameters();
    console.log('Auth successful');
    res.status(200).json(authenticationParameters);

  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message,
      stack: error.stack 
    });
  }
}
