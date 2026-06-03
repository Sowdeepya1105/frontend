import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchProfile } from '../services/authService.js';

export default function ProfilePage() {
  const auth = useAuth();
  const [profile, setProfile] = useState(auth.user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.token) return;

    const loadProfile = async () => {
      setError('');
      try {
        const result = await fetchProfile(auth.token);
        setProfile(result.user || auth.user);
        window.appState.authUser = result.user || auth.user;
      } catch (err) {
        setError(err.message);
      }
    };

    loadProfile();
  }, [auth.token]);

  return (
    <div className="card">
      <h2>Profile</h2>
      <p>Review your authenticated profile details and current role.</p>
      {error && <div className="alert">{error}</div>}
      <div className="info-row">
        <div className="info-card">
          <strong>Name</strong>
          <p>{profile?.name}</p>
        </div>
        <div className="info-card">
          <strong>Email</strong>
          <p>{profile?.email}</p>
        </div>
        <div className="info-card">
          <strong>Role</strong>
          <p>{profile?.role}</p>
        </div>
      </div>
      <div className="info-row" style={{ marginTop: '1rem' }}>
        <div className="info-card">
          <strong>Department</strong>
          <p>{profile?.department}</p>
        </div>
        <div className="info-card">
          <strong>Status</strong>
          <p>{profile?.status}</p>
        </div>
        <div className="info-card">
          <strong>Member since</strong>
          <p>{profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</p>
        </div>
      </div>
    </div>
  );
}
