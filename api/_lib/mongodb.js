import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

let client = null;
let db = null;
let isConnecting = false;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    // Wait for current connection attempt
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (db) return db;
  }

  try {
    isConnecting = true;
    
    // Check for multiple possible environment variable names
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!uri) {
      throw new Error('DATABASE_URL, MONGODB_URI, or MONGO_URL is not defined');
    }

    console.log('Connecting to MongoDB...');
    
    // Optimized for serverless with shorter timeouts
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000, // 10 seconds timeout
      maxPoolSize: 10, // Limit connection pool
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    
    db = client.db('bsm-gandhinagar');
    
    console.log('Connected to MongoDB successfully');
    
    // Initialize default admin user (only in development or first run)
    if (process.env.NODE_ENV !== 'production' || !await hasAdminUser()) {
      await initializeDefaultUser();
    }
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Reset connection state on error
    client = null;
    db = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

// Check if admin user already exists
async function hasAdminUser() {
  try {
    if (!db) return false;
    const adminUser = await db.collection('users').findOne({ username: 'admin' });
    return !!adminUser;
  } catch (error) {
    console.error('Error checking admin user:', error);
    return false;
  }
}

async function initializeDefaultUser() {
  if (!db) return;

  try {
    const usersCollection = db.collection('users');
    
    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ username: 'admin' });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await usersCollection.insertOne({
        username: 'admin',
        email: 'admin@bsmgandhinagar.org',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing default user:', error);
  }
}

export { connectToDatabase, client, db };
