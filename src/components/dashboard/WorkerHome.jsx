import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Clock, AlertTriangle, CheckCircle, Edit2, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

const WorkerHome = ({ user }) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasData = Boolean(profile?.profession) && Boolean(profile?.latitude) && Boolean(profile?.longitude);
  const isVerified = Boolean(profile?.is_verified);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const { data } = await api.get('workers/me/');
        setProfile(data);
      } catch (error) {
        console.error("Error refrescando perfil worker:", error);
        setProfile(user.worker_profile);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshProfile();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-dark">
            {t('workerHome.hello', { name: user.first_name })}
          </h1>
          <p className="text-neutral-dark/60 mt-1">{t('workerHome.subtitle')}</p>
        </div>       
      </div>

      {!hasData ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col md:flex-row items-start gap-4 animate-in fade-in">
          <div className="bg-white p-2 rounded-full text-amber-600 shrink-0 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg text-neutral-dark">
              {t('workerHome.completeProfileTitle')}
            </h3>
            <p className="text-sm opacity-80 mb-4 leading-relaxed text-amber-800">
              <Trans i18nKey="workerHome.completeProfileBody">
                 Los clientes no pueden encontrarte. Necesitamos saber tu <span className="font-bold">profesión</span> y <span className="font-bold">ubicación</span>.
              </Trans>
            </p>
            <Link 
              to="/profile/edit" 
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md"
            >
              {t('workerHome.completeProfileBtn')} <span className="text-lg">→</span>
            </Link>
          </div>
        </div>

      ) : !isVerified ? (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex flex-col md:flex-row items-start gap-4 animate-in fade-in">
          <div className="bg-white p-2 rounded-full text-blue-600 shrink-0 shadow-sm">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg text-blue-900">
              {t('workerHome.verificationTitle')}
            </h3>
            <p className="text-sm text-blue-800/80 mb-2 max-w-xl leading-relaxed">
              {t('workerHome.verificationBody')}
            </p>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mt-2">
              {t('workerHome.statusPending')}
            </span>
          </div>
          <Link 
            to="/profile/edit" 
            className="self-center md:self-start px-4 py-2 text-blue-700 font-bold hover:bg-blue-100 rounded-lg transition-colors"
          >
            {t('workerHome.editData')}
          </Link>
        </div>

      ) : (
        <div className="bg-white border border-neutral-dark/10 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full">
             <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-2xl border border-green-100">
               👷
             </div>
             <div>
               <h3 className="font-bold text-lg text-neutral-dark flex items-center gap-2">
                 {profile.profession}
                 <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold flex items-center gap-1">
                   <CheckCircle size={10} /> {t('workerHome.verified')}
                 </span>
               </h3>
               <div className="flex items-center gap-3 text-xs text-neutral-dark/60 mt-1">
                 <span className="flex items-center gap-1"><Briefcase size={12}/> {t('workerHome.yearsExp', { years: profile.years_experience })}</span>
                 <span className="flex items-center gap-1"><MapPin size={12}/> {t('workerHome.visibleInMap')}</span>
               </div>
             </div>
          </div>
          
          <Link 
            to="/profile/edit" 
            className="w-full md:w-auto flex justify-center items-center gap-2 border border-neutral-dark/20 hover:border-primary text-neutral-dark hover:text-primary px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            <Edit2 size={16} />
            {t('workerHome.edit')}
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">{t('workerHome.monthEarnings')}</p>
          <p className="text-3xl font-heading font-bold text-primary">$0.00</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">{t('workerHome.activeJobs')}</p>
          <p className="text-3xl font-heading font-bold text-neutral-dark">0</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">{t('workerHome.rating')}</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-heading font-bold text-neutral-dark">5.0</p>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHome;
