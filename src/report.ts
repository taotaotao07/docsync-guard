import type { DocSyncConfig, DocSyncReport } from "./types.js";

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

  return `${lines.join("\n")}\n`;
}
