import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectToDatabase } from '../lib/mongodb.js';

// Load environment variables
dotenv.config();

// Import routes (using MongoDB-based routes)
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import eventsRoutes from './routes/events.js';
import donationsRoutes from './routes/donations.js';
import inquiriesRoutes from './routes/inquiries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../dist')));

// Initialize MongoDB connection
connectToDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Database initialization failed:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/inquiries', inquiriesRoutes);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});