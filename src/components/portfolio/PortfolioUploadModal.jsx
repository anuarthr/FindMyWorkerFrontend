// src/components/portfolio/PortfolioUploadModal.jsx
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { ModalBackdrop, ModalContent } from '../common/ModalComponents';
import { getCompletedOrdersWithoutPortfolio } from '../../api/orders';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const PortfolioUploadModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialItem = null,
  fieldErrors = {},
  uploadProgress = 0,
  isSubmitting = false,
}) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState(initialItem?.title || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialItem?.image_url || null);
  const [localError, setLocalError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(initialItem?.order || null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const modalRef = useRef(null);

  const isEditMode = Boolean(initialItem);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialItem?.title || '');
      setDescription(initialItem?.description || '');
      setFile(null);
      setPreviewUrl(initialItem?.image_url || null);
      setLocalError(null);
      setSelectedOrder(initialItem?.order || null);
    }
  }, [isOpen, initialItem]);

  // Load completed orders when opening in create mode
  useEffect(() => {
    const loadOrders = async () => {
      if (isOpen && !isEditMode) {
        setLoadingOrders(true);
        try {
          const orders = await getCompletedOrdersWithoutPortfolio();
          setAvailableOrders(orders);
        } catch (error) {
          console.error('Error loading completed orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    loadOrders();
  }, [isOpen, isEditMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus trap básico
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        focusableElements[0]?.focus();
      }
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      setLocalError(t('portfolio.errors.fileTooLarge'));
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!title.trim()) {
      setLocalError(t('portfolio.errors.emptyTitle'));
      return;
    }

    // Crear
    if (!isEditMode) {
      if (!file) {
        setLocalError(t('portfolio.errors.imageRequired'));
        return;
      }
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('image', file);
      
      // Add order relationship if selected
      if (selectedOrder && selectedOrder !== 'external') {
        formData.append('order', selectedOrder);
        formData.append('is_external_work', 'false');
      } else if (selectedOrder === 'external') {
        formData.append('is_external_work', 'true');
      }

      const result = await onSubmit(formData, true);
      if (result?.success) onClose();
      return;
    }

    // Editar
    if (file) {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('image', file);
      const result = await onSubmit(formData, true);
      if (result?.success) onClose();
    } else {
      const payload = {
        title: title.trim(),
        description: description.trim() || '',
      };
      const result = await onSubmit(payload, false);
      if (result?.success) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop onBackdropClick={onClose}>
      <ModalContent maxWidth="max-w-lg" ref={modalRef}>
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#4A3B32]">
              {isEditMode ? t('portfolio.editModalTitle') : t('portfolio.createModalTitle')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-[#4A3B32] hover:text-[#C04A3E] focus:outline-none focus:ring-2 focus:ring-[#C04A3E] rounded"
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t('common.close')}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A3B32]">
                {t('portfolio.fields.title')}
              </label>
              <input
                type="text"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
              {(fieldErrors.title || localError) && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.title || localError}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A3B32]">
                {t('portfolio.fields.description')}
              </label>
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
              />
              {fieldErrors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Order Selector - Only in create mode */}
            {!isEditMode && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[#4A3B32]">
                  {t('portfolio.fields.relatedOrder')}
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    ({t('common.optional')})
                  </span>
                </label>
                {loadingOrders ? (
                  <div className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#C04A3E]"></div>
                    {t('common.loading')}...
                  </div>
                ) : (
                  <select
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
                    value={selectedOrder || ''}
                    onChange={(e) => setSelectedOrder(e.target.value || null)}
                    disabled={isSubmitting}
                  >
                    <option value="">{t('portfolio.fields.noOrder')}</option>
                    <option value="external">{t('portfolio.fields.externalWork')}</option>
                    {availableOrders.map((order) => {
                      const orderDate = order.updated_at 
                        ? format(new Date(order.updated_at), 'PPP', { 
                            locale: i18n.language === 'es' ? es : enUS 
                          })
                        : '';
                      return (
                        <option key={order.id} value={order.id}>
                          {t('portfolio.fields.orderOption', {
                            id: order.id,
                            client: order.client_name,
                            date: orderDate
                          })}
                        </option>
                      );
                    })}
                  </select>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {t('portfolio.fields.orderHint')}
                </p>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[#4A3B32]">
                {isEditMode
                  ? t('portfolio.fields.imageOptional')
                  : t('portfolio.fields.image')}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="w-full text-sm focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
              />
              {fieldErrors.image && (
                <p className="mt-1 text-xs text-red-600">
                  {fieldErrors.image}
                </p>
              )}
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt={title || t('portfolio.imageAltFallback')}
                    className="h-40 w-full rounded object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/fallback-image.png';
                    }}
                  />
                </div>
              )}
            </div>

            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="h-2 w-full rounded bg-gray-200">
                  <div
                    className="h-2 rounded bg-[#C04A3E]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#4A3B32]">
                  {uploadProgress}%
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-gray-300 px-4 py-2 text-sm text-[#4A3B32] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="rounded bg-[#C04A3E] px-4 py-2 text-sm font-medium text-white hover:bg-[#E37B5B] focus:outline-none focus:ring-2 focus:ring-[#C04A3E] disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isEditMode ? t('common.save') : t('common.create')}
              </button>
            </div>
          </form>
        </div>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default PortfolioUploadModal;
