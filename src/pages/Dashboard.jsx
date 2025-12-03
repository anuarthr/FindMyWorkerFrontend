import { useAuth } from '../context/authcontext';
import { LogOut, MapPin, Star } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-light">
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="font-heading font-bold text-xl tracking-wide">FindMyWorker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              {user?.role || 'GUEST'}
            </span>
            <button 
              onClick={logout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface rounded-xl shadow-sm border border-neutral-dark/5 overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-heading font-bold text-neutral-dark">
                  Hola, <span className="text-secondary">{user?.first_name || 'Usuario'}</span>
                </h2>
                <p className="text-neutral-dark/60 mt-1 flex items-center gap-2">
                  <MapPin size={16} /> Santa Marta, Colombia
                </p>
              </div>
              {user?.avatar && (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover border-4 border-neutral-light"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-neutral-light/50 p-6 rounded-lg border border-neutral-dark/5">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <Star className="fill-current" size={20} />
                  <span className="font-bold">Reputación</span>
                </div>
                <p className="text-3xl font-bold text-neutral-dark">4.8</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
