/**
 * Componentes de modal reutilizables
 */

import React from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Contenedor backdrop de modal
 */
export const ModalBackdrop = ({ children, onBackdropClick, ...props }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A3B32]/25 backdrop-blur-[2px] transition-all px-4"
    onClick={onBackdropClick}
    role="dialog"
    aria-modal="true"
    {...props}
  >
    {children}
  </div>
);

/**
 * Contenedor de contenido del modal
 */
export const ModalContent = ({ children, maxWidth = 'max-w-md', className = '', ...props }) => (
  <div 
    className={`bg-white w-full ${maxWidth} rounded-xl shadow-2xl overflow-hidden transform transition-all ${className}`}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
);

/**
 * Visualización de mensaje de éxito
 */
export const SuccessMessage = ({ title, message, icon: Icon = CheckCircle }) => (
  <div className="p-8 text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="text-green-600" size={32} />
    </div>
    <h3 className="text-2xl font-bold text-[#4A3B32] mb-2">
      {title}
    </h3>
    <p className="text-[#4A3B32]/70">
      {message}
    </p>
  </div>
);

/**
 * Alerta de mensaje de error
 */
export const ErrorAlert = ({ title, message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
    <div>
      <p className="text-red-800 font-medium text-sm">{title}</p>
      {message && <p className="text-red-700 text-sm mt-1">{message}</p>}
    </div>
  </div>
);

/**
 * Contenido de botón de carga
 */
export const LoadingButton = ({ text, icon: Icon = Loader2 }) => (
  <span className="flex items-center justify-center gap-2">
    <Icon className="animate-spin" size={18} />
    {text}
  </span>
);

/**
 * Botón de cerrar modal
 */
export const ModalCloseButton = ({ onClick, disabled, label = 'Cerrar' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-[#4A3B32]/60 hover:text-[#4A3B32] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
    aria-label={label}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);
