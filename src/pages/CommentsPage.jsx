import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { deleteComment, getComments } from '../services/commentService.js';

export default function CommentsPage() {
  const auth = useAuth();
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.token) return;

    const loadComments = async () => {
      setError('');
      try {
        const result = await getComments(auth.token);
        setComments(result.comments || []);
        window.appState.comments = result.comments || [];
      } catch (err) {
        setError(err.message);
      }
    };

    loadComments();
  }, [auth.token]);

  const handleDelete = async (commentId) => {
    setError('');
    try {
      await deleteComment(auth.token, commentId);
      const refreshed = await getComments(auth.token);
      setComments(refreshed.comments || []);
      window.appState.comments = refreshed.comments || [];
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Comments</h2>
      <p>View all comments and delete comments you own.</p>
      {error && <div className="alert">{error}</div>}
      <div className="table-wrapper" style={{ marginTop: '1rem' }}>
        <table>
          <thead>
            <tr>
              <th>Comment</th>
              <th>Issue</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.commentId}>
                <td>{comment.message}</td>
                <td>{comment.issue?.title ?? 'Unknown'}</td>
                <td>{comment.user?.name ?? 'Unknown'}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => handleDelete(comment.commentId)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!comments.length && (
              <tr>
                <td colSpan="4">No comments available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
