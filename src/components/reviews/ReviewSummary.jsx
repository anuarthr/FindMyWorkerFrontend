/**
 * @fileoverview Componente de resumen de evaluaciones mostrando promedio y total
 */

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

/**
 * ReviewSummary - Mostrar promedio de calificación y conteo total de evaluaciones
 * 
 * @param {Object} props
 * @param {string|number} props.averageRating - Calificación promedio (ej. "4.85")
 * @param {number} props.totalReviews - Número total de evaluaciones
 * @param {('compact'|'detailed')} [props.variant='compact'] - Estilo de visualización
 */
const ReviewSummary = ({ 
  averageRating, 
  totalReviews, 
  variant = 'compact' 
}) => {
  const { t } = useTranslation();

  const rating = parseFloat(averageRating) || 0;
  const count = totalReviews || 0;
  
  const getReviewsText = (count) => {
    if (count === 0) return t('reviews.reviewsCount_0');
    if (count === 1) return t('reviews.reviewsCount_1');
    return t('reviews.reviewsCount_other', { count });
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <StarRating rating={rating} size="md" showNumber />
        <span className="text-sm text-[#4A3B32]/60">
          ({getReviewsText(count)})
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#EFE6DD] to-white rounded-2xl p-6 border border-[#4A3B32]/10">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-5xl font-bold text-[#C04A3E] mb-1">
            {rating.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            <StarRating rating={rating} size="sm" />
          </div>
          <p className="text-xs text-[#4A3B32]/60">
            {getReviewsText(count)}
          </p>
        </div>

        <div className="h-20 w-px bg-[#4A3B32]/10"></div>

        <div className="flex-1">
          <h3 className="font-semibold text-[#4A3B32] mb-1">
            {t('reviews.averageRating')}
          </h3>
          <p className="text-sm text-[#4A3B32]/70">
            {getReviewsText(count)}
          </p>
        </div>
      </div>
    </div>
  );
};

ReviewSummary.propTypes = {
  averageRating: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  totalReviews: PropTypes.number.isRequired,
  variant: PropTypes.oneOf(['compact', 'detailed'])
};

export default ReviewSummary;
