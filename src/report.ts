import type { DocSyncConfig, DocSyncIssue, DocSyncReport, ReportFormat, TargetReport } from "./types.js";

export function createEmptyReport(config: DocSyncConfig): DocSyncReport {
  return {
    source: config.source,
    targets: config.targets.map((target) => ({
      path: target.path,
      language: target.language,
      issues: []
    }))
  };
}

export function renderTerminalReport(report: DocSyncReport): string {
  const lines = [
    "DocSync Guard Report",
    "",
    "Source:",
    `- ${report.source}`,
    "",
    "Targets:",
    ...report.targets.map((target) => `- ${target.path}${target.language ? ` (${target.language})` : ""}`),
    "",
    "Summary:",
    `- Total issues: ${report.targets.reduce((sum, target) => sum + target.issues.length, 0)}`
  ];

  for (const target of report.targets) {
    lines.push("", target.path, ...renderIssueLines(target));
  }

  return `${lines.join("\n")}\n`;
}

export function renderMarkdownReport(report: DocSyncReport): string {
  const lines = [
    "## DocSync Guard Report",
    "",
    `Source: \`${report.source}\``,
    "",
    "### Summary",
    "",
    "| Target | Issues | Missing sections |",
    "|---|---:|---:|",
    ...report.targets.map((target) => {
      const missingSections = target.issues.filter((issue) => issue.type === "missing_section").length;
      return `| \`${target.path}\` | ${target.issues.length} | ${missingSections} |`;
    })
  ];

  for (const target of report.targets) {
    const missingSections = target.issues.filter((issue) => issue.type === "missing_section");
    if (missingSections.length === 0) {
      continue;
    }

    lines.push("", `### ${target.path}`, "", "#### Missing sections", "");
    lines.push(...missingSections.map((issue) => `- \`${issue.section ?? issue.message}\``));
  }

  lines.push("");
  return lines.join("\n");
}

export function renderJsonReport(report: DocSyncReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderReport(report: DocSyncReport, format: ReportFormat): string {
  if (format === "json") {
    return renderJsonReport(report);
  }

  if (format === "markdown") {
    return renderMarkdownReport(report);
  }

  return renderTerminalReport(report);
}

function renderIssueLines(target: TargetReport): string[] {
  if (target.issues.length === 0) {
    return ["- No issues found"];
  }

  const grouped = groupIssues(target.issues);
  const lines: string[] = [];

  if (grouped.missing_section.length > 0) {
    lines.push("Missing sections:", ...grouped.missing_section.map((issue) => `- ${issue.section ?? issue.message}`));
  }

  return lines;
}

function groupIssues(issues: DocSyncIssue[]): Record<DocSyncIssue["type"], DocSyncIssue[]> {
  return {
    missing_section: issues.filter((issue) => issue.type === "missing_section"),
    outdated_section: issues.filter((issue) => issue.type === "outdated_section"),
    broken_link: issues.filter((issue) => issue.type === "broken_link"),
    broken_anchor: issues.filter((issue) => issue.type === "broken_anchor"),
    broken_image: issues.filter((issue) => issue.type === "broken_image"),
    terminology_drift: issues.filter((issue) => issue.type === "terminology_drift")
  };
}
