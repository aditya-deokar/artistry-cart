import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "seller-ui",
    status: "ok",
    check: "liveness",
    timestamp: new Date().toISOString(),
  });
}
