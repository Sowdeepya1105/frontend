import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function SyncPage() {
  const auth = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Sync failed');
      }
      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Dataset sync</h2>
      <p>Fetch the external issue dataset and populate valid records into the database.</p>
      {error && <div className="alert">{error}</div>}
      <div className="button-group">
        <button type="button" className="primary" onClick={handleSync} disabled={loading}>
          {loading ? 'Syncing...' : 'Start sync'}
        </button>
      </div>
      {result && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>Sync results</h3>
          <ul>
            <li>Total fetched: {result.totalFetched}</li>
            <li>Inserted: {result.inserted}</li>
            <li>Duplicates: {result.duplicates}</li>
            <li>Rejected: {result.rejected}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
