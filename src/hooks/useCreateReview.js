/**
 * @fileoverview Hook personalizado para crear evaluaciones
 * Maneja envío, validación y estados de error
 */

import { useState, useCallback } from 'react';
import { createReview } from '../api/reviews';
import { validateReviewData, extractReviewErrors } from '../utils/reviewHelpers';

/**
 * useCreateReview - Hook para crear evaluaciones de trabajadores
 * 
 * @param {number} orderId - ID de la orden a evaluar
 * @returns {Object} Estado de envío y métodos
 * 
 * @example
 * const { submitReview, submitting, error, success } = useCreateReview(38);
 * await submitReview({ rating: 5, comment: "Excelente trabajo!" });
 */
export const useCreateReview = (orderId) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [createdReview, setCreatedReview] = useState(null);

  /**
   * Enviar evaluación a la API
   * 
   * @param {Object} reviewData
   * @param {number} reviewData.rating - Calificación (1-5)
   * @param {string} reviewData.comment - Comentario de la evaluación
   * @returns {Promise<Object|null>} Evaluación creada o null en caso de error
   */
  const submitReview = async (reviewData) => {
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setCreatedReview(null);

    // Validación del lado del cliente
    const validationErrors = validateReviewData(
      reviewData.rating,
      reviewData.comment
    );

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return null;
    }

    try {
      setSubmitting(true);

      const review = await createReview(orderId, {
        rating: reviewData.rating,
        comment: reviewData.comment.trim()
      });

      setSuccess(true);
      setCreatedReview(review);
      return review;

    } catch (err) {
      console.error('Error creating review:', err);

      // Verificar si es un error de validación del backend
      if (err.response?.status === 400) {
        const errors = extractReviewErrors(err.response);
        if (errors.general) {
          setError(errors.general);
        } else {
          setFieldErrors(errors);
        }
      } else {
        setError(err.message || 'Error al crear la evaluación');
      }

      return null;

    } finally {
      setSubmitting(false);
    }
  };

  const reset = useCallback(() => {
    setSubmitting(false);
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    setCreatedReview(null);
  }, []);

  return {
    submitReview,
    submitting,
    error,
    fieldErrors,
    success,
    createdReview,
    reset
  };
};

export default useCreateReview;
