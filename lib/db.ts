import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var semaPool: Pool | undefined;
}

export function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!global.semaPool) {
    global.semaPool = new Pool({
      connectionString,
      ssl:
        connectionString.includes("sslmode=require") ||
        connectionString.includes("supabase") ||
        connectionString.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }

  return global.semaPool;
}

export async function insertContactMessage(input: {
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  enquiryType: string;
  subject: string;
  message: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into contact_messages
      (name, organization, email, phone, enquiry_type, subject, message)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id`,
    [
      input.name,
      input.organization || null,
      input.email,
      input.phone || null,
      input.enquiryType,
      input.subject,
      input.message,
    ],
  );

  return result.rows[0] as { id: string };
}

export async function insertDataRequest(input: {
  name: string;
  organization?: string;
  role?: string;
  email: string;
  phone?: string;
  requesterType: string;
  dataRequested: string;
  geography?: string;
  timePeriod?: string;
  intendedUse: string;
  preferredFormat: string;
  deadline?: string;
}) {
  const pool = getPool();
  const result = await pool.query(
    `insert into data_requests
      (name, organization, role, email, phone, requester_type, data_requested, geography, time_period, intended_use, preferred_format, deadline)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning id, request_ref`,
    [
      input.name,
      input.organization || null,
      input.role || null,
      input.email,
      input.phone || null,
      input.requesterType,
      input.dataRequested,
      input.geography || null,
      input.timePeriod || null,
      input.intendedUse,
      input.preferredFormat,
      input.deadline || null,
    ],
  );

  return result.rows[0] as { id: string; request_ref: string };
}

export function requireString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}
