import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseMarkdownHeadings } from "./markdown.js";
import { findMissingSections } from "./checks/headings.js";
import type { DocSyncConfig, DocSyncReport } from "./types.js";

export async function runChecks(config: DocSyncConfig, configPath = "docsync.yml"): Promise<DocSyncReport> {
  const baseDir = dirname(resolve(configPath));
  const sourcePath = resolve(baseDir, config.source);
  const sourceMarkdown = await readFile(sourcePath, "utf8");
  const sourceHeadings = parseMarkdownHeadings(sourceMarkdown);

  const targets = await Promise.all(
    config.targets.map(async (target) => {
      const targetPath = resolve(baseDir, target.path);
      const targetMarkdown = await readFile(targetPath, "utf8");
      const targetHeadings = parseMarkdownHeadings(targetMarkdown);
      const issues = config.rules.heading_structure
        ? findMissingSections(sourceHeadings, targetHeadings, target.path)
        : [];

      return {
        path: target.path,
        language: target.language,
        issues
      };
    })
  );

  return {
    source: config.source,
    targets
  };
}
