export type ToolCategory =
  | "agents"
  | "orchestration"
  | "governance"
  | "assistants"
  | "always-on-agents"
  | "control-planes"
  | "agent-identity"
  | "observability"
  | "gateways";
export type ToolType = "vendor" | "opensource" | "commercial";
export type PricingModel = "free" | "freemium" | "paid" | "contact";
export type ToolStatus = "active" | "maintenance" | "deprecated" | "archived";
export type UpdateType = "release" | "acquisition" | "deprecation" | "rename" | "funding" | "feature" | "model-addition" | "license-change";
export type UpdateImpact = "high" | "medium" | "low";
export type UpdateCategory = ToolCategory | "platforms";

export type ISODateString = string; // Calendar ISO date only: YYYY-MM-DD.
export type LogoKind = "official-product" | "official-vendor" | "service-icon" | "project-logo" | "fallback";

export type GovernanceStatus = "yes" | "partial" | "no" | "not-applicable" | "unknown";
export type DeploymentModel = "saas" | "self-hosted" | "on-prem" | "sovereign" | "hybrid";
export type EuAiActRole = "prohibited" | "high-risk" | "limited-risk" | "minimal-risk" | "not-applicable" | "unknown";
export type LicenseRiskLevel = "low" | "medium" | "high" | "unknown";

// One governance dimension. `sourceUrl` is required when `status` asserts a fact
// (yes/partial/no); for `not-applicable`/`unknown`, `detail` must carry the reason.
export type GovernanceClaim = {
  status: GovernanceStatus;
  detail: string;
  sourceUrl?: string;
  sourceTitle?: string;
};

export type ToolGovernance = {
  dataResidency: GovernanceClaim;
  deployment: GovernanceClaim & { models: DeploymentModel[] };
  auditLogging: GovernanceClaim;
  soc2: GovernanceClaim;
  iso27001: GovernanceClaim;
  iso42001: GovernanceClaim;
  euAiAct: GovernanceClaim & { role: EuAiActRole };
  licenseRisk: GovernanceClaim & { level: LicenseRiskLevel };
  reviewedAt: ISODateString;
};

export type LicenseChangeDirection = "open" | "restrictive";

// One license transition in a tool's history. `direction` is from the
// adopter's perspective: "restrictive" = more restrictions than before,
// "open" = fewer. `convertsOn`/`convertsTo` capture delayed-conversion
// licenses (BUSL-style) where the license changes again on a fixed date.
export type LicenseHistoryEvent = {
  date: ISODateString;
  fromLicense: string;
  toLicense: string;
  direction: LicenseChangeDirection;
  sourceUrl: string;
  sourceTitle?: string;
  notes?: string;
  convertsOn?: ISODateString;
  convertsTo?: string;
};

export type LogoAuditMetadata =
  | {
      logoKind: "fallback";
      logoSourceUrl?: undefined;
      logoNotes?: string;
      logoReviewedAt: ISODateString;
    }
  | {
      logoKind: Exclude<LogoKind, "fallback">;
      logoSourceUrl: string;
      logoNotes?: string;
      logoReviewedAt: ISODateString;
    };

export type Tool = {
  id: string;
  name: string;
  aliases?: string[];
  category: ToolCategory;
  alsoCovers?: ToolCategory[];
  subcategory?: string;
  type: ToolType;
  vendor?: string;
  description: string;
  strengths: string[];
  practitionerNote?: string;
  clouds?: string[];
  cloudBadgeReviewedAt?: ISODateString;
  license: string;
  licenseWarning?: string;
  licenseHistory?: LicenseHistoryEvent[];
  githubUrl?: string;
  githubStars?: number;
  version?: string;
  lastRelease?: string;
  publishedAt?: ISODateString;
  docsUrl: string;
  websiteUrl?: string;
  pricing?: string;
  pricingModel?: PricingModel;
  languages?: string[];
  status: ToolStatus;
  statusNote?: string;
  logoUrl?: string;
  tags?: string[];
  governance: ToolGovernance;
} & LogoAuditMetadata;

export type PlatformMapping = {
  label: string;
  href: string;
};

export type Platform = {
  id: string;
  name: string;
  formerNames: string[];
  vendor: string;
  description: string;
  modelCount: string;
  sdkLanguages: string[];
  protocols: string[];
  pricing: string;
  freeTier: string;
  onPremises: string;
  regions: string;
  compliance: string[];
  docsUrl: string;
  websiteUrl?: string;
  lastUpdated: string;
  tagline: string;
  logoUrl?: string;
  categoryMapping: {
    agents: PlatformMapping;
    orchestration: PlatformMapping;
    governance: PlatformMapping;
    assistantsCoding: PlatformMapping;
    assistantsProductivity: PlatformMapping;
    assistantsBuildYourOwn: PlatformMapping;
  };
} & LogoAuditMetadata;

export type SnapshotDiffEvent = {
  toolId: string;
  toolName: string;
  from: string;
  to: string;
  field: string;
  previous: unknown;
  current: unknown;
  highImpact: boolean;
};

export type UpdateEntry = {
  id: string;
  date: string;
  toolId: string;
  toolName: string;
  category: UpdateCategory;
  type: UpdateType;
  title?: string;
  summary: string;
  sourceUrl: string;
  sourceTitle?: string;
  impact?: UpdateImpact;
};

