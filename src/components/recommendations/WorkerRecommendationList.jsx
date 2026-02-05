/**
 * Lista de trabajadores recomendados con paginación
 * Incluye estados de carga, vacío, y resultados con controles de página
 * 
 * @param {Array} results - Lista de trabajadores recomendados
 * @param {boolean} loading - Estado de carga
 * @param {string} query - Query de búsqueda actual
 * @param {Object} pagination - Información de paginación
 * @param {Function} onPageChange - Callback para cambio de página
 */

import { ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WorkerRecommendationCard from './WorkerRecommendationCard';

const WorkerRecommendationList = ({ 
  results, 
  loading, 
  query, 
  pagination,
  onPageChange 
}) => {
  const { t } = useTranslation();

  // Estado de carga con skeleton loaders
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 h-96 animate-pulse">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado vacío sin resultados
  if (!results || results.length === 0) {
    return (
      <div className="bg-white border border-[#4A3B32]/10 rounded-xl p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EFE6DD] rounded-full mb-4">
          <SearchIcon size={32} className="text-[#C04A3E]" />
        </div>
        <h3 className="text-xl font-bold text-[#4A3B32] mb-2">
          {t('recommendations.noResults')}
        </h3>
        <p className="text-gray-600 mb-4 max-w-md mx-auto">
          {query ? 
            t('recommendations.noResultsFor', { query }) : 
            t('recommendations.noResultsGeneric')
          }
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
          <p className="text-sm font-bold text-blue-900 mb-2">
            💡 {t('recommendations.suggestions')}
          </p>
          <ul className="text-xs text-blue-800 space-y-1 text-left">
            <li>• {t('recommendations.suggestion1')}</li>
            <li>• {t('recommendations.suggestion2')}</li>
            <li>• {t('recommendations.suggestion3')}</li>
          </ul>
        </div>
      </div>
    );
  }

  // Resultados encontrados
  return (
    <div className="space-y-6">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#4A3B32]">
          {t('recommendations.foundResults', { count: pagination.count, query })}
        </h2>
        <span className="text-sm text-gray-500">
          {t('recommendations.page', { page: pagination.currentPage })}
        </span>
      </div>

      {/* Grid de resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((worker) => (
          <WorkerRecommendationCard key={worker.id} worker={worker} />
        ))}
      </div>

      {/* Paginación */}
      {(pagination.next || pagination.previous) && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.previous}
            className="flex items-center gap-2 px-4 py-2 border border-[#4A3B32]/20 text-[#4A3B32] rounded-lg hover:bg-[#EFE6DD] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
          >
            <ChevronLeft size={18} />
            {t('recommendations.previous')}
          </button>

          <span className="text-sm font-bold text-[#4A3B32] px-4 py-2 bg-[#EFE6DD] rounded-lg">
            {t('recommendations.pageOf', { 
              current: pagination.currentPage,
              total: Math.ceil(pagination.count / 10)
            })}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.next}
            className="flex items-center gap-2 px-4 py-2 border border-[#4A3B32]/20 text-[#4A3B32] rounded-lg hover:bg-[#EFE6DD] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent font-medium"
          >
            {t('recommendations.next')}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkerRecommendationList;
