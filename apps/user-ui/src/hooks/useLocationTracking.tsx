'use client';

import { useState, useEffect } from 'react';


export interface LocationData {
  city: string;
  country: string;
  postalCode?: string;
}


interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
}


const useLocationTracking = (): LocationState => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once when the component mounts
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;

      try {
       
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data.');
        }

        const data = await response.json();
        const address = data.address;
        
        setLocation({
          city: address.city || address.town || address.village,
          country: address.country,
          postalCode: address.postcode,
        });

      } catch (err) {
        setError("Could not resolve location from coordinates.");
      } finally {
        setLoading(false);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(`Geolocation error: ${error.message}`);
      setLoading(false);
    };

    // Request the user's location
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

  }, []); 

  return { location, loading, error };
};

export default useLocationTracking;