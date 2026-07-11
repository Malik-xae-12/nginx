import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const emptyForm = {
  product_name: '',
  category_id: '',
  price: '',
  stock_quantity: '',
  sku: '',
  description: '',
};

export default function Products({ addToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts(filterCat || undefined),
        getCategories(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterCat]);

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStockBadge = (qty) => {
    if (qty < 10) return <span className="badge stock-critical">Critical ({qty})</span>;
    if (qty < 25) return <span className="badge stock-low">Low ({qty})</span>;
    return <span className="badge stock-ok">{qty}</span>;
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (prod) => {
    setEditing(prod);
    setForm({
      product_name: prod.product_name,
      category_id: prod.category_id,
      price: prod.price,
      stock_quantity: prod.stock_quantity,
      sku: prod.sku || '',
      description: prod.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.product_name.trim() || !form.category_id || !form.price) {
      addToast('Name, category, and price are required', 'error');
      return;
    }
    const payload = {
      ...form,
      category_id: parseInt(form.category_id),
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity) || 0,
    };
    try {
      if (editing) {
        await updateProduct(editing.product_id, payload);
        addToast('Product updated successfully');
      } else {
        await createProduct(payload);
        addToast('Product created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(confirmDelete.product_id);
      addToast('Product deleted successfully');
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Delete failed', 'error');
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <HiPlus /> Add Product
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>{filtered.length} Products</h3>
          <div className="table-toolbar">
            <div className="search-box">
              <HiSearch className="search-icon" />
              <input
                placeholder="Search products or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem', appearance: 'auto' }}
              value={filterCat}
              onChange={(e) => { setFilterCat(e.target.value); setLoading(true); }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found</p>
            <button className="btn btn-primary" onClick={openAdd}><HiPlus /> Add Product</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.product_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.product_name}</div>
                    {p.description && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td>{p.sku ? <span className="sku">{p.sku}</span> : '—'}</td>
                  <td><span className="badge category">{p.category_name}</span></td>
                  <td><span className="price">{formatCurrency(p.price)}</span></td>
                  <td>{getStockBadge(p.stock_quantity)}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon edit" onClick={() => openEdit(p)} title="Edit">
                        <HiPencil />
                      </button>
                      <button className="btn-icon delete" onClick={() => setConfirmDelete(p)} title="Delete">
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          title={editing ? 'Edit Product' : 'Add Product'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editing ? 'Update' : 'Create'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label>Product Name</label>
            <input
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              placeholder="Enter product name"
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. ELEC-IP15P"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description (optional)"
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message={`This will permanently delete "${confirmDelete.product_name}". This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
