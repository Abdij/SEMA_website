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
  id?: string;
  title: string;
  type: string;
  description: string;
  href: string;
  source: string;
  publication_date?: string;
  status?: string;
  fileName?: string;
  fileMime?: string;
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
  { href: "/leadership", label: "Leadership" },
  { href: "/operations", label: "Operations" },
  { href: "/conventions", label: "Convention Progress" },
  { href: "/partners", label: "Partners" },
  { href: "/dashboards", label: "Dashboards" },
  { href: "/eore-resources", label: "EORE Resources" },
  { href: "/news", label: "News" },
  { href: "/data-request", label: "Information Request" },
  { href: "/contact", label: "Contact" },
];

export const govLinks = [
  {
    name: "Ministry of Internal Security (MoIS)",
    description: "Federal Government ministry responsible for internal security coordination and public safety across Somalia.",
    href: "https://mois.gov.so",
  },
  {
    name: "Ministry of Interior, Federal Affairs and Reconciliation (MoIFAR)",
    description: "Federal Government ministry overseeing interior affairs, federal-state relations, and national reconciliation.",
    href: "https://moifar.gov.so",
  },
  {
    name: "Somalia Disaster Management Agency (SoDMA)",
    description: "National agency coordinating disaster preparedness, response, and risk reduction across Somalia.",
    href: "https://sodma.gov.so",
  },
  {
    name: "Federal Government of Somalia Portal",
    description: "Official portal of the Federal Government of Somalia — news, departments, and public services.",
    href: "https://www.somalia.gov.so",
  },
];

export const mandateAreas = [
  {
    title: "National Mine Action Coordination",
    text: "SEMA leads and coordinates all national mine action activities, aligning government institutions, Federal Member States, operators, donors, and technical partners around shared priorities.",
  },
  {
    title: "Explosive Hazard Management",
    text: "SEMA oversees the systematic identification, marking, and clearance of explosive hazards including anti-personnel mines, cluster munitions, and explosive remnants of war.",
  },
  {
    title: "Information Management",
    text: "SEMA develops and maintains national information management systems to collect, validate, analyse, and share mine action data for planning, operations, and public reporting.",
  },
  {
    title: "Quality Assurance",
    text: "SEMA establishes and monitors national standards, accreditation requirements, and quality management processes for all operators conducting mine action activities in Somalia.",
  },
  {
    title: "Risk Education (EORE)",
    text: "SEMA coordinates explosive ordnance risk education programmes that reduce casualties by informing communities about the dangers of explosive hazards and safe behaviours.",
  },
  {
    title: "Victim Assistance",
    text: "SEMA supports victim assistance efforts by coordinating services, strengthening national reporting, and advocating for the rights and needs of landmine and EO survivors.",
  },
  {
    title: "National Reporting",
    text: "SEMA fulfils Somalia's international treaty reporting obligations, including annual Article 7 reports under the Anti-Personnel Mine Ban Convention and related instruments.",
  },
  {
    title: "Strategic Planning",
    text: "SEMA leads the development and implementation of national mine action strategies, work plans, and sectoral priorities aligned with Somalia's development and security agenda.",
  },
  {
    title: "Government and Partner Coordination",
    text: "SEMA facilitates coordination with Federal Member States, UN agencies, international NGOs, and bilateral donors supporting mine action and explosive hazard management in Somalia.",
  },
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
    icon: "signature",
    status: "complete",
  },
  {
    date: "1 October 2012",
    title: "Convention entered into force for Somalia",
    text: "The Anti-Personnel Mine Ban Convention entered into force for Somalia on this date.",
    icon: "shield",
    status: "complete",
  },
  {
    date: "2022",
    title: "Article 5 extension granted",
    text: "Somalia's first Article 5 deadline extension was granted, setting the current deadline for completion of clearance obligations.",
    icon: "extension",
    status: "complete",
  },
  {
    date: "1 October 2027",
    title: "Current Article 5 clearance deadline",
    text: "Somalia must complete clearance of all anti-personnel mines in known and suspected mined areas by this deadline. SEMA coordinates national progress towards meeting this obligation.",
    icon: "target",
    status: "upcoming",
  },
];

