// src/pages/worker/MyPortfolio.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioGrid from '../../components/portfolio/PortfolioGrid';
import PortfolioUploadModal from '../../components/portfolio/PortfolioUploadModal';
import ConfirmModal from '../../components/modals/ConfirmModal';

const MyPortfolio = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    loading,
    error,
    fieldErrors,
    uploadProgress,
    loadMyPortfolio,
    createItem,
    updateItem,
    deleteItem,
  } = usePortfolio();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'WORKER') {
      loadMyPortfolio();
    }
  }, [user, loadMyPortfolio]);

  if (!user || user.role !== 'WORKER') {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <p className="text-sm text-red-600">
            {t('errors.forbidden')}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-primary hover:underline"
          >
            {t('common.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  const handleCreateSubmit = async (payload, isMultipart) => {
    setSubmitting(true);
    const result = await createItem(payload, isMultipart);
    setSubmitting(false);
    return result;
  };

  const handleEditSubmit = async (payload, isMultipart) => {
    if (!editingItem) return { success: false };
    setSubmitting(true);
    const result = await updateItem(editingItem.id, payload, isMultipart);
    setSubmitting(false);
    return result;
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsUploadOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteItem(itemToDelete.id);
    setItemToDelete(null);
  };

  const modalOnSubmit = (payload, isMultipart) =>
    editingItem ? handleEditSubmit(payload, isMultipart) : handleCreateSubmit(payload, isMultipart);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">{t('common.backToDashboard')}</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                <ImageIcon size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {t('portfolio.myPortfolioTitle')}
                </h1>
                <p className="text-white/80 mt-1">
                  {items.length > 0 
                    ? t('portfolio.projectCount', { count: items.length })
                    : t('portfolio.getStarted')
                  }
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsUploadOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Plus className="h-5 w-5" />
              {t('portfolio.addProject')}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {t(error)}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
            <p className="text-sm text-gray-500">{t('common.loading')}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-md p-12 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-dark mb-3">
                {t('portfolio.noProjectsYet')}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {t('portfolio.emptyStateDescription')}
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={20} />
                {t('portfolio.uploadFirstProject')}
              </button>
            </div>
          </div>
        ) : (
          <PortfolioGrid
            items={items}
            readonly={false}
            onEdit={handleEditClick}
            onDelete={setItemToDelete}
            currentLang={i18n.language}
            variant="large"
          />
        )}
      </div>

      <PortfolioUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setEditingItem(null);
        }}
        onSubmit={modalOnSubmit}
        initialItem={editingItem}
        fieldErrors={fieldErrors}
        uploadProgress={uploadProgress}
        isSubmitting={submitting}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        title={t('portfolio.deleteConfirmTitle')}
        message={t('portfolio.deleteConfirmMessage')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};

export default MyPortfolio;
