import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getUsers } from '../services/projectService.js';

export default function UsersPage() {
  const auth = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.token) return;

    const loadUsers = async () => {
      setError('');
      try {
        const result = await getUsers(auth.token, { page, limit, search });
        setUsers(result.users || []);
        setTotal(result.total || 0);
        window.appState.users = result.users || [];
        window.appState.filters = { search, page, limit };
      } catch (err) {
        setError(err.message);
      }
    };

    loadUsers();
  }, [auth.token, page, limit, search]);

  return (
    <div className="card">
      <h2>Users</h2>
      <p>Manage registered users and view the user directory.</p>
      {error && <div className="alert">{error}</div>}
      <div className="filters">
        <input
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search users"
        />
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td>{user.status}</td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan="5">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="button-group" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
        <button type="button" className="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(total / limit))}
        </span>
        <button type="button" className="secondary" onClick={() => setPage((current) => current + 1)} disabled={page >= Math.ceil(total / limit)}>
          Next
        </button>
      </div>
    </div>
  );
}
