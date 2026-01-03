import React, { useState } from 'react';
import { addDocument } from '@/integrations/firebase/operations';

const TripExampleFirebase: React.FC = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title) return setMessage('Please provide a title');
    setLoading(true);
    setMessage(null);
    try {
      const id = await addDocument('trips', {
        title,
        createdBy: 'example-user',
      });
      setMessage(`Created trip ${id}`);
      setTitle('');
    } catch (err) {
      console.error(err);
      setMessage('Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-2">Create Trip (Firestore)</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Trip title"
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleCreate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Creating...' : 'Create Trip'}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default TripExampleFirebase;
