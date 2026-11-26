import type {
  GovernanceStatus,
  UpdateEntry,
  VendorEntry,
  VendorEntryKind,
  VendorEntryStatus,
  VendorModel,
  VendorOverview,
  VendorTimelineEvent,
  VendorTimelineType,
} from "./types.ts";

// ── Enumerations (mirrored in data/SCHEMA.md) ───────────────────────────────

export const ENTRY_KINDS: readonly VendorEntryKind[] = [
  "model-family",
  "product",
  "feature",
  "solution",
  "standard",
  "open-source",
  "resource",
  "research",
  "framework",
  "program",
  "partnership",
];

export const ENTRY_STATUSES: readonly VendorEntryStatus[] = ["ga", "beta", "preview", "research-preview", "active", "deprecated", "retired"];

export const AUDIENCES = ["everyone", "developers", "enterprise", "admins", "researchers", "public-sector", "education"] as const;

export const TIMELINE_TYPES: readonly VendorTimelineType[] = [
  "model",
  "product",
  "platform",
  "enterprise",
  "safety-policy",
  "research",
  "open-source",
  "program",
  "partnership",
  "company",
  "deprecation",
];

const CLUSTERS = ["products", "ecosystem", "company"];
const PROMINENCE = ["headline", "standard", "detail"];
const MODEL_STATUSES = ["current", "legacy", "deprecated", "retired"];
const PLAN_SEGMENTS = ["individual", "team", "enterprise", "developer", "public-sector", "education"];
const CHANNELS = ["direct", "cloud", "partner"];
const SAFETY_STATES = ["in-force", "defined", "not-yet-defined"];
const ROADMAP_STAGES = ["announced", "preview", "rolling-out"];
const PARTNERSHIP_TYPES = ["cloud", "investment", "distribution", "government", "research", "consulting", "technology"];
const GOVERNANCE_STATUSES: readonly GovernanceStatus[] = ["yes", "partial", "no", "not-applicable", "unknown"];
const IMPACTS = ["high", "medium", "low"];

export const ENTRY_KIND_LABELS: Record<VendorEntryKind, string> = {
  "model-family": "Model family",
  product: "Product",
  feature: "Feature",
  solution: "Solution",
  standard: "Open standard",
  "open-source": "Open source",
  resource: "Resource",
  research: "Research",
  framework: "Framework",
  program: "Program",
  partnership: "Partnership",
};

export const ENTRY_STATUS_LABELS: Record<VendorEntryStatus, string> = {
  ga: "Generally available",
  beta: "Beta",
  preview: "Preview",
  "research-preview": "Research preview",
  active: "Active",
  deprecated: "Deprecated",
  retired: "Retired",
};

// Dot tone for `.badge-dot-*`; status is always shown as text too.
export const ENTRY_STATUS_TONE: Record<VendorEntryStatus, "success" | "info" | "warning" | "muted"> = {
  ga: "success",
  active: "success",
  beta: "info",
  preview: "info",
  "research-preview": "info",
  deprecated: "warning",
  retired: "muted",
};

export const AUDIENCE_LABELS: Record<(typeof AUDIENCES)[number], string> = {
  everyone: "Everyone",
  developers: "Developers",
  enterprise: "Enterprise",
  admins: "Admins",
  researchers: "Researchers",
  "public-sector": "Public sector",
  education: "Education",
};

export const TIMELINE_TYPE_LABELS: Record<VendorTimelineType, string> = {
  model: "Model",
  product: "Product",
  platform: "Platform",
  enterprise: "Enterprise",
  "safety-policy": "Safety & policy",
  research: "Research",
  "open-source": "Open source",
  program: "Program",
  partnership: "Partnership",
  company: "Company",
  deprecation: "Deprecation",
};

// ── Validation ──────────────────────────────────────────────────────────────

export const DESCRIPTION_MAX = 180;
export const SUMMARY_MAX = 320;
export const FAQ_ANSWER_MAX = 700;
export const HEADLINES_PER_DOMAIN_MAX = 6;

const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const partialDatePattern = /^\d{4}-\d{2}(-\d{2})?$/;
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ValidationContext = {
  toolIds: ReadonlySet<string>;
  platformIds: ReadonlySet<string>;
  updateIds: ReadonlySet<string>;
  // Current tools.json records owned by this vendor: each must be referenced
  // by an entry so the overview cannot silently drift from the tool pages.
  vendorToolIds: readonly string[];
  today: string;
};

