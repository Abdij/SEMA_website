/**
 * Rule-based FAQ matching for the site chatbot widget. No external AI/LLM
 * call: a visitor's message is scored against each entry's keyword list and
 * the best match's canned answer is returned. Keeps the bot's answers
 * entirely within SEMA's own published content.
 */

export type ChatAction = { label: string; href: string };
export type FaqReply = { id: string; reply: string; actions: ChatAction[] };

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
    keywords: ["about sema", "what is sema", "what does sema do", "who is sema", "what is this website"],
    answer:
      "SEMA (the Somalia Explosive Management Authority) is the national institution responsible for leading and coordinating mine action and explosive hazard management across Somalia. It works with government institutions, Federal Member States, operators, communities, and international partners to strengthen public safety and reduce the impact of explosive hazards.",
  },
  {
    id: "mandate",
    keywords: ["mandate", "responsibilities", "what does sema cover", "role of sema"],
    answer:
      "SEMA's mandate covers national mine action coordination, explosive hazard management (survey, marking, and clearance), information management, quality assurance for operators, risk education, victim assistance, national treaty reporting, and strategic planning.",
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
      "SEMA coordinates explosive ordnance risk education (EORE) programmes that reduce casualties by teaching communities about the dangers of explosive hazards and safe behaviours. See the EORE Overview Dashboard.",
  },
  {
    id: "victim-assistance",
    keywords: ["victim", "survivor", "casualty", "accident"],
    answer:
      "SEMA supports victim assistance by coordinating services and strengthening reporting for landmine and explosive ordnance (EO) survivors. Aggregate EO accident trends (not individual case or victim records) are published on the Explosive Ordnance (EO) Accident Overview Dashboard. For case-level questions, please use the contact form.",
  },
  {
    id: "qa",
    keywords: ["quality assurance", "qa/qc", "qaqc", "standards", "accreditation"],
    answer:
      "SEMA sets and monitors national standards, accreditation, and quality management for all mine action operators in Somalia. See the QA/QC Monitoring Dashboard.",
  },
  {
    id: "dashboards",
    keywords: ["dashboard", "dashboards", "data visualization", "statistics", "charts"],
    answer:
      "SEMA publishes five public dashboards: the Explosive Ordnance (EO) Accident Overview Dashboard, the EORE Overview Dashboard, the Land Release Status Dashboard, the Survey Coverage Dashboard, and the QA/QC Monitoring Dashboard.",
  },
  {
    id: "land-release",
    keywords: ["land release", "released land", "clearance progress"],
    answer: "Land release and clearance progress is published on the Land Release Status Dashboard.",
  },
  {
    id: "survey-coverage",
    keywords: ["survey coverage", "nts", "non-technical survey", "nontechnical survey"],
    answer: "Non-technical survey coverage is published on the Survey Coverage Dashboard.",
  },
  {
    id: "data-request",
    keywords: ["request data", "data request", "access data", "get data", "dataset", "datasets"],
    answer:
      "Government institutions, operators, researchers, donors, media, humanitarian partners, and the public can request mine action data through the official data request form. SEMA reviews each request for sensitivity, availability, and intended use before approving delivery. Some information - exact hazard coordinates, personal/victim records, or unpublished operational data - may be restricted.",
  },
  {
    id: "contact",
    keywords: ["contact", "reach sema", "email", "phone", "location", "office"],
    answer:
      "You can reach SEMA through the official contact form for general enquiries, media questions, or feedback. SEMA is based in Mogadishu, Somalia. For data access specifically, please use the data request form instead so your request can be tracked.",
  },
];

