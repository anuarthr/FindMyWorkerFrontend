import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientHome from '../components/dashboard/ClientHome';
import WorkerHome from '../components/dashboard/WorkerHome';
import AdminDashboard from './admin/AdminDashboard';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderContent = () => {
    if (user?.role === 'ADMIN' || user?.is_superuser) {
      return <AdminDashboard />;
    }
    if (user?.role === 'WORKER') {
      return <WorkerHome user={user} />;
    }
    return (
      <>
        {/* Banner de búsqueda inteligente */}
        <div 
          onClick={() => navigate('/search-workers')}
          className="bg-gradient-to-r from-[#C04A3E] to-[#E37B5B] rounded-xl p-6 mb-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                🤖 {t('dashboard.aiSearch')}
              </h3>
              <p className="text-white/90 text-sm">
                {t('dashboard.aiSearchDesc')}
              </p>
            </div>
            <div className="text-white text-4xl group-hover:scale-110 transition-transform">
              →
            </div>
          </div>
        </div>
        <ClientHome user={user} />
      </>
    );
  };

  const getRoleLabel = () => {
  if (user?.is_superuser) return t('common.role_ADMIN');
  return t(`common.role_${user?.role}`); 
};

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navbar */}
      <nav className="bg-surface border-b border-neutral-dark/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="font-heading font-bold text-2xl text-neutral-dark">
            FindMy<span className="text-primary">Worker</span>
          </h1>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-neutral-dark">{user?.first_name}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 rounded-full">
                {getRoleLabel()}
              </span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-neutral-dark/60 hover:text-primary hover:bg-primary/5 rounded-full transition-colors cursor-pointer"
              title={t('navbar.logout')}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
