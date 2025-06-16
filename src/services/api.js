const BASE_URL = 'https://api.sentinova.my.id/'

export const api = {
  // Fungsi helper untuk melakukan HTTP requests
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
  async postFormData(endpoint, formData) {
    return this.fetchWithError(endpoint, {
      method: 'POST',
      body: formData,
      
    });
  },
}; 