export { loadConfig, normalizeConfig } from "./config.js";
export { resolveFailOn, shouldFail } from "./failOn.js";
export { hashSectionContent, parseMarkdownHeadings, parseMarkdownResources, splitMarkdownSections, normalizeHeading } from "./markdown.js";
export { createEmptyReport, renderJsonReport, renderMarkdownReport, renderReport, renderTerminalReport } from "./report.js";
export { runChecks } from "./runner.js";
export type {
  DocSyncConfig,
  DocSyncIssue,
  DocSyncReport,
  FailOnConfig,
  IssueSeverity,
  IssueType,
  MarkdownHeading,
  MarkdownResource,
  ReportFormat,
  RulesConfig,
  TargetConfig,
  TargetReport
} from "./types.js";
