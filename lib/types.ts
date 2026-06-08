export type ToolCategory = "agents" | "orchestration" | "governance" | "assistants";
export type ToolType = "vendor" | "opensource" | "commercial";
export type PricingModel = "free" | "freemium" | "paid" | "contact";
export type ToolStatus = "active" | "maintenance" | "deprecated" | "archived";
export type UpdateType = "release" | "acquisition" | "deprecation" | "rename" | "funding" | "feature" | "model-addition";
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
  category: ToolCategory;
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
