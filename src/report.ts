import type { DocSyncConfig, DocSyncIssue, DocSyncReport, ReportFormat, TargetReport } from "./types.js";

export function createEmptyReport(config: DocSyncConfig): DocSyncReport {
  return {
    source: config.source,
    sourceIssues: [],
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
    `- Total issues: ${countIssues(report)}`
  ];

  if (report.sourceIssues.length > 0) {
    lines.push("", report.source, ...renderIssueLines({ path: report.source, issues: report.sourceIssues }));
  }

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
    "| Target | Issues | Missing sections | Outdated sections | Broken resources | Terminology drift |",
    "|---|---:|---:|---:|---:|---:|",
    ...report.targets.map((target) => {
      const missingSections = target.issues.filter((issue) => issue.type === "missing_section").length;
      const outdatedSections = target.issues.filter((issue) => issue.type === "outdated_section").length;
      const brokenLinks = target.issues.filter((issue) => issue.type === "broken_link").length;
      const brokenImages = target.issues.filter((issue) => issue.type === "broken_image").length;
      const terminologyDrift = target.issues.filter((issue) => issue.type === "terminology_drift").length;
      return `| \`${target.path}\` | ${target.issues.length} | ${missingSections} | ${outdatedSections} | ${brokenLinks + brokenImages} | ${terminologyDrift} |`;
    })
  ];

  if (report.sourceIssues.length > 0) {
    const brokenLinks = report.sourceIssues.filter((issue) => issue.type === "broken_link");
    const brokenImages = report.sourceIssues.filter((issue) => issue.type === "broken_image");

    lines.push("", "### Source document", "", `\`${report.source}\``);

    if (brokenLinks.length > 0) {
      lines.push("", "#### Broken links", "", ...brokenLinks.map((issue) => `- \`${issue.path ?? issue.message}\``));
    }

    if (brokenImages.length > 0) {
      lines.push("", "#### Broken image paths", "", ...brokenImages.map((issue) => `- \`${issue.path ?? issue.message}\``));
    }
  }

  for (const target of report.targets) {
    const missingSections = target.issues.filter((issue) => issue.type === "missing_section");
    const outdatedSections = target.issues.filter((issue) => issue.type === "outdated_section");
    const brokenLinks = target.issues.filter((issue) => issue.type === "broken_link");
    const brokenImages = target.issues.filter((issue) => issue.type === "broken_image");
    const terminologyDrift = target.issues.filter((issue) => issue.type === "terminology_drift");
    if (
      missingSections.length === 0 &&
      outdatedSections.length === 0 &&
      brokenLinks.length === 0 &&
      brokenImages.length === 0 &&
      terminologyDrift.length === 0
    ) {
      continue;
    }

    lines.push("", `### ${target.path}`, "");

    if (missingSections.length > 0) {
      lines.push("#### Missing sections", "", ...missingSections.map((issue) => `- \`${issue.section ?? issue.message}\``), "");
    }

    if (outdatedSections.length > 0) {
      lines.push("#### Possibly outdated sections", "", ...outdatedSections.map((issue) => `- \`${issue.section ?? issue.message}\``), "");
    }

    if (brokenLinks.length > 0) {
      lines.push("#### Broken links", "", ...brokenLinks.map((issue) => `- \`${issue.path ?? issue.message}\``), "");
    }

    if (brokenImages.length > 0) {
      lines.push("#### Broken image paths", "", ...brokenImages.map((issue) => `- \`${issue.path ?? issue.message}\``), "");
    }

    if (terminologyDrift.length > 0) {
      lines.push(
        "#### Terminology drift",
        "",
        ...terminologyDrift.map((issue) => `- \`${issue.term ?? issue.message}\`: expected \`${issue.expected ?? ""}\``),
        ""
      );
    }
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

  if (grouped.outdated_section.length > 0) {
    lines.push("Possibly outdated sections:", ...grouped.outdated_section.map((issue) => `- ${issue.section ?? issue.message}`));
  }

  if (grouped.broken_link.length > 0) {
    lines.push("Broken links:", ...grouped.broken_link.map((issue) => `- ${issue.path ?? issue.message}`));
  }

  if (grouped.broken_image.length > 0) {
    lines.push("Broken image paths:", ...grouped.broken_image.map((issue) => `- ${issue.path ?? issue.message}`));
  }

  if (grouped.terminology_drift.length > 0) {
    lines.push(
      "Terminology drift:",
      ...grouped.terminology_drift.map((issue) => `- ${issue.term ?? issue.message}: expected ${issue.expected ?? ""}`)
    );
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

function countIssues(report: DocSyncReport): number {
  return report.sourceIssues.length + report.targets.reduce((sum, target) => sum + target.issues.length, 0);
}
