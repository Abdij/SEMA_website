import { NextResponse } from "next/server";
import { insertDataRequest, requireString } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const acceptedTerms = body.terms;

    if (acceptedTerms !== "on" && acceptedTerms !== true) {
      return NextResponse.json(
        { message: "You must accept the data request terms before submitting." },
        { status: 400 },
      );
    }

    const saved = await insertDataRequest({
      name: requireString(body.name, "Full name"),
      organization: typeof body.organization === "string" ? body.organization.trim() : undefined,
      role: typeof body.role === "string" ? body.role.trim() : undefined,
      email: requireString(body.email, "Email"),
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      requesterType: requireString(body.requesterType, "Requester type"),
      dataRequested: requireString(body.dataRequested, "Data requested"),
      geography: typeof body.geography === "string" ? body.geography.trim() : undefined,
      timePeriod: typeof body.timePeriod === "string" ? body.timePeriod.trim() : undefined,
      intendedUse: requireString(body.intendedUse, "Intended use"),
      preferredFormat: requireString(body.preferredFormat, "Preferred format"),
      deadline: typeof body.deadline === "string" && body.deadline ? body.deadline : undefined,
    });

    return NextResponse.json({
      id: saved.id,
      requestRef: saved.request_ref,
      message: "Data request submitted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit data request.";
    const status = message.includes("DATABASE_URL") ? 503 : 400;

    return NextResponse.json({ message }, { status });
  }
}
