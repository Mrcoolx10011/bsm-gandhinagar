import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    // Check for multiple possible environment variable names
    const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.MONGO_URL;
    if (!uri) {
      throw new Error('DATABASE_URL, MONGODB_URI, or MONGO_URL is not defined');
    }

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db('bsm-gandhinagar');
    
    console.log('Connected to MongoDB successfully');
    
    // Initialize default admin user
    await initializeDefaultUser();
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
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
