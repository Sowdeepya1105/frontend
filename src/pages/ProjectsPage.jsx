import { useEffect, useMemo, useState } from 'react';
import { getProjects, createProject, getUsers } from '../services/projectService.js';
import { useAuth } from '../context/AuthContext.jsx';

const projectStatuses = ['active', 'planned', 'completed', 'archived'];

export default function ProjectsPage() {
  const auth = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', owner: '' });
  const [form, setForm] = useState({ title: '', description: '', ownerId: '', status: 'active', startDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = `${project.title} ${project.description}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = !filters.status || project.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [projects, filters]);

  useEffect(() => {
    if (!auth.token) return;

    const loadData = async () => {
      setError('');
      try {
        const [projectResult, userResult] = await Promise.all([getProjects(auth.token, filters), getUsers(auth.token)]);
        setProjects(projectResult.projects);
        setUsers(userResult.users);
        if (!form.ownerId && userResult.users.length) {
          setForm((state) => ({ ...state, ownerId: userResult.users[0].userId }));
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
  }, [auth.token, filters]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        ownerId: form.ownerId,
        status: form.status,
        startDate: form.startDate || undefined,
      };
      await createProject(auth.token, payload);
      setSuccess('Project created successfully');
      setForm((current) => ({ ...current, title: '', description: '', startDate: '' }));
      const refreshed = await getProjects(auth.token);
      setProjects(refreshed.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Projects</h2>
      <p>Track active projects, search through deliverables, and create new project records.</p>
      {error && <div className="alert">{error}</div>}
      {success && <div className="alert" style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' }}>{success}</div>}

      <div className="card">
        <h3>Create project</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Project title</label>
            <input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="Issue tracker redesign" />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Short summary of goals" />
          </div>
          <div className="field">
            <label htmlFor="ownerId">Owner</label>
            <select id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange} required>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange}>
              {projectStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="startDate">Start date</label>
            <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
          </div>
          <div className="button-group">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>All projects</h3>
        <div className="filters">
          <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search projects" />
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {projectStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select name="owner" value={filters.owner} onChange={handleFilterChange}>
            <option value="">All owners</option>
            {users.map((user) => (
              <option key={user.userId} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Start date</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.projectId}>
                  <td>{project.title}</td>
                  <td>{project.owner?.name ?? 'Unknown'}</td>
                  <td>{project.status}</td>
                  <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {!filteredProjects.length && (
                <tr>
                  <td colSpan="4">No projects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
