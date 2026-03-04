/** Bloque de skeleton animado reutilizable */
const SkeletonBlock = ({ className }) => (
  <div className={`bg-neutral-dark/10 rounded-lg animate-pulse ${className}`} />
);

/**
 * Skeleton de página completa que replica el layout real del dashboard.
 * Usa animate-pulse y tonos neutros consistentes con el sistema de diseño.
 */
const DashboardSkeleton = () => (
  <div
    className="min-h-screen bg-neutral-light p-4 md:p-8"
    aria-busy="true"
    aria-label="Cargando métricas"
  >
    {/* Header */}
    <div className="mb-8 flex items-center justify-between">
      <div>
        <SkeletonBlock className="h-8 w-56 mb-2" />
        <SkeletonBlock className="h-4 w-36" />
      </div>
      <SkeletonBlock className="h-10 w-28 rounded-lg" />
    </div>

    {/* KPI cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6 h-36"
        >
          <div className="flex items-center justify-between mb-4">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-6 w-6 rounded-full" />
          </div>
          <SkeletonBlock className="h-8 w-3/4 mb-2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      ))}
    </div>

    {/* Charts row 1 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
        >
          <SkeletonBlock className="h-6 w-44 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
      ))}
    </div>

    {/* Charts row 2 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
        >
          <SkeletonBlock className="h-6 w-44 mb-6" />
          <SkeletonBlock className="h-64 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export default DashboardSkeleton;
