// Publications are tagged for the EORE Resources tab by their existing
// free-text "type" field rather than a new schema/category system — an
// admin creates or edits a publication and sets Type to exactly this value.
export const EORE_DOCUMENT_TYPE = "EORE Resource";

export function isEoreResource(documentType: string | undefined | null): boolean {
  return (documentType || "").trim().toLowerCase() === EORE_DOCUMENT_TYPE.toLowerCase();
}
