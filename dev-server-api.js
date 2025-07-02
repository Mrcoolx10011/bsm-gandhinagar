import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import API handlers (convert to Express routes)
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// API routes first (before static files)
const createRoute = (handler) => {
  return async (req, res) => {
    console.log(`🔍 API Route hit: ${req.method} ${req.url}`);
    try {
      // Create a Vercel-compatible request object
      const vercelReq = {
        ...req,
        query: { ...req.query, ...req.params },
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.url
      };

      // Create a Vercel-compatible response object with Express methods
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          console.log(`📤 Sending JSON response:`, data);
          res.json(data);
          return vercelRes;
        },
        send: (data) => {
          res.send(data);
          return vercelRes;
        },
        end: (data) => {
          res.end(data);
          return vercelRes;
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
          return vercelRes;
        }
      };

      console.log(`🚀 Calling handler for ${req.url}`);
      await handler(vercelReq, vercelRes);
      console.log(`✅ Handler completed for ${req.url}`);
    } catch (error) {
      console.error('Route error:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };
};

// Import and setup API routes
const setupApiRoutes = async () => {
  try {
    // Hello route (simple test)
    try {
      const { default: helloHandler } = await import('./api/hello.js');
      app.all('/api/hello', createRoute(helloHandler));
      console.log('✅ Hello API loaded');
    } catch (error) {
      console.error('❌ Error loading hello API:', error.message);
    }

    // Simple check route
    try {
      const { default: simpleCheckHandler } = await import('./api/simple-check.js');
      app.all('/api/simple-check', createRoute(simpleCheckHandler));
      console.log('✅ Simple-check API loaded');
    } catch (error) {
      console.error('❌ Error loading simple-check API:', error.message);
    }

    // Login route
    try {
      const { default: loginHandler } = await import('./api/auth/login.js');
      app.all('/api/auth/login', createRoute(loginHandler));
      console.log('✅ Login API loaded');
    } catch (error) {
      console.error('❌ Error loading login API:', error.message);
    }

    // Members route
    try {
      const { default: membersHandler } = await import('./api/members.js');
      app.all('/api/members', createRoute(membersHandler));
      console.log('✅ Members API loaded');
    } catch (error) {
      console.error('❌ Error loading members API:', error.message);
    }

    // Posts route
    try {
      const { default: postsHandler } = await import('./api/posts.js');
      app.all('/api/posts', createRoute(postsHandler));
      console.log('✅ Posts API loaded');
    } catch (error) {
      console.error('❌ Error loading posts API:', error.message);
    }

    // Events route
    try {
      const { default: eventsHandler } = await import('./api/events.js');
      app.all('/api/events', createRoute(eventsHandler));
      console.log('✅ Events API loaded');
    } catch (error) {
      console.error('❌ Error loading events API:', error.message);
    }

    // Donations route
    try {
      const { default: donationsHandler } = await import('./api/donations.js');
      app.all('/api/donations', createRoute(donationsHandler));
      console.log('✅ Donations API loaded');
    } catch (error) {
      console.error('❌ Error loading donations API:', error.message);
    }

    // Inquiries route
    try {
      const { default: inquiriesHandler } = await import('./api/inquiries.js');
      app.all('/api/inquiries', createRoute(inquiriesHandler));
      console.log('✅ Inquiries API loaded');
    } catch (error) {
      console.error('❌ Error loading inquiries API:', error.message);
    }

    console.log('✅ API routes setup complete');
    
    // Serve static files AFTER API routes
    app.use('/', (req, res, next) => {
      console.log(`📁 Static file request: ${req.method} ${req.url}`);
      next();
    }, express.static(join(__dirname, 'dist')));
    
    // Catch-all handler: send back React's index.html file (AFTER API routes)
    app.get('*', (req, res) => {
      console.log(`🌐 Catch-all handler hit: ${req.method} ${req.url}`);
      res.sendFile(join(__dirname, 'dist/index.html'));
    });
  } catch (error) {
    console.error('❌ Error setting up API routes:', error);
  }
};

// Start server
const startServer = async () => {
  // Add a simple test route first
  app.get('/api/test-direct', (req, res) => {
    res.json({ message: 'Direct route working!', timestamp: new Date().toISOString() });
  });
  
  await setupApiRoutes();
  
  app.listen(PORT, () => {
    console.log(`🚀 Development server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
  });
};

startServer().catch(console.error);
