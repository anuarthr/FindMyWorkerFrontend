import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-surface/95 backdrop-blur-sm border-b border-neutral-dark/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/FindMyWorkerLogoVect.png" alt="FindMyWorker" className="h-14 w-auto" />
          <span className="font-heading font-bold text-lg text-neutral-dark hidden sm:block">
            FindMy<span className="text-primary">Worker</span>
          </span>
        </Link>

        {/* Navegación escritorio */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-neutral-dark/70 hover:text-primary transition-colors"
          >
            {t('header.howItWorks')}
          </a>
        </nav>

        {/* Acciones escritorio */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="text-sm font-medium text-neutral-dark/70 hover:text-primary transition-colors px-4 py-2 rounded-lg border border-neutral-dark/20 hover:border-primary"
          >
            {t('header.login')}
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
          >
            {t('header.register')}
          </Link>
        </div>

        {/* Botón menú móvil */}
        <button
          className="md:hidden p-2 rounded-lg text-neutral-dark hover:bg-neutral-light transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-dark/10 bg-surface px-4 py-4 flex flex-col gap-3">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-neutral-dark/70 hover:text-primary py-2"
            onClick={() => setMenuOpen(false)}
          >
            {t('header.howItWorks')}
          </a>
          <div className="py-1">
            <LanguageSwitcher />
          </div>
          <Link
            to="/login"
            className="text-sm text-center font-medium text-neutral-dark border border-neutral-dark/20 rounded-lg py-2.5 hover:border-primary hover:text-primary transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t('header.login')}
          </Link>
          <Link
            to="/register"
            className="text-sm text-center font-semibold bg-primary hover:bg-primary-hover text-white rounded-lg py-2.5 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            {t('header.register')}
          </Link>
        </div>
      )}
    </header>
  );
}
