/**
 * @fileoverview Modal de creación de evaluación con validación de formulario
 * Permite a los clientes calificar trabajadores después de completar una orden
 */

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import StarRatingInput from '../reviews/StarRatingInput';
import useCreateReview from '../../hooks/useCreateReview';

/**
 * ReviewModal - Diálogo modal para crear evaluaciones de trabajadores
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibilidad del modal
 * @param {Function} props.onClose - Callback de cierre
 * @param {number} props.orderId - ID de la orden a evaluar
 * @param {string} props.workerName - Nombre completo del trabajador
 * @param {Function} props.onSuccess - Callback de éxito con la evaluación creada
 */
const ReviewModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  workerName,
  onSuccess 
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { 
    submitReview, 
    submitting, 
    error, 
    fieldErrors, 
    success,
    createdReview,
    reset 
  } = useCreateReview(orderId);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment('');
      setShowSuccess(false);
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (success && createdReview) {
      setShowSuccess(true);
      
      const timer = setTimeout(() => {
        onSuccess(createdReview);
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, createdReview, onSuccess, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReview({ rating, comment });
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const commentLength = comment.trim().length;
  const isCommentValid = commentLength >= 10;
  const canSubmit = rating > 0 && isCommentValid && !submitting;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[#4A3B32] mb-2">
              {t('reviews.successTitle')}
            </h3>
            <p className="text-[#4A3B32]/70">
              {t('reviews.successMessage')}
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-[#4A3B32]/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#4A3B32]">
                    {t('reviews.evaluateWorker')}
                  </h2>
                  <p className="text-sm text-[#4A3B32]/60 mt-1">
                    {workerName}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="text-[#4A3B32]/60 hover:text-[#4A3B32] transition-colors disabled:opacity-50"
                  aria-label={t('common.close')}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-800 font-medium text-sm">
                      {t('reviews.errorTitle')}
                    </p>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <StarRatingInput
                  value={rating}
                  onChange={setRating}
                  disabled={submitting}
                  error={fieldErrors.rating}
                />
              </div>

              <div>
                <label 
                  htmlFor="comment" 
                  className="block text-sm font-medium text-[#4A3B32] mb-2"
                >
                  {t('reviews.comment')}
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={submitting}
                  placeholder={t('reviews.commentPlaceholder')}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.comment
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-[#4A3B32]/20 focus:ring-[#C04A3E]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-describedby="comment-hint comment-error"
                />
                
                <div className="flex items-center justify-between mt-2">
                  <p 
                    id="comment-hint"
                    className={`text-xs ${
                      isCommentValid 
                        ? 'text-green-600' 
                        : commentLength > 0 
                          ? 'text-amber-600' 
                          : 'text-[#4A3B32]/60'
                    }`}
                  >
                    {isCommentValid 
                      ? '✓ ' + t('reviews.charactersMin', { count: 10 })
                      : t('reviews.charactersCount', { current: commentLength, min: 10 })
                    }
                  </p>
                </div>

                {/* Error de campo */}
                {fieldErrors.comment && (
                  <p id="comment-error" className="text-sm text-red-600 mt-2">
                    {fieldErrors.comment}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-[#4A3B32]/20 text-[#4A3B32] rounded-xl font-medium hover:bg-[#4A3B32]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('reviews.cancel')}
                </button>
                
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 px-6 py-3 bg-[#C04A3E] text-white rounded-xl font-bold hover:bg-[#a83f34] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {t('reviews.submitting')}
                    </>
                  ) : (
                    t('reviews.submitReview')
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

ReviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  orderId: PropTypes.number.isRequired,
  workerName: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default ReviewModal;
