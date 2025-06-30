import { connectToDatabase } from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    if (req.method === 'GET') {
      const events = await eventsCollection.find({}).toArray();
      res.status(200).json(events);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
