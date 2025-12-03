// API configuration and helper functions
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : (import.meta.env.VITE_API_BASE_URL || 'https://empiressmokedistribution-production.up.railway.app');

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
  }) => {
    return apiRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/api/v1/auth/me');
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return apiRequest('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  },

  logout: () => {
    clearTokens();
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    category_id?: number;
    search?: string;
    is_featured?: boolean;
    is_on_sale?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
    if (params?.is_on_sale !== undefined) queryParams.append('is_on_sale', params.is_on_sale.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    return apiRequest(`/api/v1/products/?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/v1/products/${id}`);
  },

  getPrice: async (id: string) => {
    return apiRequest(`/api/v1/products/${id}/price`);
  },

  getFeatured: async (limit: number = 10) => {
    return apiRequest(`/api/v1/products/featured/list?limit=${limit}`);
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    return apiRequest('/api/v1/categories/');
  },

  getTree: async () => {
    return apiRequest('/api/v1/categories/tree');
  },

  getById: async (id: number) => {
    return apiRequest(`/api/v1/categories/${id}`);
  },
};

// Brands API
export const brandsAPI = {
  getAll: async () => {
    return apiRequest('/api/v1/brands/');
  },
};

// Cart API
export const cartAPI = {
  get: async () => {
    return apiRequest('/api/v1/cart/');
  },

  addItem: async (productId: string, quantity: number) => {
    return apiRequest('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  updateItem: async (itemId: string, quantity: number) => {
    return apiRequest(`/api/v1/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (itemId: string) => {
    return apiRequest(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return apiRequest('/api/v1/cart/', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  create: async (shippingAddressId: string, billingAddressId?: string) => {
    return apiRequest('/api/v1/orders/', {
      method: 'POST',
      body: JSON.stringify({
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
      }),
    });
  },

  getAll: async () => {
    return apiRequest('/api/v1/orders/');
  },

  getById: async (id: string) => {
    return apiRequest(`/api/v1/orders/${id}`);
  },
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    return apiRequest('/api/v1/users/me');
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
  }) => {
    return apiRequest('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Admin API
export const adminAPI = {
  // Product Management
  createProduct: async (data: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    brand?: string;
    image_url?: string;
    is_featured: boolean;
    category_ids: number[];
  }) => {
    return apiRequest('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (productId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    sale_price?: number;
    stock_quantity?: number;
    brand?: string;
    image_url?: string;
    is_featured?: boolean;
  }) => {
    return apiRequest(`/api/v1/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (productId: string) => {
    return apiRequest(`/api/v1/admin/products/${productId}`, {
      method: 'DELETE',
    });
  },

  // Category Management
  createCategory: async (data: {
    name: string;
    parent_id?: number;
    slug?: string;
  }) => {
    return apiRequest('/api/v1/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteCategory: async (categoryId: number) => {
    return apiRequest(`/api/v1/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // User Management
  getAllUsers: async (params?: {
    page?: number;
    page_size?: number;
    status_filter?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);

    return apiRequest(`/api/v1/admin/users?${queryParams.toString()}`);
  },

  updateUserStatus: async (userId: string, newStatus: string) => {
    return apiRequest(`/api/v1/admin/users/${userId}/status?new_status=${newStatus}`, {
      method: 'PUT',
    });
  },
};
