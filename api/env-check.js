// Simple environment check endpoint for Vercel debugging
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'not-set',
      hasDatabase: !!(process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL),
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasAdminCredentials: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
      databaseSource: process.env.DATABASE_URL ? 'DATABASE_URL' : 
                     process.env.MONGODB_URI ? 'MONGODB_URI' : 
                     process.env.MONGO_URL ? 'MONGO_URL' : 'NONE',
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET'
    };

    return res.status(200).json({
      message: 'Environment check completed',
      status: 'success',
      environment: envCheck,
      allGood: envCheck.hasDatabase && envCheck.hasJwtSecret && envCheck.hasAdminCredentials
    });
  } catch (error) {
    console.error('Environment check error:', error);
    return res.status(500).json({
      message: 'Environment check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
