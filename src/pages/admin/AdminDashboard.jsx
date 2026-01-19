import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle, XCircle, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Cargar lista de pendientes al montar
  useEffect(() => {
    const fetchPendingWorkers = async () => {
      try {
        const { data } = await api.get('/admin/workers/pending/');
        
        // Handle paginated response or direct array
        const workersArray = data?.results || data?.data || data;
        setWorkers(Array.isArray(workersArray) ? workersArray : []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate('/login'); 
        } else {
          setError('No se pudo conectar con el servidor de administración.');
        }
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingWorkers();
  }, [navigate]);

  // 2. Manejar la acción de Aprobar
  const handleApprove = async (workerId) => {
    const originalWorkers = [...workers];
    setWorkers(prev => prev.filter(w => w.id !== workerId));

    try {
      await api.post(`/admin/workers/${workerId}/approve/`);
      console.log(`Trabajador ${workerId} aprobado.`);
    } catch (err) {
      console.error("Error aprobando:", err);
      setWorkers(originalWorkers);
      alert("Hubo un error al intentar aprobar al trabajador.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-neutral-dark text-white rounded-lg shadow-lg">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-neutral-dark">{t('admin.dashboardTitle')}</h1>
            <p className="text-gray-500">{t('admin.dashboardSubtitle')}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Contenido Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-lg text-neutral-dark flex items-center gap-2">
              {t('admin.pendingRequests')}
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                {workers.length}
              </span>
            </h2>
          </div>

          {workers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-gray-400">
              <UserCheck size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500">{t('admin.emptyStateTitle')}</p>
              <p className="text-sm">{t('admin.emptyStateBody')}</p>
            </div>
          ) : (
            // Tabla de Datos
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">{t('admin.tableId')}</th>
                    <th className="p-4">{t('admin.tableProfessional')}</th>
                    <th className="p-4">{t('admin.tableLocation')}</th>
                    <th className="p-4">{t('admin.tableBio')}</th>
                    <th className="p-4 text-right">{t('admin.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 font-mono text-xs text-gray-400">#{worker.id}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-neutral-dark">{worker.profession}</p>
                          <p className="text-xs text-gray-500">${worker.hourly_rate}/hr • {worker.years_experience} años</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {worker.latitude ? (
                          <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-md w-fit text-xs font-bold">
                            <CheckCircle size={12} /> {t('admin.statusDefined')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md w-fit text-xs font-bold">
                            <XCircle size={12} /> {t('admin.statusPending')}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                        {worker.bio || "Sin biografía..."}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleApprove(worker.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 ml-auto cursor-pointer"
                        >
                          <CheckCircle size={16} />
                          {t('admin.approveBtn')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
