// src/components/portfolio/ImageViewerModal.jsx
import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

const ImageViewerModal = ({ 
  isOpen, 
  onClose, 
  item, 
  items = [], 
  currentIndex = 0,
  onNavigate 
}) => {
  const { t, i18n } = useTranslation();

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate?.(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate?.(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, handlePrevious, handleNext]);

  if (!isOpen || !item) return null;

  const formattedDate = item.created_at
    ? format(new Date(item.created_at), 'PPP', {
        locale: i18n.language === 'es' ? es : enUS,
      })
    : '';

  const hasMultipleImages = items.length > 1;
  const showPrevious = hasMultipleImages && currentIndex > 0;
  const showNext = hasMultipleImages && currentIndex < items.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        aria-label={t('common.close')}
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation Buttons */}
      {showPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {showNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
          aria-label={t('common.next')}
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Content Container */}
      <div 
        className="max-w-6xl w-full max-h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Container */}
        <div className="relative flex-1 flex items-center justify-center mb-4">
          <img
            src={item.image_url}
            alt={item.title}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.src = '/fallback-image.png';
            }}
          />
          
          {/* Verified Badge */}
          {item.order_info && (
            <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-green-500 px-3 py-2 shadow-lg">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">
                {t('portfolio.verified')}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              {formattedDate && (
                <p className="text-sm text-white/70 mb-3">{formattedDate}</p>
              )}
              {item.description && (
                <p className="text-white/90 leading-relaxed">{item.description}</p>
              )}
              {item.order_info && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-white/70">
                    {t('portfolio.orderInfo.linkedTo')} 
                    <span className="font-medium text-white ml-1">
                      {t('portfolio.orderInfo.order')} #{item.order_info.id}
                    </span>
                  </p>
                  <p className="text-sm text-white/90 mt-1">
                    {t('portfolio.orderInfo.client')}: {item.order_info.client_name}
                  </p>
                </div>
              )}
            </div>
            
            {hasMultipleImages && (
              <div className="text-sm text-white/70 whitespace-nowrap">
                {currentIndex + 1} / {items.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
