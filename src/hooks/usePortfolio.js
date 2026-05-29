import { useState, useCallback } from 'react';
import {
  getMyPortfolio,
  getWorkerPortfolio,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} from '../api/portfolio';

export const usePortfolio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);      // global error message
  const [fieldErrors, setFieldErrors] = useState({}); // per-field errors
  const [uploadProgress, setUploadProgress] = useState(0);

  const resetErrors = () => {
    setError(null);
    setFieldErrors({});
  };

  const FIELD_KEYS_MAPPED_IN_FORM = ['title', 'image', 'description'];

  const flattenError = (value) => {
    if (Array.isArray(value)) return value.join(' ');
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      // DRF nested errors: { campo: { 0: "msg" } } o { campo: [...] }
      return Object.values(value).map(flattenError).join(' ');
    }
    return String(value ?? '');
  };

  const mapBackendErrors = (err) => {
    // DRF puede devolver:
    //  { title: ["..."], image: ["..."], detail: "..." }
    //  { non_field_errors: ["..."] }
    //  { order: ["la orden no está completada"] }   ← caso típico de este flujo
    //  string plano cuando algún middleware mata el parser
    if (!err?.response) {
      setError('errors.generic');
      return;
    }
    const { status, data } = err.response;

    if (status === 400) {
      const newFieldErrors = {};
      const extraMessages = [];

      if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
          if (FIELD_KEYS_MAPPED_IN_FORM.includes(key)) {
            newFieldErrors[key] = Array.isArray(value) ? value[0] : flattenError(value);
          } else if (key === 'detail' || key === 'non_field_errors') {
            extraMessages.push(flattenError(value));
          } else {
            // Cualquier otro campo del backend (order, is_external_work, etc.)
            // se muestra como "campo: mensaje" para no esconder el detalle.
            extraMessages.push(`${key}: ${flattenError(value)}`);
          }
        });
      } else if (typeof data === 'string') {
        extraMessages.push(data);
      }

      setFieldErrors(newFieldErrors);
      if (extraMessages.length > 0) {
        setError(extraMessages.join(' · '));
      } else if (Object.keys(newFieldErrors).length === 0) {
        setError('errors.generic');
      }
    } else if (status === 403) {
      const msg = (data && (data.detail || flattenError(data))) || 'errors.forbidden';
      setError(msg);
    } else {
      setError(flattenError(data?.detail || data) || 'errors.generic');
    }
  };

  const loadMyPortfolio = useCallback(async () => {
    setLoading(true);
    resetErrors();
    try {
      const data = await getMyPortfolio();
      setItems(data);
    } catch (err) {
      mapBackendErrors(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPublicPortfolio = useCallback(async (workerId) => {
    setLoading(true);
    resetErrors();
    try {
      const data = await getWorkerPortfolio(workerId);
      setItems(data);
    } catch (err) {
      mapBackendErrors(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (formData) => {
    resetErrors();
    setUploadProgress(0);
    try {
      const newItem = await createPortfolioItem(formData, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percent);
        },
      });
      setItems((prev) => [newItem, ...prev]);
      return { success: true, item: newItem };
    } catch (err) {
      mapBackendErrors(err);
      return { success: false };
    } finally {
      setUploadProgress(0);
    }
  }, []);

  const updateItem = useCallback(async (id, payload, isMultipart = false) => {
    resetErrors();
    setUploadProgress(0);
    try {
      const updated = await updatePortfolioItem(id, payload, isMultipart, {
        onUploadProgress: isMultipart
          ? (event) => {
              if (!event.total) return;
              const percent = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percent);
            }
          : undefined,
      });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return { success: true, item: updated };
    } catch (err) {
      mapBackendErrors(err);
      return { success: false };
    } finally {
      setUploadProgress(0);
    }
  }, []);

  const removeItem = useCallback(async (id) => {
    resetErrors();
    try {
      await deletePortfolioItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return { success: true };
    } catch (err) {
      mapBackendErrors(err);
      return { success: false };
    }
  }, []);

  return {
    items,
    loading,
    error,
    fieldErrors,
    uploadProgress,
    loadMyPortfolio,
    loadPublicPortfolio,
    createItem,
    updateItem,
    deleteItem: removeItem,
  };
};
