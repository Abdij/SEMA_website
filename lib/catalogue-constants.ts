// Canonical public-facing vocabulary for the Data Catalogue. Two distinct,
// deliberately separate sets -- never merge or rename across them, so wording
// stays consistent everywhere it is used.
//
// 1. General availability (dataset cards, region/district profiles, map panel).
// 2. Combination-filter verdict (dataset + location + status + period lookup).
//
// Never say "No IMSMA record = No contamination". Use the honest phrasing
// below instead.

export type AvailabilityStatus =
  | "available"
  | "partial"
  | "restricted"
  | "none"
  | "verification_required";

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  partial: "Partial",
  restricted: "Request / Approval Required",
  none: "No shared records identified",
  verification_required: "Verification required",
};

export type FilterVerdict =
  | "data_identified"
  | "partial_availability"
  | "no_records_identified"
  | "verification_required";

export const FILTER_VERDICT_LABELS: Record<FilterVerdict, string> = {
  data_identified: "Data identified",
  partial_availability: "Partial availability",
  no_records_identified: "No records identified",
  verification_required: "Verification required",
};

export const NO_RECORDS_DISCLAIMER =
  "No records identified in the currently available catalogue. This does not mean the hazard or activity does not exist -- data availability requires verification.";

export const VERIFICATION_REQUIRED_DISCLAIMER =
  "Data availability requires verification. Submit an Information Request for a definitive answer.";

export type DatasetCategory =
  | "nts"
  | "hazardous_area"
  | "accident"
  | "eod"
  | "eore"
  | "clearance";

export const DATASET_CATEGORY_LABELS: Record<DatasetCategory, string> = {
  nts: "Non-Technical Survey",
  hazardous_area: "Hazardous Areas",
  accident: "Mine / ERW Accidents",
  eod: "Explosive Ordnance Disposal",
  eore: "Explosive Ordnance Risk Education",
  clearance: "Clearance / Land Release",
};

export const GEO_LEVEL_LABELS = {
  state: "State / Federal Member State",
  region: "Region",
  district: "District",
  settlement: "Settlement",
} as const;

export type GeoLevel = keyof typeof GEO_LEVEL_LABELS;
