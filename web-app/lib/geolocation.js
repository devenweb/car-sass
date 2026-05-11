'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Loader2 } from 'lucide-react';

export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: 'Mauritius',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, loading: false, error: 'Geolocation not supported' }));
      return;
    }

    const onSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Reverse geocoding using OpenStreetMap (Free, no key required)
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        setLocation({
          latitude,
          longitude,
          address: data.address.suburb || data.address.town || data.address.city || 'Mauritius',
          loading: false,
          error: null
        });
      } catch (err) {
        setLocation({
          latitude,
          longitude,
          address: 'Mauritius',
          loading: false,
          error: null
        });
      }
    };

    const onError = (error) => {
      setLocation(prev => ({ ...prev, loading: false, error: error.message }));
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  return location;
};

export const LocationBadge = () => {
  const { address, loading } = useGeolocation();

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
      {loading ? (
        <Loader2 size={12} className="animate-spin text-brand-yellow" />
      ) : (
        <MapPin size={12} className="text-brand-yellow" />
      )}
      <span>{loading ? 'Locating...' : address}</span>
    </div>
  );
};
