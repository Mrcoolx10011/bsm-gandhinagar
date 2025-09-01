// Test version without ImageKit import to match working endpoints

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
    
    // Return test images in the format the frontend expects
    const testImages = [
      {
        fileId: 'test-1',
        name: 'test-image-1.jpg',
        url: 'https://ik.imagekit.io/4gkmfjy57/one.png',
        thumbnailUrl: 'https://ik.imagekit.io/4gkmfjy57/one.png?tr=w-200,h-150',
        width: 1200,
        height: 800,
        size: 156789,
        filePath: '/bsm-gandhinagar/posts/test-image-1.jpg',
        tags: ['test', 'bsm-gandhinagar'],
        createdAt: '2025-09-01T10:00:00Z'
      },
      {
        fileId: 'test-2', 
        name: 'test-image-2.jpg',
        url: 'https://ik.imagekit.io/4gkmfjy57/one.png',
        thumbnailUrl: 'https://ik.imagekit.io/4gkmfjy57/one.png?tr=w-200,h-150',
        width: 800,
        height: 600,
        size: 98765,
        filePath: '/bsm-gandhinagar/posts/test-image-2.jpg',
        tags: ['test', 'bsm-gandhinagar'],
        createdAt: '2025-09-01T11:00:00Z'
      }
    ];
    
    console.log(`Found ${testImages.length} test images`);
    
    // Frontend expects { success: true, files: [...] } format
    res.status(200).json({
      success: true,
      files: testImages,
      message: `Found ${testImages.length} test images`
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
