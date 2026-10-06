import nodemailer from "nodemailer";
import type { insertDataRequest } from "@/lib/db";

type RequestInput = Parameters<typeof insertDataRequest>[0];
const notificationEmail = "dahiru@sema.org.so";

export async function sendDataRequestEmails(input: RequestInput, requestRef: string) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  const port = Number(process.env.SMTP_PORT || "587");
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM ||
      !Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Information request email: SMTP settings are missing or invalid.");
    return { requester: false, staff: false };
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  const details = [
    `Reference: ${requestRef}`,
    `Name: ${input.name}`,
    `Organization: ${input.organization || "Not provided"}`,
    `Role: ${input.role || "Not provided"}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Requester type: ${input.requesterType}`,
    `Data requested: ${input.dataRequested}`,
    `Geography: ${input.geography || "Not provided"}`,
    `Time period: ${input.timePeriod || "Not provided"}`,
    `Intended use: ${input.intendedUse}`,
    `Preferred format: ${input.preferredFormat}`,
    `Deadline: ${input.deadline || "Not provided"}`,
  ].join("\n");

  // Separate messages keep the internal notification independent of confirmation delivery.
  const results = await Promise.allSettled([
    transport.sendMail({
      from: SMTP_FROM,
      to: input.email,
      replyTo: notificationEmail,
      subject: `SEMA information request submitted — ${requestRef}`,
      text: `Dear ${input.name},\n\nYour information request has been submitted to SEMA for review. Please keep your reference: ${requestRef}.\n\nSubmission does not mean the request has been approved. For enquiries, reply to this email and include your reference.\n\nSEMA`,
    }),
    transport.sendMail({
      from: SMTP_FROM,
      to: notificationEmail,
      replyTo: input.email,
      subject: `New SEMA information request — ${requestRef}`,
      text: `A new information request has been submitted.\n\n${details}\n\nReview this request in the SEMA website admin panel.`,
    }),
  ]);
  const accepted = results.map((result, index) => {
    const sent = result.status === "fulfilled" && result.value.accepted.length > 0;
    if (!sent) {
      // Avoid logging SMTP credentials, message contents, or requester personal details.
      console.error("Information request email failed", { requestRef, recipient: index === 0 ? "requester" : "staff" });
    }
    return sent;
  });
  return { requester: accepted[0], staff: accepted[1] };
}
