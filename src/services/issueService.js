import { request } from './api.js';

export const getIssues = (token, params) => request('/issues', { token, params });
export const getIssueById = (token, id) => request(`/issues/${id}`, { token });
export const createIssue = (token, payload) => request('/issues', { method: 'POST', token, body: payload });
export const updateIssue = (token, id, payload) => request(`/issues/${id}`, { method: 'PATCH', token, body: payload });
export const assignIssue = (token, id, payload) => request(`/issues/${id}/assign`, { method: 'PATCH', token, body: payload });
export const updateIssueStatus = (token, id, payload) => request(`/issues/${id}/status`, { method: 'PATCH', token, body: payload });
export const deleteIssue = (token, id) => request(`/issues/${id}`, { method: 'DELETE', token });
