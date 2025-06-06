import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="netflix-nav fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-netflix-red">DevLinkUp</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/discover" className="netflix-link px-3 py-2 rounded-md text-sm font-medium">
                  Discover
                </Link>
                {currentUser && (
                  <>
                    <Link to="/dashboard" className="netflix-link px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/projects" className="netflix-link px-3 py-2 rounded-md text-sm font-medium">
                      Projects
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/profile/${currentUser._id}`}
                    className="netflix-link text-sm font-medium"
                  >
                    {currentUser.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="netflix-button text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="netflix-link text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="netflix-button text-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 