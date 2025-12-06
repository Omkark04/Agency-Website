// frontend/src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/auth';
import '../styles/global.css';

const Layout = () => {
  const user = getCurrentUser();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">UdyogWorks</Link>
          <div className="nav-links">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/orders">Orders</Link>
                <Link to="/services">Services</Link>
                <Link to="/media">Media</Link>
                <Link to="/tasks">Tasks</Link>
                <Link to="/users">Users</Link>
                <Link to="/analytics">Analytics</Link>
                <button onClick={logout} className="btn btn-danger">Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;