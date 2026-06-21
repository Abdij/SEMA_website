import { NextResponse } from "next/server";
import { insertContactMessage, requireString } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const consent = body.consent;

    if (consent !== "on" && consent !== true) {
      return NextResponse.json(
        { message: "Consent is required before the message can be submitted." },
        { status: 400 },
      );
    }

    const saved = await insertContactMessage({
      name: requireString(body.name, "Full name"),
      organization: typeof body.organization === "string" ? body.organization.trim() : undefined,
      email: requireString(body.email, "Email"),
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      enquiryType: requireString(body.enquiryType, "Enquiry type"),
      subject: requireString(body.subject, "Subject"),
      message: requireString(body.message, "Message"),
    });

    return NextResponse.json({
      id: saved.id,
      message: "Message submitted.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit contact message.";
    const status = message.includes("DATABASE_URL") ? 503 : 400;

    return NextResponse.json({ message }, { status });
  }
}
