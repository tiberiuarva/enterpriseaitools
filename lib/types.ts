export type ToolCategory = "agents" | "orchestration" | "governance" | "assistants";
export type ToolType = "vendor" | "opensource" | "commercial";
export type PricingModel = "free" | "freemium" | "paid" | "contact";
export type ToolStatus = "active" | "maintenance" | "deprecated" | "archived";
export type UpdateType = "release" | "acquisition" | "deprecation" | "rename" | "funding" | "feature" | "model-addition";
export type UpdateImpact = "high" | "medium" | "low";
export type UpdateCategory = ToolCategory | "platforms";

export type Tool = {
  id: string;
  name: string;
  category: ToolCategory;
  subcategory?: string;
  type: ToolType;
  vendor?: string;
  description: string;
  strengths: string[];
  clouds?: string[];
  license: string;
  licenseWarning?: string;
  githubUrl?: string;
  githubStars?: number;
  version?: string;
  lastRelease?: string;
  docsUrl: string;
  websiteUrl?: string;
  pricing?: string;
  pricingModel?: PricingModel;
  languages?: string[];
  status: ToolStatus;
  statusNote?: string;
  logoUrl?: string;
  tags?: string[];
};

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
};

export type UpdateEntry = {
  id: string;
  date: string;
  toolId: string;
  toolName: string;
  category: UpdateCategory;
  type: UpdateType;
  summary: string;
  sourceUrl: string;
  sourceTitle?: string;
  impact?: UpdateImpact;
};
