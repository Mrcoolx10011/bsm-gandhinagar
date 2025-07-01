import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Import API handlers
import membersHandler from './api/members.js';
import eventsHandler from './api/events.js';
import donationsHandler from './api/donations.js';
import inquiriesHandler from './api/inquiries.js';
import loginHandler from './api/auth/login.js';

// Convert Vercel-style handlers to Express middleware
function wrapHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

// API Routes
app.all('/api/members', wrapHandler(membersHandler));
app.all('/api/events', wrapHandler(eventsHandler));
app.all('/api/donations', wrapHandler(donationsHandler));
app.all('/api/inquiries', wrapHandler(inquiriesHandler));
app.all('/api/auth/login', wrapHandler(loginHandler));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.path}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api/*`);
  console.log(`🔗 Frontend should be running on http://localhost:5173`);
});

export default app;
