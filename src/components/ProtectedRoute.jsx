/**
 * ProtectedRoute Component
 * -----------------------------------------------------------
 * A wrapper component that checks if a user is authenticated.
 * If not authenticated, redirects the user to the login page.
 * -----------------------------------------------------------
 */
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that should only be accessible to logged-in users.
 * @param {object} props.children - The child components (the protected page) to render if authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
