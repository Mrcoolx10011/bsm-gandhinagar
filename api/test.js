module.exports = async function handler(req, res) {
  console.log('Test endpoint called:', req.method, req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple test response
  return res.status(200).json({
    success: true,
    message: 'API endpoint working',
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: {
      hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasImageKitEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT
    }
  });
}
