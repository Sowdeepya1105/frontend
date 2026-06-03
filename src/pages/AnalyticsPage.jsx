import { useEffect, useState } from 'react';
import { getDeveloperAnalytics, getIssueAnalytics, getProjectAnalytics } from '../services/analyticsService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AnalyticsPage() {
  const auth = useAuth();
  const [issueSummary, setIssueSummary] = useState(null);
  const [projectSummary, setProjectSummary] = useState(null);
  const [developerSummary, setDeveloperSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.token) return;

    const loadAnalytics = async () => {
      setError('');
      try {
        const [issueResult, projectResult, developerResult] = await Promise.all([
          getIssueAnalytics(auth.token),
          getProjectAnalytics(auth.token),
          getDeveloperAnalytics(auth.token),
        ]);

        setIssueSummary(issueResult);
        setProjectSummary(projectResult);
        setDeveloperSummary(developerResult);
      } catch (err) {
        setError(err.message);
      }
    };

    loadAnalytics();
  }, [auth.token]);

  return (
    <div className="card">
      <h2>Analytics</h2>
      <p>View issue, project, and developer analytics from the backend.</p>
      {error && <div className="alert">{error}</div>}
      {issueSummary && (
        <div className="info-row" style={{ marginBottom: '1.5rem' }}>
          <div className="info-card">
            <strong>Total issues</strong>
            <p>{issueSummary.totalIssues}</p>
          </div>
          <div className="info-card">
            <strong>Open issues</strong>
            <p>{issueSummary.openIssues}</p>
          </div>
          <div className="info-card">
            <strong>Resolved issues</strong>
            <p>{issueSummary.resolvedIssues}</p>
          </div>
          <div className="info-card">
            <strong>Closed issues</strong>
            <p>{issueSummary.closedIssues}</p>
          </div>
        </div>
      )}
      {projectSummary && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3>Project analytics</h3>
          <p>Active projects: {projectSummary.activeProjectCount}</p>
          <p>Closed projects: {projectSummary.closedProjectCount}</p>
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Issue count</th>
                </tr>
              </thead>
              <tbody>
                {projectSummary.projectMetrics.map((project) => (
                  <tr key={project.projectId}>
                    <td>{project.title}</td>
                    <td>{project.status}</td>
                    <td>{project.issueCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {developerSummary && (
        <div className="card">
          <h3>Developer analytics</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Developer</th>
                  <th>Resolved issues</th>
                  <th>Avg resolution time (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {developerSummary.developers.map((developer) => (
                  <tr key={developer.userId}>
                    <td>{developer.name}</td>
                    <td>{developer.resolvedCount}</td>
                    <td>{developer.averageResolutionTimeHours?.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