const ACTIONS: Record<string, ChatAction[]> = {
  about: [{ label: "About SEMA", href: "/en/about" }],
  mandate: [{ label: "SEMA mandate", href: "/en/mandate" }],
  "hazard-management": [{ label: "SEMA operations", href: "/en/operations" }],
  eore: [{ label: "Risk education resources", href: "/en/eore-resources" }],
  "victim-assistance": [{ label: "Accident dashboard", href: "/dashboards/accident-overview.html" }, { label: "General enquiries", href: "/en/contact" }],
  qa: [{ label: "QA/QC dashboard", href: "/dashboards/qaqc-monitoring.html" }],
  dashboards: [{ label: "View dashboards", href: "/en/dashboards" }],
  "land-release": [{ label: "Land release dashboard", href: "/dashboards/land-release-status.html" }],
  "survey-coverage": [{ label: "Survey coverage dashboard", href: "/dashboards/nts-coverage.html" }],
  "data-request": [{ label: "Request data", href: "/en/data-request" }],
  contact: [{ label: "Contact SEMA", href: "/en/contact" }],
  catalogue: [{ label: "Open catalogue (PDF)", href: "/documents/SEMA_Mine_Action_Data_Catalogue.pdf" }, { label: "Request data", href: "/en/data-request" }],
};
FAQ_ENTRIES.push({ id: "catalogue", keywords: ["catalogue", "catalog", "data guide"], answer: "The SEMA Mine Action Data Catalogue describes available datasets, coverage and limitations. It is a dated reference, not a live feed. Underlying records remain subject to SEMA review." });
FAQ_ENTRIES.push({ id: "deadline", keywords: ["deadline", "response time", "how long", "when will"], answer: "SEMA reviews requests for availability, sensitivity and intended use. No fixed response deadline is promised. Include any deadline in your request and keep your reference for follow-up." });
ACTIONS.deadline = ACTIONS["data-request"];

export const SAFETY_REPLY: FaqReply = {
  id: "safety",
  reply: "If you suspect an explosive item, do not approach, touch or disturb it. Contact local authorities or trained mine-action personnel from a safe location. This FAQ cannot assess an object or confirm that land is safe to enter. This chat and the website contact form are not monitored for emergencies; do not wait for a reply here.",
  actions: [{ label: "UNMAS safety guidance", href: "https://www.unmas.org/sites/default/files/handbook_english.pdf" }, { label: "Risk education resources", href: "/en/eore-resources" }],
};


function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
function contains(text: string, phrase: string) { return (` ${text} `).includes(` ${normalize(phrase)} `); }

export function matchFaq(message: string): FaqReply {
  const text = normalize(message);
  const hazard = /\b(mines?|landmines?|bombs?|grenades?|shells?|munitions?|ammunition|mortars?|ieds?|ordnance|explosives?|uxo|suspicious|hazards?)\b/.test(text);
  if ((hazard && /\b(found|find|saw|see|near|touch|move|handle|report|safe|danger|dispose|remove|picked|disarm)\b/.test(text)) ||
      /\b(safe to enter|safe to walk|safe to travel|released area|unexploded|emergency)\b/.test(text)) return SAFETY_REPLY;
  let ranked = FAQ_ENTRIES.map(entry => ({ entry, score: Math.max(0, ...entry.keywords.filter(k => contains(text,k)).map(k => normalize(k).split(" ").length)) })).filter(x => x.score > 0);
  if (ranked.some(x => x.entry.id !== "greeting")) ranked = ranked.filter(x => x.entry.id !== "greeting");
  ranked.sort((a,b) => b.score - a.score);
  if (!ranked.length) return { id: "fallback", reply: "I could not match that to a published FAQ. Please try a specific topic or use the links below. Each question is answered independently.", actions: [...ACTIONS.contact, ...ACTIONS["data-request"], ACTIONS.catalogue[0]] };
  const tied = ranked.filter(x => x.score === ranked[0].score);
  if (tied.length > 1) return { id: "clarify", reply: "Your question could refer to several topics. Please choose a relevant page below or ask about one topic at a time.", actions: Array.from(new Map(tied.flatMap(x => ACTIONS[x.entry.id] || []).map(a => [a.href,a])).values()).slice(0,4) };
  const entry = ranked[0].entry;
  return { id: entry.id, reply: entry.answer, actions: ACTIONS[entry.id] || [ACTIONS.catalogue[0], ...ACTIONS["data-request"]] };
}
export function matchFaqAnswer(message: string) { return matchFaq(message).reply; }
export const SUGGESTED_QUESTIONS = ["What does SEMA do?", "What dashboards are available?", "How do I request data?", "Open the catalogue"];
