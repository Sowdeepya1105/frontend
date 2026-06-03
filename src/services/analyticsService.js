import { request } from './api.js';

export const getIssueAnalytics = (token) => request('/analytics/issues', { token });
export const getProjectAnalytics = (token) => request('/analytics/projects', { token });
export const getDeveloperAnalytics = (token) => request('/analytics/developers', { token });
