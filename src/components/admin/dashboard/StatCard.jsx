import { useTranslation } from 'react-i18next';

const COLOR_MAP = {
  primary:   { value: 'text-primary',                bg: 'bg-primary/10'   },
  secondary: { value: 'text-secondary',              bg: 'bg-secondary/10' },
  completed: { value: 'text-status-completed',       bg: 'bg-status-completed/10' },
  dark:      { value: 'text-neutral-dark',           bg: 'bg-neutral-dark/10' },
};

/**
 * Tarjeta KPI usada en la fila de métricas principales del tablero administrativo.
 *
 * @param {string}  id      - ID único para aria-labelledby
 * @param {string}  title   - Etiqueta de la tarjeta
 * @param {*}       value   - Valor formateado a mostrar
 * @param {node}    icon    - Elemento SVG del ícono
 * @param {string}  color   - Clave de color del COLOR_MAP
 * @param {number}  trend   - Opcional: número positivo mostrado como "▲ +N nuevos esta semana"
 */
const StatCard = ({ id, title, value, icon, color = 'primary', trend = null }) => {
  const { t } = useTranslation();
  const { value: textColor, bg } = COLOR_MAP[color] ?? COLOR_MAP.primary;

  return (
    <article
      role="region"
      aria-labelledby={id}
      className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-sans text-neutral-dark/60 font-medium">{title}</span>
        <span className={`${bg} ${textColor} p-2 rounded-lg`} aria-hidden="true">
          {icon}
        </span>
      </div>

      <p id={id} className={`text-3xl font-heading font-bold ${textColor}`}>
        {value !== null && value !== undefined
          ? value
          : <span className="text-base text-neutral-dark/40">{t('adminDashboard.noDataYet')}</span>}
      </p>

      {trend !== null && trend !== undefined && (
        <p className="text-xs text-status-completed font-sans font-semibold">
          ▲ +{trend} {t('adminDashboard.lastWeek')}
        </p>
      )}
    </article>
  );
};

export default StatCard;
