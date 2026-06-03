import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getIssueById, assignIssue, updateIssueStatus } from '../services/issueService.js';
import { createComment, getComments } from '../services/commentService.js';
import { getUsers } from '../services/projectService.js';

const statuses = ['open', 'in-progress', 'testing', 'resolved', 'closed'];

export default function IssueDetailPage() {
  const { id } = useParams();
  const auth = useAuth();
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('open');
  const [assignedToId, setAssignedToId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth.token) return;

    const loadIssue = async () => {
      setError('');
      try {
        const [issueResult, commentResult, userResult] = await Promise.all([
          getIssueById(auth.token, id),
          getComments(auth.token, id),
          getUsers(auth.token),
        ]);
        setIssue(issueResult.issue);
        setComments(commentResult.comments);
        setUsers(userResult.users);
        setSelectedStatus(issueResult.issue.status);
        setAssignedToId(issueResult.issue.assignedTo?.userId || '');
      } catch (err) {
        setError(err.message);
      }
    };

    loadIssue();
  }, [auth.token, id]);

  const refreshIssue = async () => {
    const [issueResult, commentResult] = await Promise.all([
      getIssueById(auth.token, id),
      getComments(auth.token, id),
    ]);
    setIssue(issueResult.issue);
    setComments(commentResult.comments);
    setSelectedStatus(issueResult.issue.status);
    setAssignedToId(issueResult.issue.assignedTo?.userId || '');
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    setError('');
    setLoading(true);

    try {
      await createComment(auth.token, { issueId: id, message });
      await refreshIssue();
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setError('');
    setLoading(true);

    try {
      await updateIssueStatus(auth.token, id, { status: selectedStatus });
      await refreshIssue();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    setError('');
    setLoading(true);

    try {
      await assignIssue(auth.token, id, { assignedToId });
      await refreshIssue();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!issue) {
    return <div className="card">Loading issue details…</div>;
  }

  return (
    <div className="card">
      <h2>{issue.title}</h2>
      <p>{issue.description || 'No description provided.'}</p>
      {error && <div className="alert">{error}</div>}
      <div className="info-row">
        <div className="info-card">
          <strong>Status</strong>
          <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
        </div>
        <div className="info-card">
          <strong>Priority</strong>
          <p>{issue.priority}</p>
        </div>
        <div className="info-card">
          <strong>Severity</strong>
          <p>{issue.severity}</p>
        </div>
      </div>
      <div className="info-row" style={{ marginTop: '1rem' }}>
        <div className="info-card">
          <strong>Project</strong>
          <p>{issue.project?.title ?? 'Unknown'}</p>
        </div>
        <div className="info-card">
          <strong>Assigned to</strong>
          <p>{issue.assignedTo?.name ?? 'Unassigned'}</p>
        </div>
        <div className="info-card">
          <strong>Reported by</strong>
          <p>{issue.reportedBy?.name ?? 'Unknown'}</p>
        </div>
      </div>

      {(auth.user?.role === 'admin' || auth.user?.role === 'manager') && (
        <div className="card">
          <h3>Manage issue</h3>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="status">Change status</label>
              <select id="status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="button-group">
              <button type="button" className="secondary" onClick={handleStatusUpdate} disabled={loading}>
                Update status
              </button>
            </div>
            <div className="field">
              <label htmlFor="assignedTo">Assign to user</label>
              <select id="assignedTo" value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="button-group">
              <button type="button" className="secondary" onClick={handleAssign} disabled={loading}>
                Assign issue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Comments</h3>
        <form className="form-grid" onSubmit={handleCommentSubmit}>
          <div className="field">
            <label htmlFor="comment">Add a comment</label>
            <textarea id="comment" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Leave a status update or ask a question" />
          </div>
          <div className="button-group">
            <button type="submit" className="primary" disabled={loading}>
              {loading ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
        <div>
          {comments.length ? (
            comments.map((comment) => (
              <div key={comment.commentId} className="card" style={{ marginBottom: '1rem' }}>
                <p>{comment.message}</p>
                <small>
                  {comment.user?.name ?? 'Unknown'} • {new Date(comment.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
