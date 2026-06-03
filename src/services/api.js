const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function request(path, { method = 'GET', body, token, params } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  if (payload == null) {
    return {};
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return { ...payload, ...payload.data };
  }

  return payload;
}

export { request };
