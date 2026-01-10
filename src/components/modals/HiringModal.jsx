import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createServiceOrder } from '../../api/orders';
import { Clock, DollarSign } from 'lucide-react';

const HiringModal = ({ isOpen, onClose, workerProfileId, workerName, workerHourlyRate }) => {
  const { t } = useTranslation();
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('HOURLY'); // HOURLY o FIXED
  const [agreedPrice, setAgreedPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setPaymentType('HOURLY');
      setAgreedPrice('');
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

    if (paymentType === 'FIXED' && (!agreedPrice || parseFloat(agreedPrice) <= 0)) {
      setErrorMessage(t('hiringModal.invalidPrice'));
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
      
      // Solo incluir agreed_price si es FIXED
      if (paymentType === 'FIXED') {
        orderData.agreed_price = parseFloat(agreedPrice);
      }
      
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
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#C04A3E] px-6 py-4 flex justify-between items-center sticky top-0 z-10">
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
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-[#4A3B32] mb-3">
                  {t('hiringModal.paymentType')}
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opción: Por Horas */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('HOURLY')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'HOURLY'
                        ? 'border-[#C04A3E] bg-[#C04A3E]/5 shadow-md'
                        : 'border-gray-300 hover:border-[#C04A3E]/30 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Clock 
                        size={24} 
                        className={paymentType === 'HOURLY' ? 'text-[#C04A3E]' : 'text-gray-400'} 
                      />
                      <h4 className="font-bold text-[#4A3B32]">
                        {t('hiringModal.hourly')}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-2">
                      {t('hiringModal.hourlyDesc')}
                    </p>
                    {workerHourlyRate && (
                      <p className="text-sm font-bold text-[#C04A3E]">
                        ${parseFloat(workerHourlyRate).toLocaleString('es-CO')}/hora
                      </p>
                    )}
                  </button>

                  {/* Opción: Precio Fijo */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('FIXED')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'FIXED'
                        ? 'border-[#C04A3E] bg-[#C04A3E]/5 shadow-md'
                        : 'border-gray-300 hover:border-[#C04A3E]/30 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign 
                        size={24} 
                        className={paymentType === 'FIXED' ? 'text-[#C04A3E]' : 'text-gray-400'} 
                      />
                      <h4 className="font-bold text-[#4A3B32]">
                        {t('hiringModal.fixed')}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t('hiringModal.fixedDesc')}
                    </p>
                  </button>
                </div>
              </div>

              {/* Precio Acordado (solo si FIXED) */}
              {paymentType === 'FIXED' && (
                <div>
                  <label 
                    htmlFor="agreed-price" 
                    className="block text-sm font-medium text-[#4A3B32] mb-2"
                  >
                    {t('hiringModal.agreedPrice')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      $
                    </span>
                    <input
                      id="agreed-price"
                      type="number"
                      min="1000"
                      step="1000"
                      value={agreedPrice}
                      onChange={(e) => {
                        setAgreedPrice(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="200000"
                      className="w-full pl-8 pr-4 py-3 text-[#4A3B32] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C04A3E] focus:border-transparent text-lg font-semibold"
                      disabled={isLoading}
                      required={paymentType === 'FIXED'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {t('hiringModal.agreedPriceHint')}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
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

              {/* Summary Card */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-bold text-[#4A3B32] mb-3 text-sm">
                  {t('hiringModal.summary')}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('hiringModal.paymentMethod')}:</span>
                    <span className="font-semibold text-[#4A3B32]">
                      {paymentType === 'HOURLY' ? t('hiringModal.hourly') : t('hiringModal.fixed')}
                    </span>
                  </div>
                  {paymentType === 'FIXED' && agreedPrice && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">{t('hiringModal.total')}:</span>
                      <span className="font-bold text-[#C04A3E] text-lg">
                        ${parseFloat(agreedPrice).toLocaleString('es-CO')}
                      </span>
                    </div>
                  )}
                  {paymentType === 'HOURLY' && workerHourlyRate && (
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">{t('hiringModal.ratePerHour')}:</span>
                      <span className="font-bold text-[#C04A3E]">
                        ${parseFloat(workerHourlyRate).toLocaleString('es-CO')}/h
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div 
                  className="p-3 bg-red-50 border border-red-200 text-[#C04A3E] text-sm rounded-md flex items-start gap-2"
                  role="alert"
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Buttons */}
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
                  disabled={
                    isLoading || 
                    !description.trim() || 
                    description.length < 10 ||
                    (paymentType === 'FIXED' && (!agreedPrice || parseFloat(agreedPrice) <= 0))
                  }
                  className={`px-5 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C04A3E] transition-all ${
                    isLoading || 
                    !description.trim() || 
                    description.length < 10 ||
                    (paymentType === 'FIXED' && (!agreedPrice || parseFloat(agreedPrice) <= 0))
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
