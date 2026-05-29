'use client';

import useDeviceTracking from '@/hooks/useDeviceTracking';
import useLocationTracking from '@/hooks/useLocationTracking';
import useUser from '@/hooks/useUser';
import { postAnalyticsEvent } from '@/lib/analytics/track';
import type { AnalyticsTrackRequest } from '../../../../packages/utils/kafka/analytics-contract';

type TrackableAnalyticsEvent = Omit<
  AnalyticsTrackRequest,
  "country" | "city" | "device"
>;

type TrackOnceInput = TrackableAnalyticsEvent & {
  dedupeKey: string;
};

function getSessionDedupeKey(userId: string, dedupeKey: string): string {
  return `analytics:${userId}:${dedupeKey}`;
}

export default function useAnalytics() {
  const { user } = useUser();
  const { location } = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const trackEvent = async (input: TrackableAnalyticsEvent): Promise<boolean> => {
    if (!user?.id || !deviceInfo) {
      return false;
    }

    return postAnalyticsEvent({
      ...input,
      ...(location?.country ? { country: location.country } : {}),
      ...(location?.city ? { city: location.city } : {}),
      device: deviceInfo,
    });
  };

  const trackEventOnce = async ({
    dedupeKey,
    ...input
  }: TrackOnceInput): Promise<boolean> => {
    if (!user?.id || !deviceInfo || typeof window === "undefined") {
      return false;
    }

    const sessionKey = getSessionDedupeKey(user.id, dedupeKey);

    if (window.sessionStorage.getItem(sessionKey)) {
      return false;
    }

    const wasTracked = await trackEvent(input);

    if (wasTracked) {
      window.sessionStorage.setItem(sessionKey, "1");
    }

    return wasTracked;
  };

  return {
    canTrack: Boolean(user?.id && deviceInfo),
    trackEvent,
    trackEventOnce,
    user,
  };
}
