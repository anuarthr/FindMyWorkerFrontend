import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import i18n

const WorkerCard = ({ worker }) => {
  const { t } = useTranslation(); // Hook initialization
  const navigate = useNavigate();
  const userData = worker.user || worker;
  
  const firstName = userData.first_name || "";
  const lastName = userData.last_name || "";
  
  let fullName = `${firstName} ${lastName}`.trim();
  if (!fullName) fullName = t('workerCard.defaultName');

  const avatarUrl = userData.avatar || "https://placehold.co/100x100?text=WK";
  
  const profession = worker.profession || t('workerCard.defaultProfession');
  const rating = parseFloat(worker.average_rating || 0).toFixed(1);
  const hourlyRate = parseInt(worker.hourly_rate || 0).toLocaleString();

  return (
    <div className="bg-white border border-[#4A3B32]/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#C04A3E]/30 transition-all duration-300 group flex flex-col h-full">
      
      {/* Header */}
      <div className="p-5 flex items-start space-x-4">
        <img 
          src={avatarUrl} 
          alt={fullName} 
          className="w-14 h-14 rounded-full object-cover border-2 border-[#C04A3E] shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#4A3B32] truncate text-lg capitalize">
            {fullName}
          </h3>
          <p className="text-xs uppercase tracking-wider font-bold text-[#C04A3E] mb-1">
            {profession}
          </p>
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin size={12} className="mr-1" />
            <span>{t('workerCard.distance')}</span>
          </div>
        </div>
        <div className="flex items-center bg-gray-100 px-2 py-1 rounded-md flex-shrink-0">
          <Star size={14} className="text-[#E37B5B] fill-current mr-1" />
          <span className="font-bold text-[#4A3B32] text-sm">{rating}</span>
        </div>
      </div>

      {/* Bio y Skills */}
      <div className="px-5 pb-4 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
          {worker.bio || t('workerCard.defaultBio')}
        </p>
        <div className="flex flex-wrap gap-2">
          {worker.skills?.slice(0, 3).map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-[#EFE6DD] text-[#4A3B32] text-xs rounded-md font-medium">
              {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#4A3B32]/10 bg-gray-50 flex items-center justify-between mt-auto">
        <div>
          <span className="text-xs text-gray-500 block">{t('workerCard.rateLabel')}</span>
          <span className="text-lg font-bold text-[#C04A3E]">
            ${hourlyRate}
          </span>
        </div>
        <button className="px-4 py-2 bg-[#4A3B32] text-white text-sm font-medium rounded-lg hover:bg-[#2A211C] transition-colors cursor-pointer"
            onClick={() => navigate(`/worker/${worker.id}`)}>
          {t('workerCard.viewProfile')}
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
