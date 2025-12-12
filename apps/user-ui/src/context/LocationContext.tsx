'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocationData {
    city: string;
    country: string;
    postalCode?: string;
}

export interface LocationState {
    location: LocationData | null;
    loading: boolean;
    error: string | null;
}

const LocationContext = createContext<LocationState | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        const handleSuccess = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;

            try {
                // Nominatim usage policy: Limit usage to 1 request per second.
                // Since this runs once per app mount, it should be safe.
                // CONSIDER: Adding a User-Agent header if this was server-side, but browser handles it.
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                );

                if (response.status === 429) {
                    throw new Error("Too many requests to location service.");
                }

                if (!response.ok) {
                    // ERR_HTTP2_SERVER_REFUSED_STREAM often means connection issues or blocking
                    // We treat it as a fetch error
                    throw new Error('Failed to fetch location data.');
                }

                const data = await response.json();
                const address = data.address;

                if (address) {
                    setLocation({
                        city: address.city || address.town || address.village || address.hamlet || '',
                        country: address.country || '',
                        postalCode: address.postcode || '',
                    });
                }
            } catch (err: any) {
                console.warn("Location fetch error:", err);
                setError("Could not resolve location from coordinates.");
            } finally {
                setLoading(false);
            }
        };

        const handleError = (error: GeolocationPositionError) => {
            console.warn("Geolocation error:", error.message);
            setError(`Geolocation error: ${error.message}`);
            setLoading(false);
        };

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
            timeout: 10000,
            maximumAge: 1000 * 60 * 60 // Cache location for 1 hour to prevent re-reads
        });

    }, []);

    return (
        <LocationContext.Provider value={{ location, loading, error }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = (): LocationState => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
