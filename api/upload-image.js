module.exports = async function handler(req, res) {
  console.log('Upload endpoint called:', req.method, req.url);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test response that matches what frontend expects
  return res.status(200).json({
    success: true,
    message: 'Upload test successful',
    imageUrl: 'https://ik.imagekit.io/4gkmfjy57/one.png',
    thumbnailUrl: 'https://ik.imagekit.io/4gkmfjy57/one.png?tr=w-200,h-150',
    fileId: 'test-upload-' + Date.now(),
    thumbnailId: 'test-thumb-' + Date.now(),
    imageName: 'test-uploaded-image.jpg',
    size: 123456,
    width: 1200,
    height: 800,
    timestamp: new Date().toISOString(),
    environment: {
      hasImageKitPublic: !!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      hasImageKitPrivate: !!process.env.IMAGEKIT_PRIVATE_KEY,
      hasImageKitEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT
    }
  });
}
