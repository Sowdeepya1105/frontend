import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { createIssue, getIssues } from '../services/issueService.js';
import { getProjects } from '../services/projectService.js';
import { getUsers } from '../services/projectService.js';

const priorities = ['low', 'medium', 'high'];
const severities = ['minor', 'major', 'critical'];
const statuses = ['open', 'in-progress', 'testing', 'resolved', 'closed'];

export default function IssuesPage() {
  const auth = useAuth();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', project: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', severity: 'major', status: 'open', dueDate: '', projectId: '', assignedToId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredIssues = useMemo(() => issues, [issues]);

  useEffect(() => {
    if (!auth.token) return;

    const loadMetadata = async () => {
      setError('');
      try {
        const [projectResult, userResult] = await Promise.all([getProjects(auth.token), getUsers(auth.token)]);
        setProjects(projectResult.projects);
        setUsers(userResult.users);
        if (!form.projectId && projectResult.projects.length) {
          setForm((state) => ({ ...state, projectId: projectResult.projects[0].projectId }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadMetadata();
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token) return;

    const loadIssues = async () => {
      setError('');
      try {
        const issueResult = await getIssues(auth.token, {
          search: filters.search,
          status: filters.status,
          priority: filters.priority,
          project: filters.project,
          page: pagination.page,
          limit: pagination.limit,
        });
        setIssues(issueResult.issues);
        setPagination((current) => ({ ...current, total: issueResult.pagination?.total ?? 0 }));
      } catch (err) {
        setError(err.message);
      }
    };

    loadIssues();
  }, [auth.token, filters, pagination.page, pagination.limit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
    if (name !== 'page' && name !== 'limit') {
      setPagination((current) => ({ ...current, page: 1 }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        reportedById: auth.user.userId,
      };
      await createIssue(auth.token, payload);
      setSuccess('Issue created successfully');
      setForm((current) => ({ ...current, title: '', description: '', dueDate: '', assignedToId: '' }));
      const refreshed = await getIssues(auth.token);
      setIssues(refreshed.issues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Issues</h2>
      <p>Review existing issues and open new tickets for your project team.</p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="alert" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' }}>{success}</div>}

      <div className="card">
        <h3>Report an issue</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="UI alignment issue" />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Describe the problem in detail" />
          </div>
          <div className="field">
            <label htmlFor="projectId">Project</label>
            <select id="projectId" name="projectId" value={form.projectId} onChange={handleChange} required>
              {projects.map((project) => (
                <option key={project.projectId} value={project.projectId}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="assignedToId">Assign to</label>
            <select id="assignedToId" name="assignedToId" value={form.assignedToId} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
              {priorities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="severity">Severity</label>
            <select id="severity" name="severity" value={form.severity} onChange={handleChange}>
              {severities.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              {statuses.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="dueDate">Due date</label>
            <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
          </div>
          <div className="button-group">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Opening issue...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Open issues</h3>
        <div className="filters">
          <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search issues" />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All priorities</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select name="project" value={filters.project} onChange={handleFilterChange}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.projectId} value={project.projectId}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div className="filters" style={{ marginTop: '1rem' }}>
          <label>
            Items per page
            <select
              name="limit"
              value={pagination.limit}
              onChange={(event) => setPagination((current) => ({ ...current, limit: Number(event.target.value), page: 1 }))}
            >
              {[5, 10, 20].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => (
                <tr key={issue.issueId}>
                  <td>
                    <Link to={`/issues/${issue.issueId}`}>{issue.title}</Link>
                  </td>
                  <td>{issue.project?.title ?? 'Unknown'}</td>
                  <td>{issue.assignedTo?.name ?? 'Unassigned'}</td>
                  <td>{issue.status}</td>
                  <td>{issue.priority}</td>
                </tr>
              ))}
              {!filteredIssues.length && (
                <tr>
                  <td colSpan="5">No issues found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="button-group" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
          <button
            type="button"
            className="secondary"
            onClick={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
          </span>
          <button
            type="button"
            className="secondary"
            onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
