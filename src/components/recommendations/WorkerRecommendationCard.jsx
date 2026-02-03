import { Star, MapPin, Lightbulb, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PROFESSION_TRANSLATIONS } from '../../config/constants';

const WorkerRecommendationCard = ({ worker }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const userData = worker.user || worker;
  const firstName = userData.first_name || "";
  const lastName = userData.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || t('workerCard.defaultName');
  const avatarUrl = userData.avatar || "https://placehold.co/100x100?text=WK";
  
  const recommendationScore = worker.recommendation_score || 0;
  const matchedKeywords = worker.matched_keywords || [];
  const explanation = worker.explanation || "";
  
  const profile = worker.worker_profile || worker;
  const currentLang = i18n.language.startsWith('es') ? 'es' : 'en';
  const professionKey = worker.profession || profile.service_category;
  const profession = PROFESSION_TRANSLATIONS[currentLang]?.[professionKey] || 
                     professionKey || 
                     t('workerCard.defaultProfession');
  
  const rating = parseFloat(worker.average_rating || profile.average_rating || 0).toFixed(1);
  const hourlyRate = parseInt(worker.hourly_rate || profile.hourly_rate || 0).toLocaleString();
  const reviewCount = worker.review_count || profile.total_reviews || 0;
  const bio = worker.bio || profile.bio || t('workerCard.defaultBio');
  const distanceKm = worker.distance_km != null ? worker.distance_km.toFixed(1) : null;

  return (
    <div className="bg-white border border-[#4A3B32]/10 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#C04A3E]/30 transition-all duration-300 flex flex-col h-full">
      <div className="p-5 flex items-start space-x-4">
        <img 
          src={avatarUrl} 
          alt={fullName} 
          className="w-16 h-16 rounded-full object-cover border-2 border-[#C04A3E] shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-bold text-[#4A3B32] truncate text-lg capitalize">
            {fullName}
          </h3>
          <p className="text-xs uppercase tracking-wider font-bold text-[#C04A3E] mb-1">
            {profession}
          </p>
          <div className="flex items-center text-gray-500 text-xs gap-3">
            {distanceKm && (
              <div className="flex items-center">
                <MapPin size={12} className="mr-1" />
                <span>{distanceKm} km</span>
              </div>
            )}
            <div className="flex items-center bg-gray-100 px-2 py-0.5 rounded-md">
              <Star size={12} className="text-[#E37B5B] fill-current mr-1" />
              <span className="font-bold text-[#4A3B32]">{rating}</span>
              <span className="text-gray-500 ml-1">({reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {bio}
        </p>
      </div>

      {matchedKeywords.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-bold text-[#4A3B32] mb-2 flex items-center gap-1">
            <Lightbulb size={12} className="text-[#E37B5B]" />
            {t('recommendations.matchedKeywords')}
          </p>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.slice(0, 5).map((keyword, i) => (
              <span 
                key={i} 
                className="px-2 py-1 bg-[#EFE6DD] text-[#4A3B32] text-xs rounded-md font-medium border border-[#C04A3E]/20"
                title={t('recommendations.keywordTooltip', { keyword })}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-[#4A3B32]/10 bg-gray-50 flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-xs text-gray-500 block">{t('workerCard.rateLabel')}</span>
          <span className="text-lg font-bold text-[#C04A3E]">
            ${hourlyRate}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/worker/${worker.id}`)}
            className="px-3 py-2 border border-[#4A3B32] text-[#4A3B32] text-xs font-medium rounded-lg hover:bg-[#4A3B32] hover:text-white transition-colors flex items-center gap-1"
          >
            <ExternalLink size={14} />
            {t('workerCard.viewProfile')}
          </button>
          <button 
            onClick={() => navigate(`/worker/${worker.id}`)}
            className="px-4 py-2 bg-[#C04A3E] text-white text-xs font-bold rounded-lg hover:bg-[#A03A2E] transition-colors"
          >
            {t('recommendations.hire')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerRecommendationCard;
