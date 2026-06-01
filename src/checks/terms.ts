import type { DocSyncIssue } from "../types.js";

export function findTerminologyDrift(options: {
  sourceMarkdown: string;
  targetMarkdown: string;
  targetPath: string;
  language?: string;
  terms: Record<string, Record<string, string>>;
}): DocSyncIssue[] {
  const { sourceMarkdown, targetMarkdown, targetPath, language, terms } = options;
  if (!language) {
    return [];
  }

  const issues: DocSyncIssue[] = [];

  for (const [sourceTerm, translations] of Object.entries(terms)) {
    const expected = translations[language];
    if (!expected) {
      continue;
    }

    if (!containsSourceTerm(sourceMarkdown, sourceTerm)) {
      continue;
    }

    if (targetMarkdown.includes(expected)) {
      continue;
    }

    issues.push({
      type: "terminology_drift",
      severity: "warning",
      target: targetPath,
      term: sourceTerm,
      expected,
      message: `${targetPath} uses inconsistent terminology for "${sourceTerm}": expected "${expected}"`
    });
  }

  return issues;
}

function containsSourceTerm(markdown: string, sourceTerm: string): boolean {
  return markdown.toLocaleLowerCase().includes(sourceTerm.toLocaleLowerCase());
}