type Rec = Record<string, unknown>;

function isRecord(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDay(value: string): boolean {
  if (!dayPattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidPartialDate(value: string): boolean {
  if (!partialDatePattern.test(value)) return false;
  return value.length === 7 ? isValidDay(`${value}-01`) : isValidDay(value);
}

export function hostMatches(url: string, hosts: readonly string[]): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

// Comparable key for a YYYY-MM or YYYY-MM-DD date: month-only dates sort as the
// first of the month.
export function dateKey(date: string): string {
  return date.length === 7 ? `${date}-01` : date;
}

export function validateVendorOverview(raw: unknown, ctx: ValidationContext): string[] {
  const errors: string[] = [];
  const fail = (path: string, message: string) => errors.push(`${path}: ${message}`);

  if (!isRecord(raw)) return ["root: must be an object"];

  const str = (obj: Rec, key: string, path: string, { required = true, max }: { required?: boolean; max?: number } = {}) => {
    const value = obj[key];
    if (value === undefined) {
      if (required) fail(`${path}.${key}`, "is required");
      return undefined;
    }
    if (typeof value !== "string" || value.trim() === "") {
      fail(`${path}.${key}`, "must be a non-empty string");
      return undefined;
    }
    if (max !== undefined && value.length > max) fail(`${path}.${key}`, `is ${value.length} chars (max ${max})`);
    return value;
  };
  const oneOf = (obj: Rec, key: string, allowed: readonly string[], path: string, required = true) => {
    const value = str(obj, key, path, { required });
    if (value !== undefined && !allowed.includes(value)) fail(`${path}.${key}`, `"${value}" is not one of ${allowed.join(", ")}`);
    return value;
  };
  const strArray = (obj: Rec, key: string, path: string, { required = true, min = 0 }: { required?: boolean; min?: number } = {}) => {
    const value = obj[key];
    if (value === undefined) {
      if (required) fail(`${path}.${key}`, "is required");
      return [];
    }
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
      fail(`${path}.${key}`, "must be an array of non-empty strings");
      return [];
    }
    if (value.length < min) fail(`${path}.${key}`, `needs at least ${min} item(s)`);
    return value as string[];
  };
  const day = (obj: Rec, key: string, path: string, required = true) => {
    const value = str(obj, key, path, { required });
    if (value !== undefined && !isValidDay(value)) fail(`${path}.${key}`, `"${value}" is not a YYYY-MM-DD date`);
    return value;
  };
  const partialDate = (obj: Rec, key: string, path: string, required = true) => {
    const value = str(obj, key, path, { required });
    if (value !== undefined && !isValidPartialDate(value)) fail(`${path}.${key}`, `"${value}" is not YYYY-MM or YYYY-MM-DD`);
    return value;
  };

  const vendor = str(raw, "vendor", "root");
  str(raw, "name", "root");
  str(raw, "title", "root", { max: 60 });
  str(raw, "description", "root", { max: 170 });
  const reviewedAt = day(raw, "reviewedAt", "root");
  str(raw, "answer", "root", { max: 900 });
  const hosts = strArray(raw, "primarySourceHosts", "root", { min: 1 }).map((host) => host.toLowerCase());

  if (vendor !== undefined && !idPattern.test(vendor)) fail("root.vendor", "must be a lowercase-kebab slug");
  if (reviewedAt !== undefined && reviewedAt > ctx.today) fail("root.reviewedAt", `${reviewedAt} is in the future`);

  const url = (value: string | undefined, path: string, { primary = true }: { primary?: boolean } = {}) => {
    if (value === undefined) return;
    if (!/^https:\/\//.test(value)) {
      fail(path, `"${value}" must be an absolute https URL`);
      return;
    }
    if (primary && !hostMatches(value, hosts)) fail(path, `"${value}" is not on a primary source host (${hosts.join(", ")})`);
  };
  const sourceRef = (obj: Rec, path: string) => {
    url(str(obj, "sourceUrl", path), `${path}.sourceUrl`);
    str(obj, "sourceTitle", path, { required: false });
    const verifiedAt = day(obj, "verifiedAt", path);
    if (verifiedAt !== undefined && reviewedAt !== undefined && verifiedAt > reviewedAt) {
      fail(`${path}.verifiedAt`, `${verifiedAt} is after root.reviewedAt ${reviewedAt}`);
    }
  };
  const list = (key: string): Rec[] => {
    const value = raw[key];
    if (!Array.isArray(value)) {
      fail(`root.${key}`, "must be an array");
      return [];
    }
    return value.map((item, index) => {
      if (!isRecord(item)) {
        fail(`${key}[${index}]`, "must be an object");
        return {};
      }
      return item;
    });
  };
  const uniqueIds = (items: Rec[], key: string): Set<string> => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      const id = str(item, "id", `${key}[${index}]`);
      if (id === undefined) return;
      if (!idPattern.test(id)) fail(`${key}[${index}].id`, `"${id}" must be a lowercase-kebab slug`);
      if (seen.has(id)) fail(`${key}[${index}].id`, `duplicate id "${id}"`);
      seen.add(id);
    });
    return seen;
  };

  if (raw.modelStatusSource !== undefined) {
    if (isRecord(raw.modelStatusSource)) sourceRef(raw.modelStatusSource, "root.modelStatusSource");
    else fail("root.modelStatusSource", "must be an object");
  }
  strArray(raw, "answerSources", "root", { min: 1 }).forEach((source, index) => url(source, `root.answerSources[${index}]`));

  // Domains
  const domains = list("domains");
  const domainIds = uniqueIds(domains, "domains");
  const groupsByDomain = new Map<string, Set<string>>();
  domains.forEach((domain, index) => {
    const path = `domains[${index}]`;
    str(domain, "label", path);
    str(domain, "tagline", path, { max: DESCRIPTION_MAX });
    str(domain, "intro", path, { max: SUMMARY_MAX });
    oneOf(domain, "cluster", CLUSTERS, path);
    const groups = Array.isArray(domain.groups) ? domain.groups : [];
    if (!Array.isArray(domain.groups)) fail(`${path}.groups`, "must be an array");
    const groupIds = new Set<string>();
    groups.forEach((group, groupIndex) => {
      if (!isRecord(group)) {
        fail(`${path}.groups[${groupIndex}]`, "must be an object");
        return;
      }
      const id = str(group, "id", `${path}.groups[${groupIndex}]`);
      str(group, "label", `${path}.groups[${groupIndex}]`);
      if (id !== undefined) {
        if (groupIds.has(id)) fail(`${path}.groups[${groupIndex}].id`, `duplicate group "${id}"`);
        groupIds.add(id);
      }
    });
    if (typeof domain.id === "string") groupsByDomain.set(domain.id, groupIds);
  });

  // Availability (needed by entries)
  const availability = list("availability");
  const availabilityIds = uniqueIds(availability, "availability");
  availability.forEach((item, index) => {
    const path = `availability[${index}]`;
    sourceRef(item, path);
    str(item, "name", path);
    oneOf(item, "channel", CHANNELS, path);
    const platformId = str(item, "platformId", path, { required: false });
    if (platformId !== undefined && !ctx.platformIds.has(platformId)) fail(`${path}.platformId`, `"${platformId}" is not in data/platforms.json`);
    partialDate(item, "since", path, false);
    strArray(item, "offers", path, { min: 1 });
    str(item, "note", path, { max: SUMMARY_MAX });
  });

  // Entries
  const entries = list("entries");
  const entryIds = uniqueIds(entries, "entries");
  const entryById = new Map<string, Rec>();
  entries.forEach((entry) => {
    if (typeof entry.id === "string") entryById.set(entry.id, entry);
  });
  const referencedToolIds = new Set<string>();
  const headlineCount = new Map<string, number>();
  const domainEntryCount = new Map<string, number>();
  entries.forEach((entry, index) => {
    const path = `entries[${index}]`;
    sourceRef(entry, path);
    str(entry, "name", path);
    const kind = oneOf(entry, "kind", ENTRY_KINDS, path);
    const domainId = str(entry, "domainId", path);
    oneOf(entry, "status", ENTRY_STATUSES, path);
    const prominence = oneOf(entry, "prominence", PROMINENCE, path);
    str(entry, "description", path, { max: DESCRIPTION_MAX });
    partialDate(entry, "launchedAt", path, false);
    strArray(entry, "formerNames", path, { required: false });
    url(str(entry, "docsUrl", path, { required: false }), `${path}.docsUrl`);
    const audience = strArray(entry, "audience", path, { min: 1 });
    audience.forEach((value) => {
      if (!(AUDIENCES as readonly string[]).includes(value)) fail(`${path}.audience`, `"${value}" is not a known audience`);
    });

    if (domainId !== undefined) {
      if (!domainIds.has(domainId)) fail(`${path}.domainId`, `"${domainId}" is not a declared domain`);
      domainEntryCount.set(domainId, (domainEntryCount.get(domainId) ?? 0) + 1);
      if (prominence === "headline") headlineCount.set(domainId, (headlineCount.get(domainId) ?? 0) + 1);
      const groupId = str(entry, "groupId", path, { required: false });
      if (groupId !== undefined && !groupsByDomain.get(domainId)?.has(groupId)) fail(`${path}.groupId`, `"${groupId}" is not a group of domain "${domainId}"`);
    }

    const parentId = str(entry, "parentId", path, { required: false });
    if (parentId !== undefined) {
      const parent = entryById.get(parentId);
      if (!parent) fail(`${path}.parentId`, `"${parentId}" is not an entry id`);
      else {
        if (parent.parentId !== undefined) fail(`${path}.parentId`, `"${parentId}" is itself a child (max depth 2)`);
        if (parent.domainId !== domainId) fail(`${path}.parentId`, `parent "${parentId}" is in another domain`);
        if (parentId === entry.id) fail(`${path}.parentId`, "an entry cannot be its own parent");
      }
      if (prominence === "headline") fail(`${path}.prominence`, "a child entry cannot be a headline");
    }

    const toolId = str(entry, "toolId", path, { required: false });
    if (toolId !== undefined) {
      if (!ctx.toolIds.has(toolId)) fail(`${path}.toolId`, `"${toolId}" is not in data/tools.json`);
      referencedToolIds.add(toolId);
    }
    strArray(entry, "availableOn", path, { required: false }).forEach((id) => {
      if (!availabilityIds.has(id)) fail(`${path}.availableOn`, `"${id}" is not an availability id`);
    });

    // A license label is only as good as the LICENSE file it was read from, so
    // any entry that carries one must also point at that repository.
    const license = str(entry, "license", path, { required: kind === "open-source" });
    str(entry, "licenseWarning", path, { required: false });
    const githubUrl = str(entry, "githubUrl", path, { required: kind === "open-source" || license !== undefined });
    url(githubUrl, `${path}.githubUrl`);
    if (entry.licenseWarning !== undefined && license === undefined) fail(`${path}.licenseWarning`, "needs a license");
  });

  for (const id of domainIds) {
    if (!domainEntryCount.get(id)) fail(`domains.${id}`, "has no entries");
    const headlines = headlineCount.get(id) ?? 0;
    if (headlines > HEADLINES_PER_DOMAIN_MAX) fail(`domains.${id}`, `has ${headlines} headline entries (max ${HEADLINES_PER_DOMAIN_MAX})`);
  }
  for (const toolId of ctx.vendorToolIds) {
    if (!referencedToolIds.has(toolId)) fail("entries", `current tool "${toolId}" is not referenced by any entry toolId`);
  }

  // Models
  const models = list("models");
  const modelIds = uniqueIds(models, "models");
  models.forEach((model, index) => {
    const path = `models[${index}]`;
    sourceRef(model, path);
    str(model, "name", path);
    str(model, "apiId", path, { required: false });
    str(model, "tier", path);
    str(model, "generation", path);
    const releasedAt = day(model, "releasedAt", path);
    const status = oneOf(model, "status", MODEL_STATUSES, path);
    const retiresAt = day(model, "retiresAt", path, false);
    if (status === "retired" && retiresAt === undefined) fail(`${path}.retiresAt`, "is required when status is retired");
    if (releasedAt && retiresAt && retiresAt < releasedAt) fail(`${path}.retiresAt`, "is before releasedAt");
    if (releasedAt && releasedAt > ctx.today) fail(`${path}.releasedAt`, `${releasedAt} is in the future`);
    str(model, "contextWindow", path, { required: false });
    str(model, "maxOutput", path, { required: false });
    str(model, "highlight", path, { required: false, max: DESCRIPTION_MAX });
    if (model.pricing !== undefined) {
      if (!isRecord(model.pricing)) fail(`${path}.pricing`, "must be an object");
      else {
        for (const key of ["inputPerMTok", "outputPerMTok"]) {
          const value = model.pricing[key];
          if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(`${path}.pricing.${key}`, "must be a non-negative number");
        }
        if (model.pricing.currency !== "USD") fail(`${path}.pricing.currency`, 'must be "USD"');
        day(model.pricing, "asOf", `${path}.pricing`);
      }
    }
  });

  // Timeline
  const timeline = list("timeline");
  uniqueIds(timeline, "timeline");
  let previous: string | undefined;
  timeline.forEach((event, index) => {
    const path = `timeline[${index}]`;
    sourceRef(event, path);
    const date = partialDate(event, "date", path);
    oneOf(event, "type", TIMELINE_TYPES, path);
    str(event, "title", path, { max: 120 });
    str(event, "summary", path, { max: SUMMARY_MAX });
    oneOf(event, "impact", IMPACTS, path, false);
    strArray(event, "entryIds", path, { required: false }).forEach((id) => {
      if (!entryIds.has(id)) fail(`${path}.entryIds`, `"${id}" is not an entry id`);
    });
    strArray(event, "modelIds", path, { required: false }).forEach((id) => {
      if (!modelIds.has(id)) fail(`${path}.modelIds`, `"${id}" is not a model id`);
    });
    const updateId = str(event, "updateId", path, { required: false });
    if (updateId !== undefined && !ctx.updateIds.has(updateId)) fail(`${path}.updateId`, `"${updateId}" is not in data/updates.json`);
    if (date !== undefined) {
      if (dateKey(date) > ctx.today) fail(`${path}.date`, `${date} is in the future`);
      if (previous !== undefined && dateKey(date) > dateKey(previous)) fail(`${path}.date`, `timeline must be newest first (${date} after ${previous})`);
      previous = date;
    }
  });

  // Plans
  const plans = list("plans");
  uniqueIds(plans, "plans");
  plans.forEach((plan, index) => {
    const path = `plans[${index}]`;
    sourceRef(plan, path);
    str(plan, "name", path);
    oneOf(plan, "segment", PLAN_SEGMENTS, path);
    str(plan, "price", path, { max: 80 });
    str(plan, "priceNote", path, { required: false, max: DESCRIPTION_MAX });
    strArray(plan, "includes", path, { min: 1 });
  });

  // Governance
  const governance = list("governance");
  uniqueIds(governance, "governance");
  governance.forEach((row, index) => {
    const path = `governance[${index}]`;
    str(row, "label", path);
    if (!isRecord(row.claim)) {
      fail(`${path}.claim`, "must be an object");
      return;
    }
    const status = oneOf(row.claim, "status", GOVERNANCE_STATUSES, `${path}.claim`);
    str(row.claim, "detail", `${path}.claim`, { max: SUMMARY_MAX });
    str(row.claim, "sourceTitle", `${path}.claim`, { required: false });
    const sourceUrl = str(row.claim, "sourceUrl", `${path}.claim`, { required: status === "yes" || status === "partial" || status === "no" });
    url(sourceUrl, `${path}.claim.sourceUrl`);
  });

  // Safety levels
  const safetyLevels = list("safetyLevels");
  uniqueIds(safetyLevels, "safetyLevels");
  safetyLevels.forEach((level, index) => {
    const path = `safetyLevels[${index}]`;
    sourceRef(level, path);
    str(level, "label", path);
    str(level, "summary", path, { max: SUMMARY_MAX });
    oneOf(level, "state", SAFETY_STATES, path);
  });

  // Roadmap
  const roadmap = list("roadmap");
  uniqueIds(roadmap, "roadmap");
  roadmap.forEach((item, index) => {
    const path = `roadmap[${index}]`;
    sourceRef(item, path);
    str(item, "title", path, { max: 120 });
    str(item, "summary", path, { max: SUMMARY_MAX });
    const announcedAt = day(item, "announcedAt", path);
    if (announcedAt && announcedAt > ctx.today) fail(`${path}.announcedAt`, `${announcedAt} is in the future`);
    oneOf(item, "stage", ROADMAP_STAGES, path);
    str(item, "expected", path, { required: false, max: 80 });
  });

  // Company
  if (!isRecord(raw.company)) fail("root.company", "must be an object");
  else {
    const company = raw.company;
    const facts = Array.isArray(company.facts) ? company.facts.filter(isRecord) : [];
    if (!Array.isArray(company.facts)) fail("company.facts", "must be an array");
    uniqueIds(facts, "company.facts");
    facts.forEach((fact, index) => {
      sourceRef(fact, `company.facts[${index}]`);
      str(fact, "label", `company.facts[${index}]`);
      str(fact, "value", `company.facts[${index}]`, { max: SUMMARY_MAX });
    });
    const partnerships = Array.isArray(company.partnerships) ? company.partnerships.filter(isRecord) : [];
    if (!Array.isArray(company.partnerships)) fail("company.partnerships", "must be an array");
    uniqueIds(partnerships, "company.partnerships");
    partnerships.forEach((partnership, index) => {
      const path = `company.partnerships[${index}]`;
      sourceRef(partnership, path);
      str(partnership, "partner", path);
      oneOf(partnership, "type", PARTNERSHIP_TYPES, path);
      partialDate(partnership, "date", path, false);
      str(partnership, "summary", path, { max: SUMMARY_MAX });
    });
  }

  // FAQs
  const faqs = list("faqs");
  uniqueIds(faqs, "faqs");
  faqs.forEach((faq, index) => {
    const path = `faqs[${index}]`;
    str(faq, "question", path, { max: 160 });
    str(faq, "answer", path, { max: FAQ_ANSWER_MAX });
    strArray(faq, "sourceUrls", path, { min: 1 }).forEach((source, sourceIndex) => url(source, `${path}.sourceUrls[${sourceIndex}]`));
    str(faq, "sectionId", path, { required: false });
  });

  return errors;
}

