import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "user-ui",
    status: "ok",
    check: "liveness",
    timestamp: new Date().toISOString(),
  });
}
