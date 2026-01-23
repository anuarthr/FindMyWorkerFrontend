/**
 * @fileoverview Componente de lista de evaluaciones con paginación
 * Muestra reviews de trabajadores con estados de carga y estado vacío
 */

import { Loader2, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import ReviewCard from './ReviewCard';
import ReviewSummary from './ReviewSummary';
import useWorkerReviews from '../../hooks/useWorkerReviews';

/**
 * ReviewsList - Mostrar lista paginada de evaluaciones de trabajador
 * 
 * @param {Object} props
 * @param {string} props.workerId - ID del trabajador
 * @param {number} [props.pageSize=10] - Reviews por página
 */
const ReviewsList = ({ workerId, pageSize = 10, showSummary = false }) => {
  const { t } = useTranslation();
  const {
    reviews,
    worker,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  } = useWorkerReviews(workerId, pageSize);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#4A3B32]/10 p-5 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-2">
          {t('reviews.errorTitle')}
        </p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#4A3B32]/10 p-12 text-center">
        <div className="w-16 h-16 bg-[#EFE6DD] rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={32} className="text-[#4A3B32]/40" />
        </div>
        <h3 className="font-semibold text-[#4A3B32] text-lg mb-2">
          {t('reviews.noReviews')}
        </h3>
        <p className="text-[#4A3B32]/60 text-sm max-w-md mx-auto">
          {t('reviews.noReviewsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSummary && worker && (
        <div className="mb-8">
          <ReviewSummary
            averageRating={worker.average_rating || 0}
            totalReviews={worker.total_reviews || 0}
            variant="detailed"
          />
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-white border-2 border-[#C04A3E] text-[#C04A3E] rounded-lg font-medium hover:bg-[#C04A3E] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                {t('reviews.loading')}
              </>
            ) : (
              t('reviews.loadMore')
            )}
          </button>
        </div>
      )}
    </div>
  );
};

ReviewsList.propTypes = {
  workerId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  pageSize: PropTypes.number,
  showSummary: PropTypes.bool
};

export default ReviewsList;
