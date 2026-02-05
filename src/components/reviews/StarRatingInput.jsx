/**
 * @fileoverview Componente interactivo de selección de rating con accesibilidad por teclado
 */

import { Star } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * StarRatingInput - Selector interactivo de calificación con estrellas
 * 
 * @param {Object} props
 * @param {number} props.value - Valor actual de calificación (1-5)
 * @param {Function} props.onChange - Callback cuando cambia la calificación
 * @param {boolean} [props.disabled=false] - Deshabilitar interacción
 * @param {string} [props.error] - Mensaje de error a mostrar
 */
const StarRatingInput = ({ value, onChange, disabled = false, error }) => {
  const { t } = useTranslation();
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = useCallback((rating) => {
    if (!disabled) {
      onChange(rating);
    }
  }, [disabled, onChange]);

  const handleKeyDown = useCallback((e, rating) => {
    if (disabled) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextRating = Math.min(5, rating + 1);
      onChange(nextRating);
      document.getElementById(`star-${nextRating}`)?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prevRating = Math.max(1, rating - 1);
      onChange(prevRating);
      document.getElementById(`star-${prevRating}`)?.focus();
    }
  }, [disabled, onChange]);

  return (
    <div className="space-y-2">
      <fieldset 
        className="flex flex-col gap-3"
        disabled={disabled}
      >
        <legend className="text-sm font-medium text-[#4A3B32] mb-1">
          {t('reviews.selectRating')}
        </legend>

        <div 
          className="flex items-center gap-1"
          role="radiogroup"
          aria-label={t('reviews.rating')}
        >
          {[1, 2, 3, 4, 5].map((rating) => {
            const isSelected = value === rating;
            const isHovered = hoveredStar >= rating;
            const shouldFill = isSelected || (hoveredStar > 0 ? isHovered : value >= rating);

            return (
              <label
                key={rating}
                htmlFor={`star-${rating}`}
                className={`cursor-pointer transition-transform ${
                  !disabled ? 'hover:scale-110' : 'cursor-not-allowed opacity-50'
                }`}
                onMouseEnter={() => !disabled && setHoveredStar(rating)}
                onMouseLeave={() => !disabled && setHoveredStar(0)}
              >
                <input
                  type="radio"
                  id={`star-${rating}`}
                  name="rating"
                  value={rating}
                  checked={isSelected}
                  onChange={() => handleStarClick(rating)}
                  onKeyDown={(e) => handleKeyDown(e, rating)}
                  disabled={disabled}
                  className="sr-only"
                  aria-label={t('reviews.starAria', { count: rating })}
                />
                <Star
                  className={`w-8 h-8 transition-colors ${
                    shouldFill 
                      ? 'text-[#C04A3E]' 
                      : 'text-gray-300'
                  }`}
                  fill={shouldFill ? 'currentColor' : 'none'}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </label>
            );
          })}
        </div>

        {value > 0 && (
          <p className="text-sm text-[#4A3B32]/70" aria-live="polite">
            {t('reviews.starAria', { count: value })}
          </p>
        )}
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <span aria-label="Error">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

StarRatingInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string
};

export default StarRatingInput;
