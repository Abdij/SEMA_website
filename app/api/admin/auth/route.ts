import { NextResponse } from "next/server";
import { AdminConfigurationError, verifyAdminPassword } from "@/lib/admin";
import { checkRateLimit, getAdminLoginRateLimitPer5Minutes, getClientIdentifier } from "@/lib/analytics-server";

export async function POST(request: Request) {
  const clientIdentifier = getClientIdentifier(request);
  const withinLimit = checkRateLimit(
    `admin-login:${clientIdentifier}`,
    getAdminLoginRateLimitPer5Minutes(),
    5 * 60 * 1000,
  );

  if (!withinLimit) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const password = typeof body.password === "string" ? body.password : "";

  try {
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
}
