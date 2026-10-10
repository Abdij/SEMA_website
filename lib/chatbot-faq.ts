/**
 * Rule-based FAQ matching for the site chatbot widget. No external AI/LLM
 * call: a visitor's message is scored against each entry's keyword list and
 * the best match's canned answer is returned. Keeps the bot's answers
 * entirely within SEMA's own published content.
 */

type FaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
};

const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "greeting",
    keywords: ["hello", "hi", "hey", "help", "what can you do", "who are you"],
    answer:
      "Hello! I can answer questions about SEMA's mandate, operations, public dashboards, how to request data, and how to contact us. Try asking \"What does SEMA do?\", \"What dashboards are available?\", or \"How do I request data?\"",
  },
  {
    id: "about",
    keywords: ["about sema", "what is sema", "what does sema do", "who is sema"],
    answer:
      "SEMA (the Somalia Explosive Management Authority) is the national institution responsible for leading and coordinating mine action and explosive hazard management across Somalia. It works with government institutions, Federal Member States, operators, communities, and international partners to strengthen public safety and reduce the impact of explosive hazards.",
  },
  {
    id: "mandate",
    keywords: ["mandate", "responsibilities", "what does sema cover", "role of sema"],
    answer:
      "SEMA's mandate covers national mine action coordination, explosive hazard management (survey, marking, and clearance), information management, quality assurance for operators, risk education, victim assistance, national treaty reporting, and strategic planning. See /mandate for full details.",
  },
  {
    id: "hazard-management",
    keywords: ["clearance", "demining", "mines", "explosive hazard", "erw", "survey"],
    answer:
      "SEMA oversees the systematic identification, marking, and clearance of explosive hazards, including anti-personnel mines, cluster munitions, and explosive remnants of war (ERW), across Somalia.",
  },
  {
    id: "eore",
    keywords: ["eore", "risk education", "awareness", "safety education"],
    answer:
      "SEMA coordinates explosive ordnance risk education (EORE) programmes that reduce casualties by teaching communities about the dangers of explosive hazards and safe behaviours. See the EORE Overview Dashboard at /dashboards/eore-overview.html.",
  },
  {
    id: "victim-assistance",
    keywords: ["victim", "survivor", "casualty", "accident"],
    answer:
      "SEMA supports victim assistance by coordinating services and strengthening reporting for landmine and explosive ordnance (EO) survivors. Aggregate EO accident trends (not individual case or victim records) are published on the Explosive Ordnance (EO) Accident Overview Dashboard at /dashboards/accident-overview.html. For case-level questions, please use /contact.",
  },
  {
    id: "qa",
    keywords: ["quality assurance", "qa/qc", "qaqc", "standards", "accreditation"],
    answer:
      "SEMA sets and monitors national standards, accreditation, and quality management for all mine action operators in Somalia. See the QA/QC Monitoring Dashboard at /dashboards/qaqc-monitoring.html.",
  },
  {
    id: "dashboards",
    keywords: ["dashboard", "dashboards", "data visualization", "statistics", "charts"],
    answer:
      "SEMA publishes five public dashboards at /dashboards: the Explosive Ordnance (EO) Accident Overview Dashboard, the EORE Overview Dashboard, the Land Release Status Dashboard, the Survey Coverage Dashboard, and the QA/QC Monitoring Dashboard.",
  },
  {
    id: "land-release",
    keywords: ["land release", "released land", "clearance progress"],
    answer: "Land release and clearance progress is published on the Land Release Status Dashboard at /dashboards/land-release-status.html.",
  },
  {
    id: "survey-coverage",
    keywords: ["survey coverage", "nts", "non-technical survey"],
    answer: "Non-technical survey coverage is published on the Survey Coverage Dashboard at /dashboards/nts-coverage.html.",
  },
  {
    id: "data-request",
    keywords: ["request data", "data request", "access data", "get data", "dataset"],
    answer:
      "Government institutions, operators, researchers, donors, media, humanitarian partners, and the public can request mine action data through the official form at /data-request. SEMA reviews each request for sensitivity, availability, and intended use before approving delivery. Some information - exact hazard coordinates, personal/victim records, or unpublished operational data - may be restricted.",
  },
  {
    id: "contact",
    keywords: ["contact", "reach sema", "email", "phone", "location", "office"],
    answer:
      "You can reach SEMA through the official contact form at /contact for general enquiries, media questions, or feedback. SEMA is based in Mogadishu, Somalia. For data access specifically, please use /data-request instead so your request can be tracked.",
  },
];

const FALLBACK_ANSWER =
  "I don't have an answer for that in what I can look up right now. For general questions, please use /contact, or for data access, use /data-request.";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s/]/gu, " ");
}

export function matchFaqAnswer(message: string): string {
  const normalized = normalize(message);
  let best: { entry: FaqEntry; score: number } | null = null;

  for (const entry of FAQ_ENTRIES) {
    const score = entry.keywords.reduce((count, keyword) => (normalized.includes(keyword) ? count + 1 : count), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best?.entry.answer || FALLBACK_ANSWER;
}

export const SUGGESTED_QUESTIONS = [
  "What does SEMA do?",
  "What dashboards are available?",
  "How do I request data?",
];
