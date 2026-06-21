import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing publication id" }, { status: 400 });
  }

  const pool = getPool();
  const result = await pool.query(
    `select file_name, file_mime, file_data, file_url from publications where id = $1 limit 1`,
    [id],
  );

  if (!result.rows.length) {
    return NextResponse.json({ message: "Publication not found" }, { status: 404 });
  }

  const row = result.rows[0];
  if (!row.file_data) {
    if (row.file_url) {
      return NextResponse.redirect(row.file_url);
    }
    return NextResponse.json({ message: "No file available" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", row.file_mime || "application/octet-stream");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${row.file_name || "publication"}"`,
  );

  return new Response(row.file_data, { status: 200, headers });
}
