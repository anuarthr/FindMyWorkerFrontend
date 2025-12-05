import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import ClientHome from '../components/dashboard/ClientHome';
import WorkerHome from '../components/dashboard/WorkerHome';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navbar */}
      <nav className="bg-surface border-b border-neutral-dark/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-heading font-bold text-2xl text-neutral-dark">
            FindMy<span className="text-primary">Worker</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-neutral-dark">{user?.first_name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 rounded-full">
                {user?.role}
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="p-2 text-neutral-dark/60 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {user?.role === 'WORKER' ? (
          <WorkerHome user={user} />
        ) : (
          <ClientHome user={user} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
