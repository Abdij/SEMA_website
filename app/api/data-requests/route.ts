import { NextResponse } from "next/server";
import { insertDataRequest, requireString } from "@/lib/db";
import { z } from "zod";
import { sendDataRequestEmails } from "@/lib/data-request-email";
import { getClientIdentifier } from "@/lib/analytics-server";
import { enforceRateLimit, readLimitedJson, securityResponse } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await enforceRateLimit("data-request", getClientIdentifier(request), 3, 3600);
    const body = await readLimitedJson(request);
    const acceptedTerms = body.terms;

    if (acceptedTerms !== "on" && acceptedTerms !== true) {
      return NextResponse.json(
        { message: "You must accept the data request terms before submitting." },
        { status: 400 },
      );
    }

    const fields = z.object({
      name: z.string().trim().min(1).max(200), requesterType: z.string().trim().min(1).max(200),
      dataRequested: z.string().trim().min(1).max(10000), intendedUse: z.string().trim().min(1).max(10000),
      preferredFormat: z.string().trim().min(1).max(200),
      deadline: z.union([z.literal(""), z.iso.date()]).optional(),
    }).safeParse(body);
    if (!fields.success) return NextResponse.json({ message: "Please complete the required fields with valid values." }, { status: 400 });
    const email = z.email().max(254).safeParse(typeof body.email === "string" ? body.email.trim() : body.email);
    if (!email.success) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const input = {
      name: requireString(body.name, "Full name"),
      organization: typeof body.organization === "string" ? body.organization.trim() : undefined,
      role: typeof body.role === "string" ? body.role.trim() : undefined,
      email: email.data,
      phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
      requesterType: requireString(body.requesterType, "Requester type"),
      dataRequested: requireString(body.dataRequested, "Data requested"),
      geography: typeof body.geography === "string" ? body.geography.trim() : undefined,
      timePeriod: typeof body.timePeriod === "string" ? body.timePeriod.trim() : undefined,
      intendedUse: requireString(body.intendedUse, "Intended use"),
      preferredFormat: requireString(body.preferredFormat, "Preferred format"),
      deadline: typeof body.deadline === "string" && body.deadline ? body.deadline : undefined,
    };
    // Bound mail to any one recipient even when requests originate from different IPs.
    await enforceRateLimit("data-request-recipient", email.data.toLowerCase(), 2, 3600);
    await enforceRateLimit("data-request-total", "all", 100, 3600);
    const saved = await insertDataRequest(input);
    let emailNotifications = { requester: false, staff: false };
    try {
      emailNotifications = await sendDataRequestEmails(input, saved.request_ref);
    } catch {
      console.error("Information request email failed", { requestRef: saved.request_ref });
    }

    return NextResponse.json({
      id: saved.id,
      requestRef: saved.request_ref,
      emailNotifications,
      message: "Data request submitted.",
    });
  } catch (error) {
    return securityResponse(error) || NextResponse.json({ message: "Unable to save your request. Please try again later." }, { status: 503 });
  }
}
