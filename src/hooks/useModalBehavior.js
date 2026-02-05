/**
 * Hook personalizado para gestión de comportamiento de modales
 * Maneja tecla escape, bloqueo de scroll del body y clicks en backdrop
 */

import { useEffect, useCallback } from 'react';

/**
 * Hook para gestionar interacciones y comportamiento de modales
 * @param {boolean} isOpen - Estado de visibilidad del modal
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {boolean} [canClose=true] - Si el modal puede cerrarse (ej., durante carga)
 * @returns {Object} Funciones manejadoras para clicks en backdrop
 */
export const useModalBehavior = (isOpen, onClose, canClose = true) => {
  // Manejar presión de tecla escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && canClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, canClose, onClose]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar click en backdrop
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget && canClose) {
        onClose();
      }
    },
    [canClose, onClose]
  );

  return { handleBackdropClick };
};
