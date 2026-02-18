// src/hooks/usePortfolio.js
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

  const mapBackendErrors = (err) => {
    // Espera formatos tipo { title: [...], image: [...], detail: "..." }
    if (!err?.response) {
      setError('errors.generic'); // clave i18n
      return;
    }
    const { status, data } = err.response;

    if (status === 400 && typeof data === 'object') {
      const newFieldErrors = {};
      if (Array.isArray(data.title)) {
        newFieldErrors.title = data.title[0];
      }
      if (Array.isArray(data.image)) {
        newFieldErrors.image = data.image[0];
      }
      if (Array.isArray(data.description)) {
        newFieldErrors.description = data.description[0];
      }
      setFieldErrors(newFieldErrors);
      if (!Object.keys(newFieldErrors).length && data.detail) {
        setError(data.detail);
      }
    } else if (status === 403) {
      setError('errors.forbidden'); // clave, ej: "No tienes permiso para realizar esta acción."
    } else {
      setError('errors.generic');
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
