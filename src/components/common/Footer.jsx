import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Brand */}
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <img
                src="/FindMyWorkerLogoVect.png"
                alt="FindMyWorker"
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="font-heading font-bold text-lg">
                FindMy<span className="text-secondary">Worker</span>
              </span>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-heading font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
              {t('footer.platform')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/login" className="text-sm text-white/65 hover:text-white transition-colors">
                  {t('footer.login')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm text-white/65 hover:text-white transition-colors">
                  {t('footer.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-white/65">{t('footer.privacy')}</span>
              </li>
              <li>
                <span className="text-sm text-white/65">{t('footer.terms')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {year} FindMyWorker. {t('footer.rights')}
          </p>
          <a
            href="https://github.com/anuarthr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/35 hover:text-white/80 transition-colors"
            aria-label="GitHub"
          >
            <FaGithub size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
