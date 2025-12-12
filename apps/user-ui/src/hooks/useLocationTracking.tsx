import { useLocation } from '@/context/LocationContext';
import { LocationData, LocationState } from '@/context/LocationContext';

// Re-export types for compatibility
export type { LocationData, LocationState };

const useLocationTracking = (): LocationState => {
  return useLocation();
};

export default useLocationTracking;