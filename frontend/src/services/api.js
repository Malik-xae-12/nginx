import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Categories ─────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');
export const getCategory = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ── Products ───────────────────────────────────────────────────
export const getProducts = (categoryId) => {
  const params = categoryId ? { category_id: categoryId } : {};
  return api.get('/products', { params });
};
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// ── Dashboard ──────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard');

export default api;
