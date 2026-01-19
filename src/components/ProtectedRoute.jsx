import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de ruta protegida que requiere autenticación
 * Opcionalmente puede requerir un rol específico (ej: ADMIN)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const isAdmin = user.role === 'ADMIN' || user.is_superuser;
    
    if (requiredRole === 'ADMIN' && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['ADMIN', 'CLIENT', 'WORKER']),
};

export default ProtectedRoute;
