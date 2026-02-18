// src/components/portfolio/PortfolioItemCard.jsx
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Pencil, Trash2, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

const PortfolioItemCard = ({ item, readonly = false, onEdit, onDelete, currentLang, variant = 'default' }) => {
  const { t } = useTranslation();

  const formattedDate = useMemo(() => {
    if (!item.created_at) return '';
    const date = new Date(item.created_at);
    const locale = currentLang === 'es' ? es : enUS;
    return format(date, 'PPP', { locale });
  }, [item.created_at, currentLang]);

  // Configuración de altura de imagen según variante
  const imageHeight = variant === 'large' ? 'h-64' : 'h-48';

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className={`relative ${imageHeight}`}>
        <img
          src={item.image_url}
          alt={item.title}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/fallback-image.png';
          }}
        />
        {/* Verified Badge - shown when linked to an order */}
        {item.order_info && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 shadow-md">
            <CheckCircle className="h-4 w-4 text-white" />
            <span className="text-xs font-medium text-white">
              {t('portfolio.verified')}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 text-base font-semibold text-neutral-dark line-clamp-2">
          {item.title}
        </h3>
        {formattedDate && (
          <p className="mb-2 text-xs text-gray-500">
            {formattedDate}
          </p>
        )}
        {item.description && (
          <p className="mb-3 line-clamp-3 text-sm text-gray-700">
            {item.description}
          </p>
        )}

        {!readonly && (
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(item)}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-neutral-light px-3 py-2 text-xs text-neutral-dark hover:bg-secondary/20 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              {t('common.edit')}
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(item)}
              className="flex flex-1 items-center justify-center gap-1 rounded bg-red-50 px-3 py-2 text-xs text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioItemCard;
