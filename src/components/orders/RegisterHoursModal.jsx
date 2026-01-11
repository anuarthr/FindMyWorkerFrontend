import { useState } from 'react';
import { X, Clock, Calendar, FileText, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterHoursModal = ({ orderId, workerRate, onClose, onSuccess, editData }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ SOLUCIÓN - Fecha máxima = AYER (para evitar problemas de zona horaria)
  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // Restar 1 día
    return today.toISOString().split('T')[0];
  };
  
  const maxDate = getMaxDate();

  const [formData, setFormData] = useState({
    date: editData?.date || maxDate,
    hours: editData?.hours || '',
    description: editData?.description || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculatedPayment = formData.hours ? (parseFloat(formData.hours) * workerRate).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
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
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-neutral-dark flex items-center gap-2">
            <Clock className="text-primary" size={28} />
            {editData ? t('orders.editHours') : t('orders.registerHours')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-red-800 text-sm font-medium whitespace-pre-line">{error}</p>
            </div>
          )}

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
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.date || !formData.hours || !formData.description}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-[#a83f34] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? t('common.saving') : (editData ? t('common.update') : t('orders.registerHours'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterHoursModal;