// Throws with every finding so a bad data file fails the build loudly.
export function parseVendorOverview(raw: unknown, ctx: ValidationContext): VendorOverview {
  const errors = validateVendorOverview(raw, ctx);
  if (errors.length > 0) {
    throw new Error(`Invalid vendor overview data:\n  - ${errors.join("\n  - ")}`);
  }
  return raw as VendorOverview;
}

// ── View helpers ────────────────────────────────────────────────────────────

// Top-level entries per domain, in data order. Children render under their parent.
export function entriesByDomain(overview: Pick<VendorOverview, "domains" | "entries">): Map<string, VendorEntry[]> {
  const result = new Map<string, VendorEntry[]>(overview.domains.map((domain) => [domain.id, []]));
  for (const entry of overview.entries) {
    if (entry.parentId === undefined) result.get(entry.domainId)?.push(entry);
  }
  return result;
}

export function childrenOf(entries: readonly VendorEntry[], parentId: string): VendorEntry[] {
  return entries.filter((entry) => entry.parentId === parentId);
}

// Every entry in the domain, children included.
export function domainCounts(overview: Pick<VendorOverview, "domains" | "entries">): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(overview.domains.map((domain) => [domain.id, 0]));
  for (const entry of overview.entries) counts[entry.domainId] = (counts[entry.domainId] ?? 0) + 1;
  return counts;
}

