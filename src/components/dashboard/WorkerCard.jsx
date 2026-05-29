import React from 'react';
import { Star, MapPin, ShieldCheck, ShieldOff, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFullName, getAvatarUrl } from '../../utils/profileHelpers';

const WorkerCard = ({ worker }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userData = worker.user || worker;

  const fullName = getFullName(userData, t('workerCard.defaultName'));
  const avatarUrl = getAvatarUrl(userData);

  const profession = worker.profession || t('workerCard.defaultProfession');
  const rating = parseFloat(worker.average_rating || 0).toFixed(1);
  const hourlyRate = parseInt(worker.hourly_rate || 0).toLocaleString();
  const isVerified = Boolean(worker.is_verified);

  // Score TF-IDF cuando la lista viene de /api/users/workers/?search=.
  // Contrato del backend: entero 0–100, o null si está por debajo del
  // umbral interno. Sin ?search= viene siempre null y el badge se oculta.
  const scoreRaw = worker.recommendation_score;
  const scoreNum = scoreRaw != null ? Number(scoreRaw) : null;
  const matchPct = scoreNum != null && Number.isFinite(scoreNum) && scoreNum > 0
    ? Math.max(0, Math.min(100, Math.round(scoreNum)))
    : null;
  const matchTone = matchPct == null
    ? ''
    : matchPct >= 70
      ? 'bg-green-100 text-green-800 border-green-300'
      : matchPct >= 40
        ? 'bg-amber-100 text-amber-800 border-amber-300'
        : 'bg-gray-100 text-gray-700 border-gray-300';

  // Atenuar visualmente la card si el worker aún no está verificado.
  // El backend ya los manda al final del listado (-is_verified), aquí sólo
  // los marcamos para que el cliente vea la diferencia.
  const cardClasses = isVerified
    ? "bg-white border border-[#4A3B32]/10 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#C04A3E]/30 transition-all duration-300 group flex flex-col h-full"
    : "bg-white/70 border border-[#4A3B32]/10 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col h-full opacity-80";

  return (
    <div className={cardClasses}>

      {/* Header */}
      <div className="p-5 flex items-start space-x-4">
        <img
          src={avatarUrl}
          alt={fullName}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#C04A3E] shadow-sm flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#4A3B32] truncate text-lg capitalize">
              {fullName}
            </h3>
            {isVerified ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-300"
                title={t('workerCard.verifiedTooltip', 'Trabajador verificado por la plataforma')}
              >
                <ShieldCheck size={12} />
                {t('workerCard.verified', 'Verificado')}
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-full"
                title={t('workerCard.unverifiedTooltip', 'Pendiente de verificación administrativa')}
              >
                <ShieldOff size={12} />
                {t('workerCard.unverified', 'Sin verificar')}
              </span>
            )}
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-[#C04A3E] mb-1 mt-0.5">
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
      <div className="p-4 border-t border-[#4A3B32]/10 bg-gray-50 flex items-center justify-between mt-auto gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 block">{t('workerCard.rateLabel')}</span>
          <span className="text-lg font-bold text-[#C04A3E]">
            ${hourlyRate}
          </span>
          {matchPct != null && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-bold uppercase tracking-wider rounded-full border w-fit ${matchTone}`}
              title={t('workerCard.matchTooltip', 'Afinidad calculada por el motor IA contra tu búsqueda')}
            >
              <Sparkles size={10} />
              {t('workerCard.matchBadge', '{{pct}}% match', { pct: matchPct })}
            </span>
          )}
        </div>
        <button className="px-4 py-2 bg-[#4A3B32] text-white text-sm font-medium rounded-lg hover:bg-[#2A211C] transition-colors cursor-pointer shrink-0"
            onClick={() => navigate(`/worker/${worker.id}`)}>
          {t('workerCard.viewProfile')}
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
