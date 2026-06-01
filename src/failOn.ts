import type { DocSyncIssue, DocSyncReport, FailOnConfig } from "./types.js";

const failOnAliases: Record<string, keyof FailOnConfig> = {
  missing_section: "missing_sections",
  missing_sections: "missing_sections",
  outdated_section: "outdated_sections",
  outdated_sections: "outdated_sections",
  broken_link: "broken_links",
  broken_links: "broken_links",
  broken_anchor: "broken_links",
  broken_anchors: "broken_links",
  terminology_drift: "terminology_drift",
  broken_image: "image_path_broken",
  broken_images: "image_path_broken",
  image_path_broken: "image_path_broken"
};

export function resolveFailOn(configFailOn: FailOnConfig, cliFailOn?: string): FailOnConfig {
  if (!cliFailOn) {
    return configFailOn;
  }

  const resolved: FailOnConfig = {
    missing_sections: false,
    outdated_sections: false,
    broken_links: false,
    terminology_drift: false,
    image_path_broken: false
  };

  for (const rawType of cliFailOn.split(",")) {
    const normalized = rawType.trim();
    if (!normalized) {
      continue;
    }

    const key = failOnAliases[normalized];
    if (!key) {
      throw new Error(`Unknown fail_on issue type: ${normalized}`);
    }

    resolved[key] = true;
  }

  return resolved;
}

export function shouldFail(report: DocSyncReport, failOn: FailOnConfig): boolean {
  return collectIssues(report).some((issue) => shouldFailOnIssue(issue, failOn));
}

function shouldFailOnIssue(issue: DocSyncIssue, failOn: FailOnConfig): boolean {
  if (issue.type === "missing_section") {
    return failOn.missing_sections;
  }

  if (issue.type === "outdated_section") {
    return failOn.outdated_sections;
  }

  if (issue.type === "broken_link" || issue.type === "broken_anchor") {
    return failOn.broken_links;
  }

  if (issue.type === "broken_image") {
    return failOn.image_path_broken;
  }

  if (issue.type === "terminology_drift") {
    return failOn.terminology_drift;
  }

  return false;
}

function collectIssues(report: DocSyncReport): DocSyncIssue[] {
  return [...report.sourceIssues, ...report.targets.flatMap((target) => target.issues)];
}
