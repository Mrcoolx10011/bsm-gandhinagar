// Test version without ImageKit import to isolate the issue

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
    const envCheck = {
      hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasImageKitEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
      publicKeyLength: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.length || 0,
      privateKeyLength: process.env.IMAGEKIT_PRIVATE_KEY?.length || 0
    };

    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error('Missing ImageKit environment variables');
      return res.status(500).json({ 
        error: 'ImageKit not configured',
        envCheck 
      });
    }

    // Return test auth data instead of real ImageKit auth
    res.status(200).json({
      message: 'Auth endpoint working',
      envCheck,
      testAuth: {
        token: 'test-token',
        expire: Date.now() + 3600000,
        signature: 'test-signature'
      }
    });

  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message,
      stack: error.stack 
    });
  }
}
