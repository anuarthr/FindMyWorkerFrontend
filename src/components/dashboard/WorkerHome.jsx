import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WorkerHome = ({ user }) => {
  const isProfileComplete = user.worker_profile?.profession; 

  return (
    <div className="space-y-6">
      
      {/* Alerta Onboarding */}
      {!isProfileComplete && (
        <div className="bg-secondary/10 border border-secondary text-neutral-dark p-6 rounded-xl flex items-start gap-4">
          <div className="bg-white p-2 rounded-full text-secondary shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">¡Completa tu perfil para recibir ofertas!</h3>
            <p className="text-sm opacity-80 mb-3">
              Los clientes no pueden encontrarte si no saben qué haces ni cuánto cobras.
            </p>
            <Link 
              to="/profile/edit" 
              className="inline-block bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Completar Perfil Ahora
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase">Ganancias del Mes</p>
          <p className="text-3xl font-heading font-bold text-primary">$0.00</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase">Trabajos Activos</p>
          <p className="text-3xl font-heading font-bold text-neutral-dark">0</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase">Calificación</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-heading font-bold text-neutral-dark">5.0</p>
            <CheckCircle size={20} className="text-success" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHome;
