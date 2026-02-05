/**
 * @fileoverview Componente de visualización de calificación con estrellas (solo lectura)
 * Muestra estrellas llenas, medias y vacías según el valor de rating
 */

import { Star } from 'lucide-react';
import { useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * StarRating - Componente de solo lectura para mostrar calificaciones
 * 
 * @param {Object} props
 * @param {number} props.rating - Valor de calificación (0.0 a 5.0, soporta decimales)
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Tamaño de las estrellas
 * @param {boolean} [props.showNumber=false] - Mostrar número de rating junto a las estrellas
 */
const StarRating = ({ rating = 0, size = 'md', showNumber = false }) => {
  const normalizedRating = useMemo(() => 
    Math.max(0, Math.min(5, rating)),
    [rating]
  );
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const stars = useMemo(() => {
    const result = [];
    
    for (let i = 1; i <= 5; i++) {
      const fillPercentage = Math.max(0, Math.min(1, normalizedRating - (i - 1)));
      
      result.push(
        <div key={i} className="relative inline-block">
          <Star
            className={`${sizeClasses[size]} text-gray-300`}
            fill="currentColor"
            aria-hidden="true"
          />
          
          {fillPercentage > 0 && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage * 100}%` }}
            >
              <Star
                className={`${sizeClasses[size]} text-[#C04A3E]`}
                fill="currentColor"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      );
    }
    
    return result;
  }, [normalizedRating, size]);

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${normalizedRating.toFixed(1)} de 5 estrellas`}
      >
        {stars}
      </div>
      
      {showNumber && (
        <span className={`font-semibold text-[#4A3B32] ${textSizeClasses[size]}`}>
          {normalizedRating.toFixed(2)}
        </span>
      )}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showNumber: PropTypes.bool
};

export default StarRating;
