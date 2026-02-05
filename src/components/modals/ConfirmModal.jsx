import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { ModalBackdrop, ModalContent } from '../common/ModalComponents';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning'
}) => {
  const { handleBackdropClick } = useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const variants = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertTriangle className="text-yellow-600" size={48} />,
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle className="text-green-600" size={48} />,
      buttonBg: 'bg-green-600 hover:bg-green-700'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <XCircle className="text-red-600" size={48} />,
      buttonBg: 'bg-red-600 hover:bg-red-700'
    }
  };

  const style = variants[variant];

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent className={`border ${style.border}`}>
        
        {/* Icon y Contenido */}
        <div className={`${style.bg} p-8 text-center border-b ${style.border}`}>
          <div className="flex justify-center mb-4">
            {style.icon}
          </div>
          
          <h3 className="text-xl font-bold text-[#4A3B32] mb-2">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer ${style.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default ConfirmModal;
