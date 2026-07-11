import { NavLink } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineCube, HiOutlineTag } from 'react-icons/hi';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">M</div>
        <div>
          <h1>MalikLabs</h1>
          <div className="logo-sub">Inventory System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineViewGrid className="nav-icon" />
          Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineCube className="nav-icon" />
          Products
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineTag className="nav-icon" />
          Categories
        </NavLink>
      </nav>

      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          © 2026 maliklabs.store
        </div>
      </div>
    </aside>
  );
}
