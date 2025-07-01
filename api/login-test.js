export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    if (req.method === 'GET') {
      res.status(200).json({
        message: 'Login test endpoint working',
        timestamp: new Date().toISOString(),
        environmentCheck: {
          hasAdminUsername: !!process.env.ADMIN_USERNAME,
          hasAdminPassword: !!process.env.ADMIN_PASSWORD,
          hasJwtSecret: !!process.env.JWT_SECRET,
          adminUsername: process.env.ADMIN_USERNAME || 'NOT_SET'
        }
      });
    } else if (req.method === 'POST') {
      const { username, password } = req.body || {};
      
      const envCheck = {
        adminUsername: process.env.ADMIN_USERNAME,
        adminPassword: process.env.ADMIN_PASSWORD,
        jwtSecret: process.env.JWT_SECRET
      };
      
      res.status(200).json({
        message: 'Login test POST received',
        receivedData: { username: username || 'not provided', password: password ? 'provided' : 'not provided' },
        environmentData: {
          adminUsernameSet: !!envCheck.adminUsername,
          adminPasswordSet: !!envCheck.adminPassword,
          jwtSecretSet: !!envCheck.jwtSecret,
          adminUsername: envCheck.adminUsername || 'NOT_SET'
        }
      });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Login test failed'
    });
  }
}
