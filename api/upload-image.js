const ImageKit = require('imagekit');
const formidable = require('formidable');
const fs = require('fs');

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function handler(req, res) {
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

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = files.image?.[0];

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file type
    if (!uploadedFile.mimetype?.startsWith('image/')) {
      return res.status(400).json({ error: 'Please upload only image files' });
    }

    // Read file as buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    // Get folder from form data or use default
    const folder = fields.folder?.[0] || 'posts';

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: `${folder}-${Date.now()}-${uploadedFile.originalFilename}`,
      folder: `/bsm-gandhinagar/${folder}/`,
      useUniqueFileName: true,
      transformation: {
        post: [
          {
            type: 'transformation',
            value: 'w-1200,h-800,c-at_max,q-80'
          }
        ]
      },
      tags: [folder, 'bsm-gandhinagar']
    });

    // Generate thumbnail for posts
    let thumbnailResult = null;
    if (folder === 'posts') {
      thumbnailResult = await imagekit.upload({
        file: fileBuffer,
        fileName: `thumb-${Date.now()}-${uploadedFile.originalFilename}`,
        folder: `/bsm-gandhinagar/${folder}/thumbnails/`,
        useUniqueFileName: true,
        transformation: {
          post: [
            {
              type: 'transformation',
              value: 'w-400,h-250,c-maintain_ratio,q-70'
            }
          ]
        },
        tags: ['thumbnail', 'bsm-gandhinagar']
      });
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    const response = {
      success: true,
      imageUrl: result.url,
      fileId: result.fileId,
      imageName: result.name,
      size: result.size,
      width: result.width,
      height: result.height
    };

    // Add thumbnail data if created
    if (thumbnailResult) {
      response.thumbnailUrl = thumbnailResult.url;
      response.thumbnailId = thumbnailResult.fileId;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
}

// Export both the handler and config
module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
