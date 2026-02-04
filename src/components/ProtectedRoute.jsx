/**
 * Componente de ruta protegida que requiere autenticación
 * Opcionalmente puede requerir un rol específico (ej: ADMIN)
 * Redirige a login si no está autenticado, o a dashboard si no tiene el rol requerido
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si pasa las validaciones
 * @param {string} [props.requiredRole] - Rol requerido: 'ADMIN', 'CLIENT', o 'WORKER'
 */

import { Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { t } = useTranslation();
  const { user, isAuthenticated, loading } = useAuth();

  // Verificar si el usuario es administrador
  const isAdmin = useMemo(() => 
    user?.role === 'ADMIN' || user?.is_superuser,
    [user]
  );

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-dark">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // No autenticado - redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol requerido
  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['ADMIN', 'CLIENT', 'WORKER']),
};

export default ProtectedRoute;
