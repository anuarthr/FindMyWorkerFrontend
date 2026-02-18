// src/components/portfolio/PortfolioGrid.jsx
import { useTranslation } from 'react-i18next';
import PortfolioItemCard from './PortfolioItemCard';

const PortfolioGrid = ({ items, readonly = false, onEdit, onDelete, currentLang, variant = 'default' }) => {
  const { t } = useTranslation();

  if (!items?.length) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        {t('portfolio.emptyState')}
      </div>
    );
  }

  // Configuración de grid según variante
  const gridClasses = {
    default: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    large: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={gridClasses[variant]}>
      {items.map((item) => (
        <PortfolioItemCard
          key={item.id}
          item={item}
          readonly={readonly}
          onEdit={onEdit}
          onDelete={onDelete}
          currentLang={currentLang}
          variant={variant}
        />
      ))}
    </div>
  );
};

export default PortfolioGrid;
