/**
 * @fileoverview Modal de creación de evaluación con validación de formulario
 * Permite a los clientes calificar trabajadores después de completar una orden
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import StarRatingInput from '../reviews/StarRatingInput';
import useCreateReview from '../../hooks/useCreateReview';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { ModalBackdrop, ModalContent, SuccessMessage, ErrorAlert, ModalCloseButton } from '../common/ModalComponents';

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

  const { handleBackdropClick } = useModalBehavior(isOpen, handleClose, !submitting);

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
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent maxWidth="max-w-lg" className="rounded-2xl max-h-[90vh] overflow-y-auto">
        
        {showSuccess ? (
          <SuccessMessage 
            title={t('reviews.successTitle')}
            message={t('reviews.successMessage')}
          />
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
                <ModalCloseButton 
                  onClick={handleClose}
                  disabled={submitting}
                  label={t('common.close')}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {error && (
                <ErrorAlert 
                  title={t('reviews.errorTitle')}
                  message={error}
                />
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
      </ModalContent>
    </ModalBackdrop>
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
