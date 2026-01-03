import express from 'express';
import { adminFirestore, adminAuth } from './firebase-admin';

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example: Create a trip document with admin privileges
app.post('/api/trips', async (req, res) => {
  if (!adminFirestore) {
    return res.status(503).json({ error: 'Firebase Admin not initialized' });
  }

  try {
    const { title, userId, description } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ error: 'title and userId required' });
    }

    const tripRef = await adminFirestore.collection('trips').add({
      title,
      userId,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ id: tripRef.id, message: 'Trip created successfully' });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Example: Get a user's trips (admin read)
app.get('/api/trips/:userId', async (req, res) => {
  if (!adminFirestore) {
    return res.status(503).json({ error: 'Firebase Admin not initialized' });
  }

  try {
    const { userId } = req.params;
    const snapshot = await adminFirestore
      .collection('trips')
      .where('userId', '==', userId)
      .get();

    const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ error: String(err) });
  }
});

// Example: Delete a trip (admin operation)
app.delete('/api/trips/:tripId', async (req, res) => {
  if (!adminFirestore) {
    return res.status(503).json({ error: 'Firebase Admin not initialized' });
  }

  try {
    const { tripId } = req.params;
    await adminFirestore.collection('trips').doc(tripId).delete();
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`POST /api/trips - Create a trip`);
  console.log(`GET /api/trips/:userId - Get user's trips`);
  console.log(`DELETE /api/trips/:tripId - Delete a trip`);
});
