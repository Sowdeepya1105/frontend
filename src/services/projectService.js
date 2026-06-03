import { request } from './api.js';

export const getProjects = (token, params) => request('/projects', { token, params });
export const createProject = (token, payload) => request('/projects', { method: 'POST', token, body: payload });
export const getUsers = (token) => request('/users', { token });
