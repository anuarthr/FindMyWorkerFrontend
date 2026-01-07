import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createServiceOrder } from '../../api/orders';

const HiringModal = ({ isOpen, onClose, workerProfileId, workerName }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setStatus('idle');
      setErrorMessage('');
      setIsLoading(false);
      
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage(t('hiringModal.descriptionTooShort'));
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const orderData = {
        worker: workerProfileId,
        description: description.trim()
      };
      
      const createdOrder = await createServiceOrder(orderData);
      console.log('Order created:', createdOrder);
      
      setStatus('success');
      
      setTimeout(() => {
        onClose(createdOrder);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create order:', error);
      setErrorMessage(error.message || t('hiringModal.errorMessage'));
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading && status !== 'success') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A3B32]/25 backdrop-blur-[2px] transition-all px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#C04A3E] px-6 py-4 flex justify-between items-center">
          <h3 
            id="modal-title"
            className="text-xl font-bold text-[#EFE6DD]"
          >
            {t('hiringModal.title', { name: workerName })}
          </h3>
          {!isLoading && status !== 'success' && (
            <button
              onClick={onClose}
              className="text-[#EFE6DD] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#C04A3E] rounded"
              aria-label={t('common.close', 'Cerrar')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#556B2F]">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-lg font-semibold text-center mb-2">
                {t('hiringModal.successMessage')}
              </p>
              <p className="text-sm text-gray-600 text-center">
                {t('hiringModal.successSubtext')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label 
                  htmlFor="job-description" 
                  className="block text-sm font-medium text-[#4A3B32] mb-2"
                >
                  {t('hiringModal.descriptionLabel')}
                </label>
                <textarea
                  ref={textareaRef}
                  id="job-description"
                  rows="5"
                  className="w-full px-3 py-2 text-[#4A3B32] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C04A3E] focus:border-transparent resize-none"
                  placeholder={t('hiringModal.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  required
                  minLength={10}
                  maxLength={1000}
                  aria-describedby="char-count"
                  aria-invalid={!!errorMessage}
                ></textarea>
                <p id="char-count" className="text-xs text-gray-500 mt-1">
                  {description.length}/1000 {t('hiringModal.characters')}
                </p>
              </div>

              {errorMessage && (
                <div 
                  className="mb-4 p-3 bg-red-50 border border-red-200 text-[#C04A3E] text-sm rounded-md flex items-start gap-2"
                  role="alert"
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-medium text-[#4A3B32] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#4A3B32] focus:ring-offset-2"
                  disabled={isLoading}
                >
                  {t('hiringModal.cancelButton')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !description.trim() || description.length < 10}
                  className={`px-5 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C04A3E] transition-all ${
                    isLoading || !description.trim() || description.length < 10
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#C04A3E] hover:bg-[#a83f34] shadow-sm'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('hiringModal.sending')}
                    </span>
                  ) : (
                    t('hiringModal.submitButton')
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default HiringModal;
