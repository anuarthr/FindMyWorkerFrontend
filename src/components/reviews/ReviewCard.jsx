/**
 * @fileoverview Componente de tarjeta individual de evaluación
 * Muestra información del evaluador, calificación, comentario y metadatos
 */

import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import { formatRelativeDate } from '../../utils/dateFormatters';

/**
 * ReviewCard - Mostrar una evaluación individual
 * 
 * @param {Object} props
 * @param {Object} props.review - Objeto de datos de la evaluación
 */
const ReviewCard = ({ review }) => {
  const { t, i18n } = useTranslation();

  const reviewerName = useMemo(() => 
    `${review.reviewer.first_name} ${review.reviewer.last_name}`,
    [review.reviewer.first_name, review.reviewer.last_name]
  );
  
  const initials = useMemo(() => 
    `${review.reviewer.first_name[0]}${review.reviewer.last_name[0]}`.toUpperCase(),
    [review.reviewer.first_name, review.reviewer.last_name]
  );
  
  const relativeDate = useMemo(() => 
    formatRelativeDate(review.created_at, i18n.language),
    [review.created_at, i18n.language]
  );

  return (
    <div className="bg-white rounded-xl border border-[#4A3B32]/10 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#C04A3E]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#C04A3E]">
              {initials}
            </span>
          </div>

          <div>
            <p className="font-semibold text-[#4A3B32]">{reviewerName}</p>
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#4A3B32]/60">
          <Calendar size={14} />
          <time dateTime={review.created_at}>
            {relativeDate}
          </time>
        </div>
      </div>

      <p className="text-[#4A3B32]/80 text-sm leading-relaxed mb-3">
        {review.comment}
      </p>

      {review.service_order_id && (
        <div className="pt-3 border-t border-[#4A3B32]/5">
          <p className="text-xs text-[#4A3B32]/50">
            {t('reviews.orderNumber', { number: review.service_order_id })}
          </p>
        </div>
      )}
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number.isRequired,
    reviewer: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired
    }).isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    service_order_id: PropTypes.number
  }).isRequired
};

export default ReviewCard;
