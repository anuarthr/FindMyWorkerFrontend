import { useState } from 'react';
import { X, Clock, Save, Loader2, DollarSign, Calendar, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const RegisterHoursModal = ({ orderId, workerRate, onClose, onSuccess, editData = null }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: editData?.date || new Date().toISOString().split('T')[0],
    hours: editData?.hours || '',
    description: editData?.description || ''
  });

  const calculatedPayment = parseFloat(formData.hours || 0) * workerRate;
  const maxDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSuccess({
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || t('orders.errorRegisteringHours'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-[#a83f34] text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold">
              {editData ? t('orders.editHours') : t('orders.registerHours')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
              <Calendar size={16} />
              {t('orders.workDate')}
            </label>
            <input
              type="date"
              value={formData.date}
              max={maxDate}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              {t('orders.maxDateToday')}
            </p>
          </div>

          {/* Horas */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
              <Clock size={16} />
              {t('orders.hoursWorked')}
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={formData.hours}
              onChange={(e) => setFormData({...formData, hours: e.target.value})}
              placeholder="5.5"
              className="w-full px-4 py-3 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-lg font-semibold"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5">
              {t('orders.decimalsHint')} (ej: 5.5 = 5h 30min)
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
              <FileText size={16} />
              {t('orders.workDescription')}
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('orders.workDescriptionPlaceholder')}
              className="w-full px-4 py-3 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
              required
            />
          </div>

          {/* Cálculo de Pago */}
          {formData.hours && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <DollarSign size={20} />
                <p className="text-sm font-medium">{t('orders.calculatedPayment')}</p>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {formData.hours}h × ${workerRate.toLocaleString('es-CO')}/h
              </p>
              <p className="text-3xl font-bold text-primary">
                ${calculatedPayment.toLocaleString('es-CO')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ⏳ {t('orders.pendingClientApproval')}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-[#a83f34] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {editData ? t('common.update') : t('orders.registerHours')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterHoursModal;
