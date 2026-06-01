export { loadConfig, normalizeConfig } from "./config.js";
export { parseMarkdownHeadings, normalizeHeading } from "./markdown.js";
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
