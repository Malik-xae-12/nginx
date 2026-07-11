import { useState, useEffect } from 'react';
import { HiOutlineCube, HiOutlineTag, HiOutlineCurrencyRupee, HiOutlineExclamation } from 'react-icons/hi';
import { getDashboardStats, getProducts, getCategories } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, productsRes, categoriesRes] = await Promise.all([
          getDashboardStats(),
          getProducts(),
          getCategories(),
        ]);
        setStats(statsRes.data);
        setRecentProducts(productsRes.data.slice(-8).reverse());
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStockBadge = (qty) => {
    if (qty < 10) return <span className="badge stock-critical">Critical</span>;
    if (qty < 25) return <span className="badge stock-low">Low Stock</span>;
    return <span className="badge stock-ok">In Stock</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome back! Here's your inventory overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card indigo">
          <div className="stat-icon"><HiOutlineCube /></div>
          <div className="stat-value">{stats?.total_products || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon"><HiOutlineTag /></div>
          <div className="stat-value">{stats?.total_categories || 0}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon"><HiOutlineCurrencyRupee /></div>
          <div className="stat-value">{formatCurrency(stats?.total_stock_value || 0)}</div>
          <div className="stat-label">Stock Value</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon"><HiOutlineExclamation /></div>
          <div className="stat-value">{stats?.low_stock_count || 0}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Recent Products */}
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Products</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
                <tr key={p.product_id}>
                  <td>{p.product_name}</td>
                  <td><span className="badge category">{p.category_name}</span></td>
                  <td><span className="price">{formatCurrency(p.price)}</span></td>
                  <td>{p.stock_quantity}</td>
                  <td>{getStockBadge(p.stock_quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Categories Overview */}
        <div className="table-container">
          <div className="table-header">
            <h3>Categories</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th style={{ textAlign: 'right' }}>Products</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.category_id}>
                  <td>{c.category_name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge category">{c.product_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
