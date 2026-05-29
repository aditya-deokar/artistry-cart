import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import {
  analyticsTrackRequestSchema,
  publishAnalyticsEvent,
} from "@artistry-cart/utils/kafka";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        status: "skipped",
        reason: "unauthenticated",
      },
      { status: 202 },
    );
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        reason: "invalid_json",
      },
      { status: 400 },
    );
  }

  const parsedRequest = analyticsTrackRequestSchema.safeParse(requestBody);

  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        status: "error",
        reason: "invalid_event",
        issues: parsedRequest.error.issues,
      },
      { status: 400 },
    );
  }

  try {
    const event = await publishAnalyticsEvent({
      ...parsedRequest.data,
      userId: currentUser.id,
      source: parsedRequest.data.source ?? "user-ui.client",
    });

    return NextResponse.json(
      {
        status: "queued",
        eventId: event.eventId,
      },
      { status: 202 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        reason: "publish_failed",
      },
      { status: 503 },
    );
  }
}