export const clusterConventionMilestones = [
  {
    date: "3 December 2008",
    title: "Somalia signed the Convention on Cluster Munitions",
    text: "Somalia signed the convention when it opened for signature in Oslo.",
    icon: "signature",
    status: "complete",
  },
  {
    date: "30 September 2015",
    title: "Somalia ratified the Convention on Cluster Munitions",
    text: "Ratification made Somalia a State Party to the cluster munition ban framework.",
    icon: "check",
    status: "complete",
  },
  {
    date: "1 March 2016",
    title: "Convention entered into force for Somalia",
    text: "The convention became binding for Somalia, including reporting, clearance, and victim assistance obligations.",
    icon: "shield",
    status: "complete",
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
];

export const newsPosts: NewsPost[] = [
  {
    slug: "article-5-deadline-tracker",
    title: "Somalia on track with Article 5 convention progress reporting",
    date: "2026-06-21",
    category: "Convention progress",
    summary: "SEMA continues to coordinate national progress against Somalia's Article 5 obligations under the Anti-Personnel Mine Ban Convention, with the current deadline of 1 October 2027.",
    image: "/images/mine-survey.jpg",
    body: [
      "Somalia is a State Party to the Anti-Personnel Mine Ban Convention, with an Article 5 clearance deadline of 1 October 2027. SEMA leads national coordination to meet this obligation.",
      "The SEMA website includes a dedicated convention-progress section covering verified national milestones, annual Article 7 reports, and official treaty references.",
      "SEMA publishes progress information in accordance with treaty reporting requirements and in coordination with national mine action partners.",
    ],
    sourceLabel: "AP Mine Ban Convention — Somalia",
    sourceUrl: "https://www.apminebanconvention.org/en/membership/somalia",
  },
  {
    slug: "unmas-supports-somalia-mine-action",
    title: "UNMAS continues support to Somalia mine action coordination",
    date: "2026-06-01",
    category: "Partner update",
    summary: "UNMAS Somalia continues to provide technical support to national mine action coordination, explosive hazard risk reduction, and capacity development.",
    image: "/images/coordination-meeting.jpg",
    body: [
      "UNMAS remains a key technical partner for Somalia's mine action sector, providing support to national coordination, explosive hazard risk reduction, and capacity development.",
      "SEMA works alongside UNMAS and other international partners to strengthen national systems for information management, operator oversight, and community safety communication.",
    ],
    sourceLabel: "UNMAS Somalia",
    sourceUrl: "https://unmas.org/en/where-we-work/somalia",
  },
  {
    slug: "data-request-process-launched",
    title: "SEMA launches public mine action data request service",
    date: "2026-06-21",
    category: "Public service",
    summary: "SEMA's official website provides a structured process for requesting public, operational, and partner-facing mine action data from the national authority.",
    image: "/images/somalia-map.jpg",
    body: [
      "The data request service allows government institutions, operators, researchers, donors, media, and humanitarian partners to submit formal requests for SEMA-held mine action information.",
      "Each request is reviewed by SEMA staff for relevance, sensitivity, and applicable data-sharing conditions before a response is issued.",
      "Approved requests may be fulfilled through email, secure download, dashboard access, or a formal data-sharing agreement.",
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
    title: "Mine Action Operations Dashboard",
    description: "Overview of explosive hazard survey, clearance, risk education, and response activities across Somalia.",
    envKey: "NEXT_PUBLIC_ARCGIS_DASHBOARD_URL",
    url: process.env.NEXT_PUBLIC_ARCGIS_DASHBOARD_URL || "",
    notes: "",
  },
  {
    title: "SEMA Performance Indicators",
    description: "National mine action progress indicators and key performance data for public reporting.",
    envKey: "NEXT_PUBLIC_POWERBI_REPORT_URL",
    url: process.env.NEXT_PUBLIC_POWERBI_REPORT_URL || "",
    notes: "",
  },
];
