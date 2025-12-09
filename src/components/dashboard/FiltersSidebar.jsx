import React from 'react';
import { Star, X } from 'lucide-react';

const FiltersSidebar = ({ filters, setFilters, isOpen, toggleSidebar }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const categories = ["Plomero", "Electricista", "Albañil", "Pintor", "Carpintero"];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#4A3B32]/10 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="p-6 flex justify-between items-center border-b border-[#4A3B32]/10">
          <h2 className="font-bold text-xl text-[#4A3B32]">Filtros</h2>
          <button onClick={toggleSidebar} className="lg:hidden text-[#4A3B32]">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          
          {/* Categoría */}
          <div>
            <h3 className="text-sm font-bold text-[#4A3B32] uppercase mb-3 tracking-wider">Profesión</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat}
                    checked={filters.category === cat}
                    onChange={handleChange} // IMPORTANTE: Usa onChange aquí
                    className="accent-[#C04A3E] w-4 h-4"
                  />
                  <span className={`text-sm ${filters.category === cat ? 'text-[#C04A3E] font-bold' : 'text-gray-600'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Precio Slider */}
          <div>
            <h3 className="text-sm font-bold text-[#4A3B32] uppercase mb-3 tracking-wider">
              Precio Máximo
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>$0</span>
              <span className="font-bold text-[#C04A3E]">${parseInt(filters.maxPrice || 0).toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              name="maxPrice" 
              min="10000" 
              max="200000" 
              step="5000"
              value={filters.maxPrice} 
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C04A3E]"
            />
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-bold text-[#4A3B32] uppercase mb-3 tracking-wider">Calificación</h3>
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setFilters(prev => ({ ...prev, minRating: stars }))}
                  className={`flex items-center px-3 py-2 rounded-lg border transition-all ${
                    filters.minRating === stars 
                      ? 'border-[#C04A3E] bg-[#C04A3E]/5' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex text-[#E37B5B] mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} className={i >= stars ? "text-gray-300" : ""} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">& más</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Limpiar */}
        <div className="p-6 border-t border-[#4A3B32]/10 bg-gray-50">
          <button 
            onClick={() => setFilters({ category: '', minPrice: 0, maxPrice: 200000, minRating: 0, search: '' })}
            className="w-full py-2 text-sm font-bold text-[#C04A3E] hover:underline"
          >
            Limpiar Filtros
          </button>
        </div>
      </aside>
    </>
  );
};

export default FiltersSidebar;
