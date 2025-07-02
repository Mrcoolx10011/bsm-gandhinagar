import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const createJWTToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

export const verifyJWTToken = (token) => {
  if (!token) return null;
  
  try {
    // Remove Bearer prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const addCORSHeaders = (res, req) => {
  // Get the origin from the request
  const origin = req ? req.headers.origin : null;
  
  // Allowed origins for production and development
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://localhost:3000',
    'https://localhost:5173',
    // Add your Vercel domains here
    'https://your-app.vercel.app',
    'https://your-app-git-main.vercel.app',
    // Vercel preview domains (dynamic)
    /^https:\/\/.*\.vercel\.app$/
  ];

  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    if (typeof allowed === 'string') {
      return origin === allowed;
    } else if (allowed instanceof RegExp) {
      return allowed.test(origin);
    }
    return false;
  });

  if (isAllowed || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }

  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};
