/**
 * @fileoverview Modal de creación de evaluación con validación de formulario
 * Permite a los clientes calificar trabajadores después de completar una orden
 */

import { useState, useEffect, useRef } from 'react';
import { Loader2, Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import StarRatingInput from '../reviews/StarRatingInput';
import useCreateReview from '../../hooks/useCreateReview';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { ModalBackdrop, ModalContent, SuccessMessage, ErrorAlert, ModalCloseButton } from '../common/ModalComponents';

const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_REVIEW_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

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
      setImageFile(null);
      setImagePreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_REVIEW_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('reviews.imageTypeError', 'Formato no soportado. Usa JPG, PNG o WEBP.'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_REVIEW_IMAGE_BYTES) {
      toast.error(t('reviews.imageSizeError', 'La imagen excede 5MB.'));
      e.target.value = '';
      return;
    }
    setImageFile(file);
    setImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImagePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

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
    await submitReview({ rating, comment, image: imageFile });
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

              {/* Foto opcional */}
              <div>
                <label className="block text-sm font-medium text-[#4A3B32] mb-2">
                  {t('reviews.imageLabel', 'Foto del trabajo')}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    ({t('common.optional')})
                  </span>
                </label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={submitting}
                  className="hidden"
                />
                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={submitting}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-primary/5 hover:border-primary px-4 py-5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="mx-auto mb-1.5 h-6 w-6 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      {t('reviews.imageUpload', 'Adjuntar foto')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('reviews.imageHint', 'JPG, PNG o WEBP. Máximo 5MB.')}
                    </p>
                  </button>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="review"
                      className="w-full h-44 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleImageClear}
                      disabled={submitting}
                      className="absolute top-2 right-2 bg-white border border-neutral-dark/20 rounded-full p-1.5 shadow hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                      title={t('reviews.imageRemove', 'Quitar foto')}
                    >
                      <X size={16} className="text-red-600" />
                    </button>
                    <p className="text-xs text-primary mt-2 font-medium truncate">
                      {imageFile?.name}
                    </p>
                  </div>
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
