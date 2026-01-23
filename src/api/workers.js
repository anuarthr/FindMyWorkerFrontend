import api from './axios';

export const getWorkers = async (filters) => {
  const params = {
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    min_rating: filters.minRating > 0 ? filters.minRating : undefined,
    search: filters.search || undefined,
    profession: filters.category || undefined,
    
    lat: filters.userLocation?.lat,
    lng: filters.userLocation?.lng,
    radius: filters.radius || 20, 
    
    ordering: filters.sortBy || undefined
  };

  Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

  try {
    const response = await api.get('/workers/', { params });
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error("❌ Error fetching workers:", error);
    return [];
  }
};

export const getWorkerById = async (id) => {
  try {
    const response = await api.get(`/workers/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching worker ${id}:`, error);
    return null;
  }
};
