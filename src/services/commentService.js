import { request } from './api.js';

export const getComments = (token, issueId) => request('/comments', { token, params: { issueId } });
export const createComment = (token, payload) => request('/comments', { method: 'POST', token, body: payload });
export const deleteComment = (token, id) => request(`/comments/${id}`, { method: 'DELETE', token });
