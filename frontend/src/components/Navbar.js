import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🛫 EAA Recruit</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/" className="nav-link">Home</Link>
            {isAdmin && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
            <div className="user-info">
              <span className="user-name">{user?.full_name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signin" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
