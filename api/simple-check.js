export default function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'GET') {
      const envCheck = {
        timestamp: new Date().toISOString(),
        hasDatabase: process.env.DATABASE_URL ? 'YES' : 'NO',
        hasJwtSecret: process.env.JWT_SECRET ? 'YES' : 'NO',
        hasAdminUsername: process.env.ADMIN_USERNAME ? 'YES' : 'NO',
        hasAdminPassword: process.env.ADMIN_PASSWORD ? 'YES' : 'NO',
        adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET',
        nodeEnv: process.env.NODE_ENV || 'not-set'
      };
      
      return res.status(200).json({
        message: 'Environment check working!',
        environment: envCheck
      });
    }
    
    if (req.method === 'POST') {
      return res.status(200).json({
        message: 'POST endpoint working',
        body: req.body,
        hasAdminCreds: {
          username: process.env.ADMIN_USERNAME || 'NOT_SET',
          passwordSet: process.env.ADMIN_PASSWORD ? 'YES' : 'NO'
        }
      });
    }
    
    res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      message: 'Simple check failed'
    });
  }
}
