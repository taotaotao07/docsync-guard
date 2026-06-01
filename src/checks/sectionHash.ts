import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import type { DocSyncIssue, MarkdownSection } from "../types.js";

export type DocSyncCache = {
  version: 1;
  sources: Record<
    string,
    {
      sections: Record<string, string>;
    }
  >;
};

export async function loadSectionHashCache(cachePath: string): Promise<DocSyncCache | null> {
  if (!existsSync(cachePath)) {
    return null;
  }

  const raw = JSON.parse(await readFile(cachePath, "utf8")) as DocSyncCache;
  if (raw.version !== 1 || !raw.sources || typeof raw.sources !== "object") {
    throw new Error(`Invalid DocSync cache: ${cachePath}`);
  }

  return raw;
}

export function findOutdatedSections(options: {
  sourcePath: string;
  targetPath: string;
  sections: MarkdownSection[];
  cache: DocSyncCache | null;
}): DocSyncIssue[] {
  const { sourcePath, targetPath, sections, cache } = options;
  if (!cache) {
    return [];
  }

  const cachedSource = cache.sources[sourcePath];
  if (!cachedSource) {
    return [];
  }

  const issues: DocSyncIssue[] = [];

  for (const section of sections) {
    const cachedHash = cachedSource.sections[section.heading.slug];
    if (!cachedHash || cachedHash === section.hash) {
      continue;
    }

    issues.push({
      type: "outdated_section",
      severity: "warning",
      target: targetPath,
      section: section.heading.text,
      message: `${targetPath} may be stale because source section "${section.heading.text}" changed`
    });
  }

  return issues;
}
