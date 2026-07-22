// Shared option lists for the dashboard-access gate form, its server-side
// validation, and the admin filters. Single source of truth so the modal,
// the API route, and the admin UI never drift out of sync.

export const ORGANIZATION_TYPES = [
  "government",
  "united_nations",
  "international_ngo",
  "national_ngo",
  "civil_society",
  "donor",
  "academic",
  "private_sector",
  "media",
  "independent_consultant",
  "other",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const ACTIVITY_TYPES = [
  "humanitarian",
  "development",
  "peacebuilding",
  "stabilization",
  "mine_action",
  "protection",
  "emergency_response",
  "government_services",
  "research_academia",
  "donor_funding",
  "private_sector",
  "media",
  "other",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const MAX_ORGANIZATION_NAME_LENGTH = 300;
export const MAX_OTHER_TEXT_LENGTH = 200;
export const MAX_COUNTRY_LENGTH = 120;
export const MAX_ACTIVITY_TYPES_SELECTED = ACTIVITY_TYPES.length;
