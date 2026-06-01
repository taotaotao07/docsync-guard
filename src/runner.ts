import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseMarkdownHeadings, parseMarkdownResources } from "./markdown.js";
import { findMissingSections } from "./checks/headings.js";
import { findBrokenLocalResources } from "./checks/links.js";
import { findTerminologyDrift } from "./checks/terms.js";
import type { DocSyncConfig, DocSyncReport } from "./types.js";

export async function runChecks(config: DocSyncConfig, configPath = "docsync.yml"): Promise<DocSyncReport> {
  const baseDir = dirname(resolve(configPath));
  const sourcePath = resolve(baseDir, config.source);
  const sourceMarkdown = await readFile(sourcePath, "utf8");
  const sourceHeadings = parseMarkdownHeadings(sourceMarkdown);
  const sourceResources = parseMarkdownResources(sourceMarkdown);
  const sourceIssues =
    config.rules.links || config.rules.images
      ? findBrokenLocalResources(sourcePath, sourceResources, {
          checkLinks: config.rules.links,
          checkImages: config.rules.images,
          displayPath: config.source
        })
      : [];

  const targets = await Promise.all(
    config.targets.map(async (target) => {
      const targetPath = resolve(baseDir, target.path);
      const targetMarkdown = await readFile(targetPath, "utf8");
      const targetHeadings = parseMarkdownHeadings(targetMarkdown);
      const headingIssues = config.rules.heading_structure
        ? findMissingSections(sourceHeadings, targetHeadings, target.path)
        : [];
      const resourceIssues =
        config.rules.links || config.rules.images
          ? findBrokenLocalResources(targetPath, parseMarkdownResources(targetMarkdown), {
              checkLinks: config.rules.links,
              checkImages: config.rules.images,
              displayPath: target.path
            })
          : [];
      const terminologyIssues = config.rules.terminology
        ? findTerminologyDrift({
            sourceMarkdown,
            targetMarkdown,
            targetPath: target.path,
            language: target.language,
            terms: config.terms
          })
        : [];

      return {
        path: target.path,
        language: target.language,
        issues: [...headingIssues, ...resourceIssues, ...terminologyIssues]
      };
    })
  );

  return {
    source: config.source,
    sourceIssues,
    targets
  };
}
