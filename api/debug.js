module.exports = async function handler(req, res) {
  try {
    console.log('Debug endpoint called');
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Check environment
    const envCheck = {
      nodeVersion: process.version,
      hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasImageKitEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('IMAGE')),
      platform: process.platform,
      arch: process.arch
    };

    return res.status(200).json({
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      method: req.method,
      url: req.url
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      error: 'Debug endpoint failed', 
      details: error.message,
      stack: error.stack 
    });
  }
}
