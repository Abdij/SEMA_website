export type NewsPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image: string;
  body: string[];
  sourceLabel?: string;
  sourceUrl?: string;
};

export type Publication = {
  title: string;
  type: string;
  description: string;
  href: string;
  source: string;
};

export type Partner = {
  name: string;
  type: string;
  description: string;
  href?: string;
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/mandate", label: "Mandate" },
  { href: "/operations", label: "Operations" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/publications", label: "Publications" },
  { href: "/conventions", label: "Convention Progress" },
  { href: "/news", label: "News" },
  { href: "/data-request", label: "Data Request" },
  { href: "/contact", label: "Contact" },
];

export const officialSources = [
  {
    label: "Anti-Personnel Mine Ban Convention - Somalia profile",
    href: "https://www.apminebanconvention.org/en/membership/somalia",
  },
  {
    label: "Somalia Article 5 extension process",
    href: "https://www.apminebanconvention.org/en/membership/somalia/somalias-extension-request-process",
  },
  {
    label: "UNMAS Somalia",
    href: "https://unmas.org/en/where-we-work/somalia",
  },
  {
    label: "Mine Action Review - Somalia",
    href: "https://www.mineactionreview.org/country/somalia/anti-personnel-mines",
  },
  {
    label: "Landmine and Cluster Munition Monitor - Somalia impact profile",
    href: "https://the-monitor.org/country-profile/somalia/impact",
  },
  {
    label: "Convention on Cluster Munitions - country profiles",
    href: "https://www.clusterconvention.org/country-profiles/",
  },
];

export const quickStats = [
  {
    value: "2012",
    label: "Mine Ban Convention entered into force for Somalia",
  },
  {
    value: "2027",
    label: "Current Article 5 clearance deadline",
  },
  {
    value: "FMS",
    label: "Federal Member State coordination focus",
  },
  {
    value: "EORE",
    label: "Explosive ordnance risk education priority",
  },
];

export const serviceAreas = [
  {
    title: "National Coordination",
    text: "Coordinate government institutions, Federal Member States, operators, donors, and technical partners around national mine action priorities.",
  },
  {
    title: "Information Management",
    text: "Strengthen the systems used to collect, validate, analyze, and share mine action information for planning and public reporting.",
  },
  {
    title: "Standards and Quality",
    text: "Maintain policies, standards, accreditation processes, and quality management expectations for operators working in Somalia.",
  },
  {
    title: "Public Information",
    text: "Publish official updates, risk education messages, policy documents, dashboards, data access guidance, and public contact channels.",
  },
];

export const conventionMilestones = [
  {
    date: "16 April 2012",
    title: "Somalia acceded to the Anti-Personnel Mine Ban Convention",
    text: "Somalia became a State Party through accession, establishing treaty obligations on anti-personnel mines.",
  },
  {
    date: "1 October 2012",
    title: "Convention entered into force for Somalia",
    text: "The Anti-Personnel Mine Ban Convention entered into force for Somalia on this date.",
  },
  {
    date: "2022",
    title: "Article 5 extension granted",
    text: "Somalia's first Article 5 deadline extension was granted, setting the current deadline for completion of clearance obligations.",
  },
  {
    date: "1 October 2027",
    title: "Current Article 5 deadline",
    text: "The site should track SEMA's national progress against this deadline with verified figures, annual reports, and source links.",
  },
];

export const clusterConventionMilestones = [
  {
    date: "3 December 2008",
    title: "Somalia signed the Convention on Cluster Munitions",
    text: "Somalia signed the convention when it opened for signature in Oslo.",
  },
  {
    date: "30 September 2015",
    title: "Somalia ratified the Convention on Cluster Munitions",
    text: "Ratification made Somalia a State Party to the cluster munition ban framework.",
  },
  {
    date: "1 March 2016",
    title: "Convention entered into force for Somalia",
    text: "The convention became binding for Somalia, including reporting, clearance, and victim assistance obligations.",
  },
];

export const publications: Publication[] = [
  {
    title: "Somalia Article 7 Report for 2024",
    type: "Treaty report",
    description: "Federal Government of Somalia transparency reporting under the Anti-Personnel Mine Ban Convention.",
    href: "https://www.apminebanconvention.org/fileadmin/_APMBC-DOCUMENTS/Art7Reports/2025-Somalia-Art7Repport-for2024.pdf",
    source: "AP Mine Ban Convention",
  },
  {
    title: "Somalia Article 7 Report for 2023",
    type: "Treaty report",
    description: "Annual transparency report covering Article 7 information for Somalia.",
    href: "https://www.apminebanconvention.org/fileadmin/_APMBC-DOCUMENTS/Art7Reports/2024-Somalia-Art7Report-for2023.pdf",
    source: "AP Mine Ban Convention",
  },
  {
    title: "Victim Assistance Assessment Report in Somalia",
    type: "Assessment",
    description: "Report commissioned by UNMAS Somalia and SEMA on support to victims of explosive hazards.",
    href: "https://somalia.un.org/en/41550-victim-assistance-assessment-report-somalia",
    source: "United Nations Somalia",
  },
  {
    title: "SEMA policies and standards",
    type: "SEMA documents",
    description: "Upload official SEMA policies, national standards, strategies, accreditation guidance, and public forms here.",
    href: "/documents/",
    source: "SEMA",
  },
];

export const newsPosts: NewsPost[] = [
  {
    slug: "article-5-deadline-tracker",
    title: "Somalia's Article 5 deadline tracker prepared for public reporting",
    date: "2026-06-21",
    category: "Convention progress",
    summary: "The new SEMA website includes a convention-progress section for tracking verified national progress against Article 5 obligations.",
    image: "/images/mine-survey.jpg",
    body: [
      "The official website structure includes a dedicated convention-progress page for the Anti-Personnel Mine Ban Convention and related mine action commitments.",
      "The tracker is designed to connect public dashboards, annual Article 7 reports, implementation milestones, and SEMA-approved progress figures.",
      "Figures should be published only after SEMA validation and should link to official treaty reports or dashboards where possible.",
    ],
    sourceLabel: "AP Mine Ban Convention Somalia profile",
    sourceUrl: "https://www.apminebanconvention.org/en/membership/somalia",
  },
  {
    slug: "unmas-supports-somalia-mine-action",
    title: "UNMAS continues support to Somalia mine action coordination",
    date: "2026-06-01",
    category: "Partner update",
    summary: "UNMAS Somalia public information highlights continued support for national mine action capacity and explosive hazard reduction.",
    image: "/images/coordination-meeting.jpg",
    body: [
      "UNMAS remains a key technical partner for Somalia's mine action sector, including support to national authorities and explosive hazard risk reduction.",
      "SEMA's public website should connect users to partner information while clearly distinguishing SEMA official publications from external partner updates.",
    ],
    sourceLabel: "UNMAS Somalia",
    sourceUrl: "https://unmas.org/en/where-we-work/somalia",
  },
  {
    slug: "data-request-process-launched",
    title: "Public data request process designed for the official SEMA website",
    date: "2026-06-21",
    category: "Public service",
    summary: "The rebuilt website includes a structured process for requesting public, operational, and partner-facing mine action data.",
    image: "/images/somalia-map.jpg",
    body: [
      "The data request service is intended to help government institutions, operators, researchers, donors, media, and humanitarian partners request SEMA-held information through a transparent process.",
      "Sensitive information, exact hazard coordinates, personal data, and restricted operational records should be reviewed before release.",
      "Approved requests may be fulfilled through email, a secure download link, a dashboard, or a formal data-sharing agreement.",
    ],
  },
];

export const partners: Partner[] = [
  {
    name: "Federal Government of Somalia",
    type: "Government",
    description: "National institutions supporting policy alignment, public safety, and coordination.",
  },
  {
    name: "Federal Member States",
    type: "Government",
    description: "State-level coordination partners for prioritization, public communication, and field planning.",
  },
  {
    name: "UNMAS Somalia",
    type: "Technical partner",
    description: "United Nations Mine Action Service support for explosive hazard mitigation and national capacity.",
    href: "https://unmas.org/en/where-we-work/somalia",
  },
  {
    name: "The HALO Trust",
    type: "Operator",
    description: "Humanitarian mine action operator supporting clearance, survey, and risk reduction work.",
    href: "https://www.halotrust.org/",
  },
  {
    name: "iMMAP Inc.",
    type: "Information management partner",
    description: "Technical partner for data, information management, and mine action evidence systems.",
    href: "https://immap.org/",
  },
  {
    name: "GICHD",
    type: "Technical partner",
    description: "Geneva International Centre for Humanitarian Demining technical guidance and sector support.",
    href: "https://www.gichd.org/",
  },
];

export const dashboardEmbeds = [
  {
    title: "ArcGIS Mine Action Dashboard",
    description: "Embed a public-safe ArcGIS dashboard for contamination overview, activity summaries, or operational progress.",
    envKey: "NEXT_PUBLIC_ARCGIS_DASHBOARD_URL",
    url: process.env.NEXT_PUBLIC_ARCGIS_DASHBOARD_URL || "",
    notes: "Use only public-safe layers or dashboards with the correct ArcGIS sharing permissions.",
  },
  {
    title: "Power BI Public Reporting Dashboard",
    description: "Embed a public-safe Power BI report for SEMA performance indicators, publications, or annual progress reporting.",
    envKey: "NEXT_PUBLIC_POWERBI_REPORT_URL",
    url: process.env.NEXT_PUBLIC_POWERBI_REPORT_URL || "",
    notes: "Avoid Publish to web for sensitive data. Use secure embed options for restricted reports.",
  },
];
