export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const envStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'not-set',
      hasDatabase: process.env.DATABASE_URL ? 'YES' : 'NO',
      hasJwtSecret: process.env.JWT_SECRET ? 'YES' : 'NO', 
      hasAdminUsername: process.env.ADMIN_USERNAME ? 'YES' : 'NO',
      hasAdminPassword: process.env.ADMIN_PASSWORD ? 'YES' : 'NO',
      adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET',
      dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
    };
    
    res.status(200).json({
      success: true,
      message: 'Environment check working!',
      data: envStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Environment check failed'
    });
  }
}
