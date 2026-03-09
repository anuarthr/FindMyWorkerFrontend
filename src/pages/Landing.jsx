import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, CreditCard, Star, MapPin, Search, UserCheck } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

export default function Landing() {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      icon: <Search size={26} />,
      title: t('landing.step1Title'),
      desc: t('landing.step1Desc'),
    },
    {
      number: '02',
      icon: <UserCheck size={26} />,
      title: t('landing.step2Title'),
      desc: t('landing.step2Desc'),
    },
    {
      number: '03',
      icon: <CreditCard size={26} />,
      title: t('landing.step3Title'),
      desc: t('landing.step3Desc'),
    },
  ];

  const features = [
    {
      icon: <UserCheck size={26} />,
      title: t('landing.feature1Title'),
      desc: t('landing.feature1Desc'),
    },
    {
      icon: <ShieldCheck size={26} />,
      title: t('landing.feature2Title'),
      desc: t('landing.feature2Desc'),
    },
    {
      icon: <Star size={26} />,
      title: t('landing.feature3Title'),
      desc: t('landing.feature3Desc'),
    },
    {
      icon: <MapPin size={26} />,
      title: t('landing.feature4Title'),
      desc: t('landing.feature4Desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      {/* ── HERO ── */}
      <section className="relative bg-neutral-dark overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-md h-112 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          {/* Logo */}
          <img
            src="/FindMyWorkerLogoVect.png"
            alt="FindMyWorker"
            className="h-52 sm:h-64 w-auto mx-auto mb-8 brightness-0 invert"
          />

          {/* Título principal */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            {t('landing.heroTitle')}{' '}
            <span className="text-secondary">{t('landing.heroTitleHighlight')}</span>
          </h1>

          <p className="text-white/65 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {t('landing.heroSubtitle')}
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg"
            >
              {t('landing.ctaGetStarted')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors border border-white/20"
            >
              {t('landing.ctaLogin')}
            </Link>
          </div>


        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="how-it-works" className="bg-neutral-light py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
              {t('landing.howItWorksTitle')}
            </h2>
            <p className="text-neutral-dark/55 text-base sm:text-lg">
              {t('landing.howItWorksSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ number, icon, title, desc }) => (
              <div
                key={number}
                className="relative bg-surface rounded-2xl p-8 shadow-sm border border-neutral-dark/8 text-center"
              >
                {/* Número decorativo de fondo */}
                <div className="absolute -top-4 left-6 font-heading font-extrabold text-6xl text-primary/8 leading-none select-none">
                  {number}
                </div>

                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-5 mx-auto">
                  {icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-neutral-dark mb-2">{title}</h3>
                <p className="text-neutral-dark/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="bg-surface py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-neutral-dark mb-3">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-neutral-dark/55 text-base sm:text-lg">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-neutral-dark/10 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  {icon}
                </div>
                <h3 className="font-heading font-bold text-base text-neutral-dark mb-2">{title}</h3>
                <p className="text-neutral-dark/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LLAMADA A LA ACCIÓN FINAL */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('landing.ctaSectionTitle')}
          </h2>
          <p className="text-white/75 text-lg mb-10 leading-relaxed">
            {t('landing.ctaSectionSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register?role=CLIENT"
              className="inline-flex items-center justify-center bg-white hover:bg-neutral-light text-primary font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg"
            >
              {t('landing.ctaSignupClient')}
            </Link>
            <Link
              to="/register?role=WORKER"
              className="inline-flex items-center justify-center bg-white/15 hover:bg-white/25 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors border border-white/30"
            >
              {t('landing.ctaSignupWorker')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
