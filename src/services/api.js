const BASE_URL = "https://api.sentinova.my.id";

export const api = {
  async fetchWithError(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        ...(options.body instanceof FormData
          ? {} // FormData => biarkan browser set Content-Type (multi-part)
          : { 'Content-Type': 'application/json' }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  },

  async get(endpoint) {
    return this.fetchWithError(endpoint);
  },

  async post(endpoint, data) {
    return this.fetchWithError(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async put(endpoint, data) {
    return this.fetchWithError(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint) {
    return this.fetchWithError(endpoint, {
      method: 'DELETE',
    });
  },

  // 🔐 GET with Authorization header (e.g. Clerk/Firebase token)
  async getWithAuth(endpoint, token) {
    return this.fetchWithError(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  },

  // 📎 POST with FormData (e.g. file upload)
  async postFormData(endpoint, formData) {
    return this.fetchWithError(endpoint, {
      method: 'POST',
      body: formData,
      // Important: Don't set 'Content-Type' header, let the browser handle it for FormData
    });
  },
};
