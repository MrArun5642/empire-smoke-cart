// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5009';

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

// Products API
export const productsAPI = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    category_id?: number;
    subcategory_id?: number;
    brand_id?: number;
    search?: string;
    is_featured?: boolean;
    is_new_arrival?: boolean;
    is_best_seller?: boolean;
    is_on_sale?: boolean;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.subcategory_id) queryParams.append('subcategory_id', params.subcategory_id.toString());
    if (params?.brand_id) queryParams.append('brand_id', params.brand_id.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_featured !== undefined) queryParams.append('is_featured', params.is_featured.toString());
    if (params?.is_new_arrival !== undefined) queryParams.append('is_new_arrival', params.is_new_arrival.toString());
    if (params?.is_best_seller !== undefined) queryParams.append('is_best_seller', params.is_best_seller.toString());
    if (params?.is_on_sale !== undefined) queryParams.append('is_on_sale', params.is_on_sale.toString());
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    return apiRequest(`/api/v1/products/?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/v1/products/${id}`);
  },

  getBySlug: async (slug: string) => {
    return apiRequest(`/api/v1/products/slug/${slug}`);
  },

  getFeatured: async (limit: number = 10) => {
    return apiRequest(`/api/v1/products/featured/list?limit=${limit}`);
  },

  getNewArrivals: async (limit: number = 10) => {
    return apiRequest(`/api/v1/products/new-arrivals/list?limit=${limit}`);
  },

  getBestSellers: async (limit: number = 10) => {
    return apiRequest(`/api/v1/products/best-sellers/list?limit=${limit}`);
  },

  getOnSale: async (limit: number = 10) => {
    return apiRequest(`/api/v1/products/on-sale/list?limit=${limit}`);
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (activeOnly: boolean = true) => {
    const queryParams = new URLSearchParams();
    queryParams.append('active_only', activeOnly.toString());
    return apiRequest(`/api/v1/categories/?${queryParams.toString()}`);
  },

  getById: async (id: number) => {
    return apiRequest(`/api/v1/categories/${id}`);
  },

  getBySlug: async (slug: string) => {
    return apiRequest(`/api/v1/categories/slug/${slug}`);
  },

  getSubcategories: async (categoryId: number, activeOnly: boolean = true) => {
    const queryParams = new URLSearchParams();
    queryParams.append('active_only', activeOnly.toString());
    return apiRequest(`/api/v1/categories/${categoryId}/subcategories?${queryParams.toString()}`);
  },
};

// Brands API
export const brandsAPI = {
  getAll: async (featuredOnly: boolean = false) => {
    const queryParams = new URLSearchParams();
    if (featuredOnly) queryParams.append('featured_only', 'true');
    return apiRequest(`/api/v1/brands/?${queryParams.toString()}`);
  },

  getById: async (id: number) => {
    return apiRequest(`/api/v1/brands/${id}`);
  },

  getBySlug: async (slug: string) => {
    return apiRequest(`/api/v1/brands/slug/${slug}`);
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
    return apiRequest('/api/v1/cart/clear', {
      method: 'DELETE',
    });
  },

  getCount: async () => {
    return apiRequest('/api/v1/cart/count');
  },
};

// Orders API
export const ordersAPI = {
  create: async (shippingAddressId: string, billingAddressId: string, paymentMethod: string) => {
    return apiRequest('/api/v1/orders/', {
      method: 'POST',
      body: JSON.stringify({
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId,
        payment_method: paymentMethod,
      }),
    });
  },

  getAll: async (params?: { status_filter?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return apiRequest(`/api/v1/orders/?${queryParams.toString()}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/api/v1/orders/${id}`);
  },

  getByOrderNumber: async (orderNumber: string) => {
    return apiRequest(`/api/v1/orders/number/${orderNumber}`);
  },

  cancel: async (id: string) => {
    return apiRequest(`/api/v1/orders/${id}/cancel`, {
      method: 'POST',
    });
  },
};

// Admin Dashboard API
export const adminDashboardAPI = {
  getStats: async () => {
    return apiRequest('/api/v1/admin/dashboard/stats');
  },

  getRecentOrders: async (limit: number = 10) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    return apiRequest(`/api/v1/admin/dashboard/recent-orders?${queryParams.toString()}`);
  },

  getTopProducts: async (params?: { limit?: number; days?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.days) queryParams.append('days', params.days.toString());
    return apiRequest(`/api/v1/admin/dashboard/top-products?${queryParams.toString()}`);
  },

  getRevenueChart: async (days: number = 30) => {
    const queryParams = new URLSearchParams();
    queryParams.append('days', days.toString());
    return apiRequest(`/api/v1/admin/dashboard/revenue-chart?${queryParams.toString()}`);
  },
};

// Admin Products API
export const adminProductsAPI = {
  create: async (productData: {
    product_name: string;
    category_id: number;
    base_price: number;
    description?: string;
    short_description?: string;
    brand_id?: number;
    subcategory_id?: number;
    sku?: string;
    quantity_available?: number;
  }) => {
    return apiRequest('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  update: async (productId: string, updateData: {
    product_name?: string;
    description?: string;
    short_description?: string;
    category_id?: number;
    subcategory_id?: number;
    brand_id?: number;
    sku?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }) => {
    return apiRequest(`/api/v1/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  updatePrice: async (productId: string, priceData: {
    base_price?: number;
    sale_price?: number;
    is_on_sale?: boolean;
    discount_percentage?: number;
  }) => {
    return apiRequest(`/api/v1/admin/products/${productId}/price`, {
      method: 'PUT',
      body: JSON.stringify(priceData),
    });
  },

  updateInventory: async (productId: string, inventoryData: {
    quantity_available?: number;
    reorder_level?: number;
  }) => {
    return apiRequest(`/api/v1/admin/products/${productId}/inventory`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData),
    });
  },

  delete: async (productId: string) => {
    return apiRequest(`/api/v1/admin/products/${productId}`, {
      method: 'DELETE',
    });
  },
};

// Admin Orders API
export const adminOrdersAPI = {
  getAll: async (params?: { page?: number; page_size?: number; status_filter?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status_filter) queryParams.append('status_filter', params.status_filter);

    return apiRequest(`/api/v1/admin/orders?${queryParams.toString()}`);
  },

  updateStatus: async (orderId: string, orderStatus: string) => {
    return apiRequest(`/api/v1/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ order_status: orderStatus }),
    });
  },
};

// Admin Inventory API
export const adminInventoryAPI = {
  getLowStock: async () => {
    return apiRequest('/api/v1/admin/inventory/low-stock');
  },

  getOutOfStock: async () => {
    return apiRequest('/api/v1/admin/inventory/out-of-stock');
  },
};

// Banners API
export const bannersAPI = {
  getActive: async () => {
    return apiRequest('/api/v1/banners/active');
  },
};
