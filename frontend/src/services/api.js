const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ewaste_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errData.message || JSON.stringify(errData);
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getMe: () => request('/auth/me'),

  // AI Detection
  detectEwaste: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return request('/detect-ewaste', {
      method: 'POST',
      body: formData
    });
  },

  getDetections: () => request('/detections'),

  // Collection Requests
  createRequest: (data) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getRequests: () => request('/requests'),

  trackRequest: (code) => request(`/requests/track/${encodeURIComponent(code)}`),

  updateRequestStatus: (id, status) =>
    request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  cancelRequest: (id) =>
    request(`/requests/${id}/cancel`, {
      method: 'DELETE'
    }),

  // Centers Locator
  getCenters: (query = '', category = '') => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category && category !== 'All') params.append('category', category);
    return request(`/centers?${params.toString()}`);
  },

  createCenter: (data) =>
    request('/centers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteCenter: (id) =>
    request(`/centers/${id}`, {
      method: 'DELETE'
    }),

  // IoT Bins
  getIoTBins: () => request('/iot/bins'),

  simulateIoTBin: (binCode, fillPercentage, status = 'Normal') =>
    request(`/iot/bins/${encodeURIComponent(binCode)}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ fill_percentage: fillPercentage, status })
    }),

  sendIoTTelemetry: (telemetry) =>
    request('/iot/telemetry', {
      method: 'POST',
      body: JSON.stringify(telemetry)
    }),

  // Analytics
  getAnalyticsOverview: () => request('/analytics/overview'),

  // Admin
  getAdminUsers: () => request('/admin/users'),

  getExportCsvUrl: () => `${API_BASE}/admin/export-requests-csv`
};