export function headlineEntries(entries: readonly VendorEntry[], domainId: string, limit = 3): VendorEntry[] {
  return entries.filter((entry) => entry.domainId === domainId && entry.prominence === "headline").slice(0, limit);
}

// Lowercased haystack for the catalog search (name, former names, description, kind).
export function entrySearchText(entry: Pick<VendorEntry, "name" | "formerNames" | "description" | "kind">): string {
  return [entry.name, ...(entry.formerNames ?? []), entry.description, ENTRY_KIND_LABELS[entry.kind]].join(" ").toLowerCase();
}

export function timelineByYear<T extends Pick<VendorTimelineEvent, "date">>(events: readonly T[]): { year: string; events: T[] }[] {
  const years = new Map<string, T[]>();
  for (const event of events) {
    const year = event.date.slice(0, 4);
    const bucket = years.get(year);
    if (bucket) bucket.push(event);
    else years.set(year, [event]);
  }
  return [...years.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([year, items]) => ({ year, events: items }));
}

export type ModelLineage = {
  tiers: string[];
  generations: string[];
  cell: (tier: string, generation: string) => VendorModel[];
};

// Tier rows in first-appearance order (the data file controls it); generation
// columns ordered by each generation's earliest release.
export function modelLineage(models: readonly VendorModel[]): ModelLineage {
  const tiers: string[] = [];
  const firstRelease = new Map<string, string>();
  const cells = new Map<string, VendorModel[]>();
  for (const model of models) {
    if (!tiers.includes(model.tier)) tiers.push(model.tier);
    const earliest = firstRelease.get(model.generation);
    if (earliest === undefined || model.releasedAt < earliest) firstRelease.set(model.generation, model.releasedAt);
    const key = `${model.tier}\u0000${model.generation}`;
    cells.set(key, [...(cells.get(key) ?? []), model].sort((a, b) => a.releasedAt.localeCompare(b.releasedAt)));
  }
  const generations = [...firstRelease.entries()].sort(([, a], [, b]) => a.localeCompare(b)).map(([generation]) => generation);
  return { tiers, generations, cell: (tier, generation) => cells.get(`${tier}\u0000${generation}`) ?? [] };
}

