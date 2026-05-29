/**
 * Skeleton primitives + skeletons específicos de pantalla.
 * Todos animan con animate-pulse y respetan el shape real del componente
 * que reemplazan, para que no haya "salto" cuando llega la data.
 */

const ShimmerBlock = ({ className = '' }) => (
  <div className={`bg-neutral-dark/10 rounded animate-pulse ${className}`} />
);

/**
 * Placeholder de una WorkerCard mientras carga ClientHome.
 * Imita el header (avatar + nombre + chip), bio, skills chips y footer.
 */
export const WorkerCardSkeleton = () => (
  <div className="bg-white border border-neutral-dark/10 rounded-xl overflow-hidden flex flex-col h-full">
    <div className="p-5 flex items-start space-x-4">
      <div className="w-14 h-14 rounded-full bg-neutral-dark/10 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <ShimmerBlock className="h-4 w-3/4" />
        <ShimmerBlock className="h-3 w-1/2" />
        <ShimmerBlock className="h-3 w-1/3" />
      </div>
      <ShimmerBlock className="h-7 w-12 shrink-0" />
    </div>
    <div className="px-5 pb-4 grow space-y-2">
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-3 w-5/6" />
      <div className="flex gap-2 mt-3">
        <ShimmerBlock className="h-5 w-16" />
        <ShimmerBlock className="h-5 w-20" />
        <ShimmerBlock className="h-5 w-14" />
      </div>
    </div>
    <div className="p-4 border-t border-neutral-dark/10 bg-gray-50 flex items-center justify-between">
      <div className="space-y-2">
        <ShimmerBlock className="h-3 w-16" />
        <ShimmerBlock className="h-5 w-20" />
      </div>
      <ShimmerBlock className="h-9 w-24" />
    </div>
  </div>
);

/**
 * Grid de 6 cards para ClientHome.
 */
export const WorkerGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <WorkerCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Placeholder de una fila de orden en WorkerOrders/ClientOrders.
 */
export const OrderRowSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neutral-dark/10 animate-pulse" />
          <div className="space-y-2 flex-1">
            <ShimmerBlock className="h-4 w-1/3" />
            <ShimmerBlock className="h-3 w-1/4" />
          </div>
          <ShimmerBlock className="h-6 w-20" />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <ShimmerBlock className="h-3 w-1/4" />
          <ShimmerBlock className="h-3 w-full" />
          <ShimmerBlock className="h-3 w-3/4" />
        </div>
      </div>
      <div className="flex md:flex-col gap-2 md:w-40">
        <ShimmerBlock className="h-10 flex-1 md:flex-none" />
        <ShimmerBlock className="h-10 flex-1 md:flex-none" />
      </div>
    </div>
  </div>
);

/**
 * Lista de 3 órdenes para WorkerOrders/ClientOrders mientras carga.
 */
export const OrdersListSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <OrderRowSkeleton key={i} />
    ))}
  </div>
);

export default {
  WorkerCardSkeleton,
  WorkerGridSkeleton,
  OrderRowSkeleton,
  OrdersListSkeleton,
};
