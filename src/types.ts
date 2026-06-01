export type ReportFormat = "terminal" | "markdown" | "json";

export type IssueSeverity = "info" | "warning" | "error";

export type IssueType =
  | "missing_section"
  | "outdated_section"
  | "broken_link"
  | "broken_anchor"
  | "broken_image"
  | "terminology_drift";

export type RulesConfig = {
  heading_structure: boolean;
  section_hash: boolean;
  links: boolean;
  images: boolean;
  terminology: boolean;
};

export type FailOnConfig = {
  missing_sections: boolean;
  outdated_sections: boolean;
  broken_links: boolean;
  terminology_drift: boolean;
  image_path_broken: boolean;
};

export type TargetConfig = {
  path: string;
  language?: string;
};

export type ReportConfig = {
  format: ReportFormat;
  output?: string;
};

export type DocSyncConfig = {
  source: string;
  targets: TargetConfig[];
  rules: RulesConfig;
  terms: Record<string, Record<string, string>>;
  fail_on: FailOnConfig;
  report: ReportConfig;
};

export type DocSyncIssue = {
  type: IssueType;
  severity: IssueSeverity;
  target?: string;
  section?: string;
  path?: string;
  term?: string;
  expected?: string;
  message: string;
};

export type MarkdownHeading = {
  depth: number;
  text: string;
  normalizedText: string;
  slug: string;
  line: number;
};

export type MarkdownResource = {
  type: "link" | "image";
  url: string;
  label: string;
  line: number;
};

export type MarkdownSection = {
  heading: MarkdownHeading;
  content: string;
  hash: string;
};

export type TargetReport = {
  path: string;
  language?: string;
  issues: DocSyncIssue[];
};

export type DocSyncReport = {
  source: string;
  sourceIssues: DocSyncIssue[];
  targets: TargetReport[];
};
