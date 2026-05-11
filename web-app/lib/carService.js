import { supabase } from './supabaseClient';

// Fetch all cars with optional limit
export const getAllCars = async (limit = null) => {
  let query = supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cars:', error.message);
    throw error;
  }

  return data;
};

// Fetch a single car by ID
export const getCarById = async (id) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching car with id ${id}:`, error.message);
    throw error;
  }

  return data;
};

// Fetch cars by category
export const getCarsByCategory = async (category, limit = null) => {
  let query = supabase
    .from('cars')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching cars in category ${category}:`, error.message);
    throw error;
  }

  return data;
};

// Fetch cars by price range
export const getCarsByPriceRange = async (minPrice, maxPrice) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .gte('price_per_day', minPrice)
    .lte('price_per_day', maxPrice)
    .order('price_per_day', { ascending: true });

  if (error) {
    console.error(`Error fetching cars in price range ${minPrice}-${maxPrice}:`, error.message);
    throw error;
  }

  return data;
};

// Search cars by name or description
export const searchCars = async (searchTerm) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error searching cars with term "${searchTerm}":`, error.message);
    throw error;
  }

  return data;
};

// Get unique car categories
export const getCarCategories = async () => {
  const { data, error } = await supabase
    .from('cars')
    .select('category')
    .order('category', { ascending: true });

  if (error) {
    console.error('Error fetching car categories:', error.message);
    throw error;
  }

  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
};
