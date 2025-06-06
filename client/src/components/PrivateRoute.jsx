import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!loading && !currentUser) {
    // Save the attempted url for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a user, render the protected component
  return children;
} 