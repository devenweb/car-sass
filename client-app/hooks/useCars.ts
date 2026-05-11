import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('name');

      if (error) throw error;
      setCars(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return { cars, loading, error, refetch: fetchCars };
}
