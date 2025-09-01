const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = async function handler(req, res) {
  console.log('ImageKit List called:', req.method);
  
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

  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error('Missing ImageKit environment variables');
      return res.status(500).json({ error: 'ImageKit not configured' });
    }

    const { folder = '' } = req.query;
    
    const images = await imagekit.listFiles({
      path: folder,
      limit: 100
    });
    
    console.log(`Found ${images.length} images`);
    res.status(200).json(images);
  } catch (error) {
    console.error('ImageKit list error:', error);
    res.status(500).json({ error: 'Failed to fetch images', details: error.message });
  }
}
