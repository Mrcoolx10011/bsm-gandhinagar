const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileId } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }
    
    await imagekit.deleteFile(fileId);
    
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('ImageKit delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}
