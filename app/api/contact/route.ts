import { NextResponse } from "next/server";
import { insertContactMessage, requireString } from "@/lib/db";
import { z } from "zod";
import { getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, securityResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await enforceRateLimit("contact", getClientIdentifier(request), 5, 3600);
    const body = await readLimitedJson(request);
    const parsed = z.object({
      name: z.string().trim().min(1).max(200), email: z.email().max(254),
      enquiryType: z.string().trim().min(1).max(200), subject: z.string().trim().min(1).max(300),
      message: z.string().trim().min(1).max(10000),
    }).safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Please enter valid contact details, email, subject and message." }, { status: 400 });
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
    return securityResponse(error) || NextResponse.json({ message: "Unable to save your message. Please try again later." }, { status: 503 });
  }
}
