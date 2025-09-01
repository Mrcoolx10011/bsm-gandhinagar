// Real ImageKit integration now that API structure works
const ImageKit = require('imagekit');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = async function handler(req, res) {
  try {
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

    const { folder = '' } = req.query;
    
    // Get real images from ImageKit
    // If folder is empty, search all images without path restriction
    const searchOptions = {
      limit: 100,
      sort: 'DESC_CREATED'
    };
    
    // Only add path if folder is specified and not empty
    if (folder && folder.trim() !== '') {
      searchOptions.path = folder;
    }
    
    console.log('Searching ImageKit with options:', searchOptions);
    
    const images = await imagekit.listFiles(searchOptions);
    
    console.log(`Found ${images.length} real images from ImageKit`);
    
    // Transform ImageKit response to match frontend expectations
    const transformedImages = images.map(img => ({
      fileId: img.fileId,
      name: img.name,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl || img.url + '?tr=w-200,h-150',
      width: img.width || 0,
      height: img.height || 0,
      size: img.size || 0,
      filePath: img.filePath,
      tags: img.tags || [],
      createdAt: img.createdAt
    }));
    
    // Frontend expects { success: true, files: [...] } format
    res.status(200).json({
      success: true,
      files: transformedImages,
      message: `Found ${transformedImages.length} images from ImageKit`
    });

  } catch (error) {
    console.error('ImageKit list error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch images', 
      details: error.message,
      stack: error.stack 
    });
  }
}
