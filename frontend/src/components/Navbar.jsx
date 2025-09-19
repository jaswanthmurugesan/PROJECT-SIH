import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo and Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-content">
            <div className="brand-icon">🎯</div>
            <div className="brand-text">
              <span className="brand-name">LearnPath</span>
              <span className="brand-subtitle">AI</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about')}`}>
            About
          </Link>
          <Link to="/features" className={`nav-link ${isActive('/features')}`}>
            Features
          </Link>
          {user ? (
            <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
              My Profile
            </Link>
          ) : null}
          {user ? (
            <Link to="/job-recommendations" className={`nav-link ${isActive('/job-recommendations')}`}>
              Jobs
            </Link>
          ) : null}
        </div>

        {/* User Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                Welcome, {user.firstName || user.email}
              </span>
              <button onClick={onLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className={`btn btn-outline ${isActive('/login')}`}>
                Login
              </Link>
              <Link to="/signup" className={`btn btn-primary ${isActive('/signup')}`}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActive('/')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`mobile-nav-link ${isActive('/about')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/features" 
            className={`mobile-nav-link ${isActive('/features')}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Features
          </Link>
          {user ? (
            <Link 
              to="/profile" 
              className={`mobile-nav-link ${isActive('/profile')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              My Profile
            </Link>
          ) : null}
          {user ? (
            <Link 
              to="/job-recommendations" 
              className={`mobile-nav-link ${isActive('/job-recommendations')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Jobs
            </Link>
          ) : null}
        </div>
        
        <div className="mobile-auth-buttons">
          {user ? (
            <div className="mobile-user-menu">
              <span className="mobile-user-greeting">
                Welcome, {user.firstName || user.email}
              </span>
              <button 
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }} 
                className="btn btn-outline mobile-btn"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-outline mobile-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary mobile-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;