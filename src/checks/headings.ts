import type { DocSyncIssue, MarkdownHeading } from "../types.js";

export function findMissingSections(
  sourceHeadings: MarkdownHeading[],
  targetHeadings: MarkdownHeading[],
  targetPath: string
): DocSyncIssue[] {
  const targetByNormalizedText = new Set(targetHeadings.map((heading) => heading.normalizedText));
  const issues: DocSyncIssue[] = [];

  for (const sourceHeading of sourceHeadings) {
    if (sourceHeading.depth === 1) {
      continue;
    }

    if (targetByNormalizedText.has(sourceHeading.normalizedText)) {
      continue;
    }

    if (hasDepthMatchAtPosition(sourceHeading, sourceHeadings, targetHeadings)) {
      continue;
    }

    issues.push({
      type: "missing_section",
      severity: sourceHeading.depth <= 2 ? "warning" : "info",
      target: targetPath,
      section: sourceHeading.text,
      message: `${targetPath} may be missing section "${sourceHeading.text}"`
    });
  }

  return issues;
}

function hasDepthMatchAtPosition(
  sourceHeading: MarkdownHeading,
  sourceHeadings: MarkdownHeading[],
  targetHeadings: MarkdownHeading[]
): boolean {
  const sameDepthSourceHeadings = sourceHeadings.filter((heading) => heading.depth === sourceHeading.depth);
  const sameDepthTargetHeadings = targetHeadings.filter((heading) => heading.depth === sourceHeading.depth);
  const sourceIndex = sameDepthSourceHeadings.indexOf(sourceHeading);

  if (sourceIndex < 0 || sourceIndex >= sameDepthTargetHeadings.length) {
    return false;
  }

  return true;
}
