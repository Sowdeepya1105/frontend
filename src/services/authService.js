import { request } from './api.js';

export const login = (credentials) => request('/auth/login', { method: 'POST', body: credentials });
export const register = (data) => request('/auth/register', { method: 'POST', body: data });
export const fetchProfile = (token) => request('/auth/me', { token });
