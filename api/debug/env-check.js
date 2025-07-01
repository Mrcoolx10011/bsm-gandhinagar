export default function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check environment variables (without exposing sensitive data)
  const envCheck = {
    hasDatabase: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasAdminUsername: !!process.env.ADMIN_USERNAME,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET',
    // Don't expose actual password, just confirm it exists
    adminPasswordSet: process.env.ADMIN_PASSWORD ? 'YES' : 'NO',
    timestamp: new Date().toISOString()
  };

  res.status(200).json({
    message: 'Environment check completed',
    environment: envCheck
  });
}
