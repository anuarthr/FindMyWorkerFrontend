/**
 * Funciones auxiliares para validación y permisos de evaluaciones (reviews)
 * Proporciona lógica de negocio para gestionar el sistema de evaluaciones de trabajadores
 * @module utils/reviewHelpers
 */

/**
 * Verifica si un usuario puede evaluar una orden
 * Solo clientes pueden evaluar cuando la orden está completada y no tiene evaluación previa
 * @param {Object} order - Objeto de orden con estado, cliente y review
 * @param {Object} currentUser - Usuario actual con rol e ID
 * @returns {boolean} true si el usuario puede crear una evaluación
 * @example canUserReview({status: 'COMPLETED', client: {id: 5}, has_review: false}, {role: 'CLIENT', id: 5}) // true
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

/**
 * Valida los datos de una evaluación antes de enviarla
 * Verifica que la calificación esté entre 1-5 y el comentario tenga mínimo 10 caracteres
 * @param {number} rating - Calificación de 1 a 5 estrellas
 * @param {string} comment - Comentario de la evaluación
 * @returns {Object} Objeto con errores por campo {rating?: string, comment?: string}
 * @example validateReviewData(5, 'Excelente trabajo!') // {} (sin errores)
 * @example validateReviewData(0, 'Ok') // {rating: '...', comment: '...'}
 */
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

/**
 * Extrae y normaliza errores de la respuesta del backend al crear una evaluación
 * Convierte arrays y mensajes anidados en un formato uniforme
 * @param {Object} errorResponse - Objeto de respuesta de error de Axios
 * @param {Object} errorResponse.data - Datos del error del backend
 * @returns {Object} Objeto normalizado con errores {rating?: string, comment?: string, general?: string}
 * @example extractReviewErrors({data: {rating: ['Invalid rating']}}) // {rating: 'Invalid rating'}
 */
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

/**
 * Calcula la distribución porcentual de calificaciones de un conjunto de evaluaciones
 * Útil para mostrar gráficos de distribución de estrellas
 * @param {Array} reviews - Array de evaluaciones con propiedad 'rating'
 * @returns {Object} Objeto con porcentajes por calificación {5: number, 4: number, 3: number, 2: number, 1: number}
 * @example getRatingDistribution([{rating: 5}, {rating: 5}, {rating: 4}]) // {5: 67, 4: 33, 3: 0, 2: 0, 1: 0}
 */
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
