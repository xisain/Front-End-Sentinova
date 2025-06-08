const BASE_URL = './api';

export const api = {
  // Fungsi helper untuk melakukan HTTP requests
  async fetchWithError(endpoint, options = {}) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Contoh method untuk GET request
  async get(endpoint) {
    return this.fetchWithError(endpoint);
  },

  // Contoh method untuk POST request
  async post(endpoint, data) {
    return this.fetchWithError(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Contoh method untuk PUT request
  async put(endpoint, data) {
    return this.fetchWithError(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Contoh method untuk DELETE request
  async delete(endpoint) {
    return this.fetchWithError(endpoint, {
      method: 'DELETE',
    });
  },
}; 