import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css'; // Let's create an Admin.css

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Basic check for admin access (in a real app, this should check user.role)
  // For now, if no user, redirect to login
  if (!user) {
    return (
      <div className="admin-access-denied">
        <p>You must be an admin to view this page.</p>
        <button className="secondary-button" onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-container">
          <div className="admin-logo">ADMIN</div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/movies/add"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            Add Movies
          </NavLink>
          <NavLink
            to="/admin/shows/add"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            Add Shows
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            Users
          </NavLink>
        </nav>

      </aside>

      <main className="admin-main-content">
        <div className="admin-header">
          <h1>ADMIN DASHBOARD</h1>
        </div>
        <div className="admin-content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
