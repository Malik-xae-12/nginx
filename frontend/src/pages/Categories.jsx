import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Categories({ addToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ category_name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (err) {
      addToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    c.category_name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ category_name: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ category_name: cat.category_name, description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.category_name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }
    try {
      if (editing) {
        await updateCategory(editing.category_id, form);
        addToast('Category updated successfully');
      } else {
        await createCategory(form);
        addToast('Category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(confirmDelete.category_id);
      addToast('Category deleted successfully');
      setConfirmDelete(null);
      fetchCategories();
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
          <h2>Categories</h2>
          <p>Manage product categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <HiPlus /> Add Category
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>{filtered.length} Categories</h3>
          <div className="table-toolbar">
            <div className="search-box">
              <HiSearch className="search-icon" />
              <input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>No categories found</p>
            <button className="btn btn-primary" onClick={openAdd}><HiPlus /> Create one</button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cat) => (
                <tr key={cat.category_id}>
                  <td>{cat.category_id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.category_name}</td>
                  <td>{cat.description || '—'}</td>
                  <td><span className="badge category">{cat.product_count}</span></td>
                  <td>{cat.created_date ? new Date(cat.created_date).toLocaleDateString() : '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon edit" onClick={() => openEdit(cat)} title="Edit">
                        <HiPencil />
                      </button>
                      <button className="btn-icon delete" onClick={() => setConfirmDelete(cat)} title="Delete">
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
          title={editing ? 'Edit Category' : 'Add Category'}
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
            <label>Category Name</label>
            <input
              value={form.category_name}
              onChange={(e) => setForm({ ...form, category_name: e.target.value })}
              placeholder="Enter category name"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter description (optional)"
            />
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message={`This will permanently delete "${confirmDelete.category_name}". Any products in this category must be removed first.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
