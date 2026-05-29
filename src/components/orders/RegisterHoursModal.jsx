import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Clock, Calendar, FileText, DollarSign, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { ModalBackdrop, ModalContent, ErrorAlert, ModalCloseButton } from '../common/ModalComponents';
import { createPortfolioItem } from '../../api/portfolio';

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EVIDENCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const RegisterHoursModal = ({ orderId, workerRate, onClose, onSuccess, editData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fecha máxima = AYER (para evitar problemas de zona horaria)
  const maxDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return today.toISOString().split('T')[0];
  }, []);

  const [formData, setFormData] = useState({
    date: editData?.date || maxDate,
    hours: editData?.hours || '',
    description: editData?.description || ''
  });

  // Evidencia fotográfica opcional — se sube como portfolio item linkeado a
  // la orden tras registrar las horas. Reusa el modelo Portfolio del backend
  // (que ya soporta `order` y aparece en la sección "Evidencia" del cliente).
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const evidenceInputRef = useRef(null);
  const isEditMode = Boolean(editData);

  const { handleBackdropClick } = useModalBehavior(true, onClose, !loading);

  useEffect(() => () => {
    if (evidencePreview) URL.revokeObjectURL(evidencePreview);
  }, [evidencePreview]);

  const handleEvidenceChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_EVIDENCE_TYPES.includes(file.type)) {
      setError(t('orders.evidenceTypeError', 'Formato no soportado. Usa JPG, PNG o WEBP.'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_EVIDENCE_BYTES) {
      setError(t('orders.evidenceSizeError', 'La imagen excede 5MB.'));
      e.target.value = '';
      return;
    }
    setError('');
    setEvidenceFile(file);
    setEvidencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, [t]);

  const handleEvidenceClear = useCallback(() => {
    setEvidenceFile(null);
    setEvidencePreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (evidenceInputRef.current) evidenceInputRef.current.value = '';
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const calculatedPayment = useMemo(() => {
    return formData.hours ? (parseFloat(formData.hours) * workerRate).toFixed(2) : '0.00';
  }, [formData.hours, workerRate]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description
      };

      await onSuccess(payload);

      // Si el trabajador adjuntó evidencia, subirla como portfolio item
      // linkeado a esta orden. Solo en modo "crear" — en edit no tiene sentido.
      if (!isEditMode && evidenceFile) {
        try {
          const fd = new FormData();
          fd.append('image', evidenceFile);
          fd.append('title', t('orders.evidenceAutoTitle', 'Evidencia del {{date}}', {
            date: formData.date,
          }));
          fd.append('description', formData.description);
          fd.append('order', String(orderId));
          fd.append('is_external_work', 'false');
          await createPortfolioItem(fd);
        } catch (evidenceErr) {
          // El registro de horas ya quedó. Avisamos sin romper el flujo.
          console.error('Error subiendo evidencia (las horas SÍ se guardaron):', evidenceErr);
          toast.error(t('orders.evidenceUploadError', 'Las horas se registraron, pero la evidencia no se pudo subir. Súbela manualmente desde tu portafolio.'), { duration: 6000 });
        }
      }

      onClose();
    } catch (err) {
      console.error('❌ RegisterHoursModal - Error:', err);

      let errorMsg = t('orders.errorRegisteringHours');

      if (err.response?.data) {
        const errorData = err.response.data;

        if (typeof errorData === 'object' && !errorData.detail) {
          const fieldErrors = Object.entries(errorData)
            .map(([field, errors]) => {
              const errorList = Array.isArray(errors) ? errors : [errors];
              return `${field}: ${errorList.join(', ')}`;
            })
            .join('\n');
          errorMsg = fieldErrors;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, onSuccess, onClose, t, evidenceFile, isEditMode, orderId]);

  return (
    <ModalBackdrop onClick={handleBackdropClick}>
      <ModalContent maxWidth="max-w-2xl" className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-neutral-dark flex items-center gap-2">
            <Clock className="text-primary" size={28} />
            {editData ? t('orders.editHours') : t('orders.registerHours')}
          </h2>
          <ModalCloseButton onClick={onClose} disabled={loading} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Error Message */}
          {error && <ErrorAlert message={error} />}

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              {t('orders.workDate')}
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={maxDate}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fecha máxima: {new Date(maxDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              {t('orders.hoursWorked')}
            </label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              min="0.1"
              max="24"
              step="0.1"
              required
              placeholder="8.5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">{t('orders.decimalsHint')}</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              {t('orders.workDescription')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder={t('orders.workDescriptionPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Evidencia (opcional, solo al crear) */}
          {!isEditMode && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" />
                {t('orders.evidenceLabel', 'Evidencia fotográfica')}
                <span className="text-xs font-normal text-gray-400">
                  ({t('common.optional')})
                </span>
              </label>
              <input
                ref={evidenceInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleEvidenceChange}
                className="hidden"
              />
              {!evidencePreview ? (
                <button
                  type="button"
                  onClick={() => evidenceInputRef.current?.click()}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-primary/5 hover:border-primary px-4 py-6 text-center transition-colors"
                >
                  <ImageIcon className="mx-auto mb-2 h-6 w-6 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    {t('orders.evidenceUpload', 'Adjuntar foto del trabajo')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('orders.evidenceHint', 'JPG, PNG o WEBP. Máximo 5MB. Aparecerá en tu portafolio asociada a esta orden.')}
                  </p>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={evidencePreview}
                    alt="evidence"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleEvidenceClear}
                    className="absolute top-2 right-2 bg-white border border-neutral-dark/20 rounded-full p-1.5 shadow hover:bg-red-50 hover:border-red-300 transition-colors"
                    title={t('orders.evidenceRemove', 'Quitar evidencia')}
                  >
                    <X size={16} className="text-red-600" />
                  </button>
                  <p className="text-xs text-primary mt-2 font-medium truncate">
                    {evidenceFile?.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calculated Payment */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="text-green-700" size={20} />
                <span className="text-sm font-medium text-gray-700">{t('orders.calculatedPayment')}:</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                ${parseFloat(calculatedPayment).toLocaleString('es-CO')}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {formData.hours ? `${parseFloat(formData.hours).toFixed(1)}h × $${parseFloat(workerRate).toLocaleString('es-CO')}/h` : t('orders.pendingClientApproval')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date || !formData.hours || !formData.description}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-[#a83f34] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
            >
              {loading ? t('common.saving') : (editData ? t('common.update') : t('orders.registerHours'))}
            </button>
          </div>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default RegisterHoursModal;
