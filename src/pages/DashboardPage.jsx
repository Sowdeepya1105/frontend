import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getProjects, getUsers } from '../services/projectService.js';
import { getIssues } from '../services/issueService.js';

export default function DashboardPage() {
  const auth = useAuth();
  const [summary, setSummary] = useState({ projects: 0, issues: 0, users: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [projectResult, issueResult, userResult] = await Promise.all([
          getProjects(auth.token),
          getIssues(auth.token, { limit: 1 }),
          getUsers(auth.token),
        ]);
        setSummary({
          projects: projectResult.projects.length,
          issues: issueResult.pagination?.total ?? issueResult.issues.length,
          users: userResult.users.length,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    if (auth.token) {
      fetchSummary();
    }
  }, [auth.token]);

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Welcome back, {auth.user?.name ?? 'team member'}.</p>
      {error && <div className="alert">{error}</div>}
      <div className="info-row">
        <div className="info-card">
          <strong>Total projects</strong>
          <p>{summary.projects}</p>
        </div>
        <div className="info-card">
          <strong>Total issues</strong>
          <p>{summary.issues}</p>
        </div>
        <div className="info-card">
          <strong>Users onboarded</strong>
          <p>{summary.users}</p>
        </div>
      </div>
      <div className="card">
        <h3>Your profile</h3>
        <div className="info-row">
          <div className="info-card">
            <strong>Name</strong>
            <p>{auth.user?.name}</p>
          </div>
          <div className="info-card">
            <strong>Role</strong>
            <p>{auth.user?.role}</p>
          </div>
          <div className="info-card">
            <strong>Department</strong>
            <p>{auth.user?.department}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