// ── Vendor stack overviews (data/stacks/<vendor>.json) ──────────────────────
// Every published fact carries its own primary source and the date it was
// last checked against that source. See data/SCHEMA.md.

export type SourceRef = {
  sourceUrl: string;
  sourceTitle?: string;
  verifiedAt: ISODateString;
};

export type VendorCluster = "products" | "ecosystem" | "company";

export type VendorDomainGroup = { id: string; label: string };

export type VendorDomain = {
  id: string;
  label: string;
  tagline: string;
  intro: string;
  cluster: VendorCluster;
  groups: VendorDomainGroup[];
};

export type VendorEntryKind =
  | "model-family"
  | "product"
  | "feature"
  | "solution"
  | "standard"
  | "open-source"
  | "resource"
  | "research"
  | "framework"
  | "program"
  | "partnership";

export type VendorEntryStatus = "ga" | "beta" | "preview" | "research-preview" | "active" | "deprecated" | "retired";

export type VendorAudience =
  | "everyone"
  | "developers"
  | "enterprise"
  | "admins"
  | "researchers"
  | "public-sector"
  | "education";

export type VendorProminence = "headline" | "standard" | "detail";

export type VendorEntry = SourceRef & {
  id: string;
  name: string;
  kind: VendorEntryKind;
  domainId: string;
  groupId?: string;
  parentId?: string;
  prominence: VendorProminence;
  status: VendorEntryStatus;
  audience: VendorAudience[];
  description: string;
  launchedAt?: string;
  formerNames?: string[];
  docsUrl?: string;
  toolId?: string;
  availableOn?: string[];
  license?: string;
  licenseWarning?: string;
  githubUrl?: string;
};

export type VendorModelStatus = "current" | "legacy" | "deprecated" | "retired";

export type VendorModel = SourceRef & {
  id: string;
  name: string;
  apiId?: string;
  tier: string;
  generation: string;
  releasedAt: ISODateString;
  status: VendorModelStatus;
  retiresAt?: ISODateString;
  contextWindow?: string;
  maxOutput?: string;
  highlight?: string;
  pricing?: { inputPerMTok: number; outputPerMTok: number; currency: "USD"; asOf: ISODateString };
};

export type VendorTimelineType =
  | "model"
  | "product"
  | "platform"
  | "enterprise"
  | "safety-policy"
  | "research"
  | "open-source"
  | "program"
  | "partnership"
  | "company"
  | "deprecation";

export type VendorTimelineEvent = SourceRef & {
  id: string;
  date: string;
  type: VendorTimelineType;
  title: string;
  summary: string;
  entryIds?: string[];
  modelIds?: string[];
  updateId?: string;
  impact?: UpdateImpact;
};

export type VendorPlanSegment = "individual" | "team" | "enterprise" | "developer" | "public-sector" | "education";

export type VendorPlan = SourceRef & {
  id: string;
  name: string;
  segment: VendorPlanSegment;
  price: string;
  priceNote?: string;
  includes: string[];
};

export type VendorAvailability = SourceRef & {
  id: string;
  name: string;
  channel: "direct" | "cloud" | "partner";
  platformId?: string;
  since?: string;
  offers: string[];
  note: string;
  // Who runs the service and so processes the data, as the cited page states.
  operatedBy?: string;
};

export type VendorGovernanceRow = {
  id: string;
  label: string;
  claim: GovernanceClaim;
};

export type VendorSafetyLevel = SourceRef & {
  id: string;
  label: string;
  summary: string;
  state: "in-force" | "defined" | "not-yet-defined";
};

export type VendorRoadmapStage = "announced" | "preview" | "rolling-out";

export type VendorRoadmapItem = SourceRef & {
  id: string;
  title: string;
  summary: string;
  announcedAt: ISODateString;
  stage: VendorRoadmapStage;
  expected?: string;
  // The earliest date named in `expected`, machine-readable, for ordering.
  expectedAt?: string;
};

// A short figure lifted verbatim from a fact's value, for the big-number band.
export type VendorFactFigure = { value: string; label: string };

export type VendorFact = SourceRef & { id: string; label: string; value: string; figures?: VendorFactFigure[] };

export type VendorPartnershipType = "cloud" | "investment" | "distribution" | "government" | "research" | "consulting" | "technology";

export type VendorPartnership = SourceRef & {
  id: string;
  partner: string;
  type: VendorPartnershipType;
  date?: string;
  summary: string;
};

export type VendorFaq = {
  id: string;
  question: string;
  answer: string;
  sourceUrls: string[];
  sectionId?: string;
};

export type VendorOverview = {
  vendor: string;
  name: string;
  title: string;
  description: string;
  reviewedAt: ISODateString;
  primarySourceHosts: string[];
  // Backs every model's status and retirement date (the vendor's lifecycle page),
  // so each model's own sourceUrl only has to back its release facts.
  modelStatusSource?: SourceRef;
  answer: string;
  answerSources: string[];
  domains: VendorDomain[];
  entries: VendorEntry[];
  models: VendorModel[];
  timeline: VendorTimelineEvent[];
  plans: VendorPlan[];
  availability: VendorAvailability[];
  governance: VendorGovernanceRow[];
  safetyLevels: VendorSafetyLevel[];
  roadmap: VendorRoadmapItem[];
  company: { facts: VendorFact[]; partnerships: VendorPartnership[] };
  faqs: VendorFaq[];
};
