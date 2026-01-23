/**
 * @fileoverview Funciones auxiliares para validación y permisos de evaluaciones
 */

export const canUserReview = (order, currentUser) => {
  if (!order || !currentUser) return false;

  return (
    order.status === 'COMPLETED' &&
    currentUser.role === 'CLIENT' &&
    order.client?.id === currentUser.id &&
    !order.has_review
  );
};

export const validateReviewData = (rating, comment) => {
  const errors = {};

  if (!rating || rating < 1 || rating > 5) {
    errors.rating = 'Selecciona una calificación de 1 a 5 estrellas';
  }

  const trimmedComment = comment?.trim() || '';
  if (trimmedComment.length < 10) {
    errors.comment = 'El comentario debe tener al menos 10 caracteres';
  }

  return errors;
};

export const extractReviewErrors = (errorResponse) => {
  const errors = {};

  if (!errorResponse || !errorResponse.data) {
    return { general: 'Error desconocido. Intenta de nuevo.' };
  }

  const data = errorResponse.data;

  if (data.rating) {
    errors.rating = Array.isArray(data.rating) ? data.rating[0] : data.rating;
  }

  if (data.comment) {
    errors.comment = Array.isArray(data.comment) ? data.comment[0] : data.comment;
  }

  if (data.non_field_errors) {
    errors.general = Array.isArray(data.non_field_errors)
      ? data.non_field_errors[0]
      : data.non_field_errors;
  }

  if (data.detail) {
    errors.general = data.detail;
  }

  return errors;
};

export const getRatingDistribution = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }

  const counts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  const total = reviews.length;
  const distribution = {};

  for (let i = 1; i <= 5; i++) {
    distribution[i] = Math.round(((counts[i] || 0) / total) * 100);
  }

  return distribution;
};
