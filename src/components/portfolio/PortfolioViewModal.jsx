// src/components/portfolio/PortfolioViewModal.jsx
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModalBackdrop, ModalContent } from '../common/ModalComponents';
import PortfolioGrid from './PortfolioGrid';

const PortfolioViewModal = ({ isOpen, onClose, items, loading, isOwnPortfolio = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleManagePortfolio = () => {
    onClose();
    navigate('/worker/portfolio');
  };

  return (
    <ModalBackdrop onBackdropClick={onClose}>
      <ModalContent maxWidth="max-w-6xl" ref={modalRef} className="max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-neutral-dark">
              {t('portfolio.publicPortfolioTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {items?.length > 0 
                ? t('portfolio.projectCount', { count: items.length })
                : t('portfolio.emptyState')
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOwnPortfolio && (
              <button
                type="button"
                onClick={handleManagePortfolio}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} />
                {t('portfolio.manageMyPortfolio')}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-dark hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded p-2"
            >
              <X className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">{t('common.close')}</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <PortfolioGrid
              items={items}
              readonly={true}
              currentLang={i18n.language}
              variant="large"
            />
          )}
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default PortfolioViewModal;
