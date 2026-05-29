'use client';

import {
  analyticsTrackRequestSchema,
  type AnalyticsTrackRequest,
} from "../../../../../packages/utils/kafka/analytics-contract";

export async function postAnalyticsEvent(input: AnalyticsTrackRequest): Promise<boolean> {
  const parsedInput = analyticsTrackRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    console.warn("Skipped invalid analytics event on client", parsedInput.error.issues);
    return false;
  }

  try {
    const response = await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify(parsedInput.data),
    });

    return response.ok;
  } catch (error) {
    console.warn("Failed to post analytics event", error);
    return false;
  }
}
