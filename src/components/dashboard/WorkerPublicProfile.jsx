import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Clock, ArrowLeft, ShieldCheck, 
  MessageSquare, CalendarCheck 
} from 'lucide-react';
import { getWorkerById } from '../../api/workers';
import { useTranslation } from 'react-i18next';
import HiringModal from '../modals/HiringModal';
import ReviewsList from '../reviews/ReviewsList';
import ReviewSummary from '../reviews/ReviewSummary';
import { getFullName, getAvatarUrl } from '../../utils/profileHelpers';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioGrid from '../portfolio/PortfolioGrid';
import ImageViewerModal from '../portfolio/ImageViewerModal';

const WorkerPublicProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  
  // Image viewer modal state
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageItem, setSelectedImageItem] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { items: portfolioItems, loading: portfolioLoading, error: portfolioError, loadPublicPortfolio } = usePortfolio();

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      const data = await getWorkerById(id);
      setWorker(data);
      setLoading(false);
    };
    fetchWorker();
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPublicPortfolio(id);
    }
  }, [id, loadPublicPortfolio]);

  const handleOrderCreated = (order) => {
    console.log('Order created successfully:', order);
  };

  const handleItemClick = (item, index) => {
    setSelectedImageItem(item);
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const handleImageNavigate = (newIndex) => {
    setSelectedImageIndex(newIndex);
    setSelectedImageItem(portfolioItems[newIndex]);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#EFE6DD] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C04A3E]"></div>
    </div>
  );

  if (!worker) return (
    <div className="min-h-screen bg-[#EFE6DD] flex flex-col items-center justify-center text-[#4A3B32]">
      <h2 className="text-2xl font-bold mb-2">{t('workerPublicProfile.notFound')}</h2>
      <button onClick={() => navigate(-1)} className="text-[#C04A3E] underline">{t('workerPublicProfile.backToMap')}</button>
    </div>
  );

  const userData = worker.user || worker;
  const fullName = getFullName(userData, t('workerCard.defaultName'));
  const avatar = getAvatarUrl(userData, '150x150');
  const hourlyRate = parseInt(worker.hourly_rate || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-[#EFE6DD] pb-10">
      
      {/* Navegación */}
      <div className="bg-[#4A3B32] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg hidden md:block">{t('workerPublicProfile.backToResults')}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        
        {/* HERO */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#4A3B32]/5">
          {/* Portada decorativa */}
          <div className="h-32 bg-gradient-to-r from-[#C04A3E] to-[#E37B5B]"></div>
          
          <div className="px-6 pb-6 md:px-10 flex flex-col md:flex-row gap-6">
            {/* Avatar Flotante */}
            <div className="-mt-16 flex-shrink-0">
              <img 
                src={avatar} 
                alt={fullName} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>

            {/* Info Principal */}
            <div className="pt-2 md:pt-4 flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#4A3B32] capitalize">{fullName}</h1>
                  <p className="text-[#C04A3E] font-bold uppercase tracking-wider text-sm mt-1">
                    {worker.profession}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{t('workerPublicProfile.location')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={16} className={worker.is_verified ? "text-green-600" : "text-gray-300"} />
                      <span>{worker.is_verified ? t('workerPublicProfile.verified') : t('workerPublicProfile.unverified')}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque de Precio y Rating */}
                <div className="flex items-center gap-6 bg-[#EFE6DD]/50 p-4 rounded-xl border border-[#4A3B32]/10">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{t('workerPublicProfile.rate')}</p>
                    <p className="text-2xl font-bold text-[#C04A3E]">${hourlyRate}<span className="text-sm text-gray-400">{t('workerPublicProfile.perHour')}</span></p>
                  </div>
                  <div className="w-px h-10 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">{t('workerPublicProfile.rating')}</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-bold text-[#4A3B32]">{worker.average_rating}</span>
                      <Star size={20} className="text-yellow-500 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* Columna Izquierda: Detalles */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Sobre Mí */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5">
              <h3 className="font-bold text-xl text-[#4A3B32] mb-4">{t('workerPublicProfile.aboutMe')}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {worker.bio || t('workerPublicProfile.noBio')}
              </p>
            </div>

            {/* Sección de Reviews */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5">
              <h3 className="font-bold text-xl text-[#4A3B32] mb-6">
                {t('workerPublicProfile.reviewsTitle')}
              </h3>

              {/* Reviews List */}
              <ReviewsList workerId={worker.id} pageSize={10} showSummary />
            </div>

            {/* Sección de Portafolio */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-xl text-[#4A3B32]">
                  {t('portfolio.publicPortfolioTitle')}
                </h3>

                {user && user.role === 'WORKER' && String(user.id) === String(id) && (
                  <button
                    type="button"
                    onClick={() => navigate('/worker/portfolio')}
                    className="text-sm text-[#C04A3E] hover:underline focus:outline-none focus:ring-2 focus:ring-[#C04A3E] rounded px-2 py-1"
                  >
                    {t('portfolio.manageMyPortfolio')}
                  </button>
                )}
              </div>

              {portfolioError && (
                <p className="mb-2 text-sm text-red-600">
                  {t(portfolioError)}
                </p>
              )}

              {portfolioLoading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-gray-500">{t('common.loading')}</p>
                </div>
              ) : (
                <PortfolioGrid
                  items={portfolioItems}
                  readonly={true}
                  onItemClick={handleItemClick}
                  currentLang={i18n.language}
                  variant="large"
                />
              )}
            </div>
          </div>

          {/* Columna Derecha: Sticky Action Card */}
          <div className="relative">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-[#C04A3E]/20">
                <h3 className="font-bold text-lg text-[#4A3B32] mb-4">{t('workerPublicProfile.interestTitle')}</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsHiringModalOpen(true)}
                    disabled={!worker.is_verified}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all shadow-sm ${
                      worker.is_verified
                        ? 'bg-[#C04A3E] text-white hover:bg-[#a83f34] hover:shadow-md cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <CalendarCheck size={20} />
                    {t('workerPublicProfile.hireNow')}
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#4A3B32] text-[#4A3B32] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all cursor-pointer">
                    <MessageSquare size={20} />
                    {t('workerPublicProfile.sendMessage')}
                  </button>
                </div>
                {!worker.is_verified && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800 text-center">
                      {t('workerPublicProfile.notVerifiedWarning')}
                    </p>
                  </div>
                )}
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  {t('workerPublicProfile.escrowNote')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Modals */}
      <HiringModal 
        isOpen={isHiringModalOpen}
        onClose={(order) => {
          setIsHiringModalOpen(false);
          if (order) {
            handleOrderCreated(order);
          }
        }}
        workerProfileId={worker.id}
        workerName={fullName}
        workerHourlyRate={worker.hourly_rate}
      />
      
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
        item={selectedImageItem}
        items={portfolioItems}
        currentIndex={selectedImageIndex}
        onNavigate={handleImageNavigate}
      />
    </div>
  );
};

export default WorkerPublicProfile;
