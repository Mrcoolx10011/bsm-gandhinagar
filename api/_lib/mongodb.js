import { MongoClient } from 'mongodb';

let client = null;
let db = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    const uri = process.env.DATABASE_URL;
    if (!uri) {
      throw new Error('DATABASE_URL is not defined');
    }

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db('bsm-gandhinagar');
    
    console.log('Connected to MongoDB successfully');
    
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}