export function currentModels(models: readonly VendorModel[]): VendorModel[] {
  return models.filter((model) => model.status === "current").sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
}

export type SourceLink = { url: string; title: string };

// Every distinct source cited anywhere on the overview, first-cited order.
export function overviewSources(overview: VendorOverview): SourceLink[] {
  const seen = new Map<string, string>();
  const add = (url: string | undefined, title?: string) => {
    if (!url) return;
    const existing = seen.get(url);
    if (existing === undefined || (existing === url && title)) seen.set(url, title ?? url);
  };
  overview.answerSources.forEach((url) => add(url));
  add(overview.modelStatusSource?.sourceUrl, overview.modelStatusSource?.sourceTitle);
  for (const entry of overview.entries) add(entry.sourceUrl, entry.sourceTitle);
  for (const model of overview.models) add(model.sourceUrl, model.sourceTitle);
  for (const plan of overview.plans) add(plan.sourceUrl, plan.sourceTitle);
  for (const item of overview.availability) add(item.sourceUrl, item.sourceTitle);
  for (const row of overview.governance) add(row.claim.sourceUrl, row.claim.sourceTitle);
  for (const level of overview.safetyLevels) add(level.sourceUrl, level.sourceTitle);
  for (const item of overview.roadmap) add(item.sourceUrl, item.sourceTitle);
  for (const fact of overview.company.facts) add(fact.sourceUrl, fact.sourceTitle);
  for (const partnership of overview.company.partnerships) add(partnership.sourceUrl, partnership.sourceTitle);
  for (const event of overview.timeline) add(event.sourceUrl, event.sourceTitle);
  for (const faq of overview.faqs) faq.sourceUrls.forEach((url) => add(url));
  return [...seen.entries()].map(([url, title]) => ({ url, title }));
}

// Feed entries about any of the overview's tracked tools, newest first.
export function relatedUpdates(overview: Pick<VendorOverview, "entries" | "timeline">, updates: readonly UpdateEntry[], limit = 8): UpdateEntry[] {
  const toolIds = new Set(overview.entries.flatMap((entry) => (entry.toolId ? [entry.toolId] : [])));
  const linked = new Set(overview.timeline.flatMap((event) => (event.updateId ? [event.updateId] : [])));
  return updates
    .filter((update) => toolIds.has(update.toolId) || linked.has(update.id))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Mar 2023" for month precision, "14 Mar 2023" for day precision. Locale-free
// so server and client render identical text.
export function formatPartialDate(date: string): string {
  const [year, month, dayOfMonth] = date.split("-");
  const label = `${MONTHS[Number(month) - 1] ?? month} ${year}`;
  return dayOfMonth ? `${Number(dayOfMonth)} ${label}` : label;
}

export function formatUsd(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2).replace(/0$/, "")}`;
}
