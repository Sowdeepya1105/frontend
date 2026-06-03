import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="card">
      <h2>Page not found</h2>
      <p>The route you requested does not exist. Use the navigation menu to continue.</p>
      <Link to="/dashboard" className="primary link-button">
        Go to dashboard
      </Link>
    </div>
  );
}
