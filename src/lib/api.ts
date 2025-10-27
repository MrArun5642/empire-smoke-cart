// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:9005';

// Token management
export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// API request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    setTokens(response.access_token, response.refresh_token);
    return response;
  },

  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    date_of_birth: string;
    username?: string;
  }) => {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/api/v1/auth/me');
  },

  logout: () => {
    clearTokens();
  },
};

// Products API (placeholder for when we get the endpoints)
export const productsAPI = {
  getAll: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return apiRequest(`/api/v1/products?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/v1/products/${id}`);
  },
};

// Categories API (placeholder)
export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/api/v1/categories');
  },
};

// Cart API (placeholder)
export const cartAPI = {
  get: async () => {
    return apiRequest('/api/v1/cart');
  },

  addItem: async (productId: number, quantity: number) => {
    return apiRequest('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateItem: async (itemId: number, quantity: number) => {
    return apiRequest(`/api/v1/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: number) => {
    return apiRequest(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },
};
