/** RFC 5987 UTF-8 filename plus a safe ASCII fallback for older clients. */
export function attachmentDisposition(filename: string) {
  const name = Array.from(filename || "publication")
    .filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
    .join("").replace(/[\\/]/g, "_").slice(0, 180) || "publication";
  const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(name.toWellFormed()).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
