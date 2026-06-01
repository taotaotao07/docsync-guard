import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { DocSyncIssue, MarkdownResource } from "../types.js";

export type LocalResourceCheckOptions = {
  checkLinks: boolean;
  checkImages: boolean;
  displayPath?: string;
};

export function findBrokenLocalResources(
  markdownPath: string,
  resources: MarkdownResource[],
  options: LocalResourceCheckOptions
): DocSyncIssue[] {
  const issues: DocSyncIssue[] = [];
  const baseDir = dirname(resolve(markdownPath));
  const displayPath = options.displayPath ?? markdownPath;

  for (const resource of resources) {
    if (resource.type === "link" && !options.checkLinks) {
      continue;
    }

    if (resource.type === "image" && !options.checkImages) {
      continue;
    }

    const pathPart = stripUrlFragment(resource.url);

    if (!pathPart || shouldIgnoreUrl(pathPart)) {
      continue;
    }

    const resolvedPath = resolve(baseDir, decodeURIComponent(pathPart));
    if (existsSync(resolvedPath)) {
      continue;
    }

    if (resource.type === "image") {
      issues.push({
        type: "broken_image",
        severity: "error",
        target: displayPath,
        path: resource.url,
        message: `${displayPath}:${resource.line} image path not found: ${resource.url}`
      });
      continue;
    }

    issues.push({
      type: "broken_link",
      severity: "error",
      target: displayPath,
      path: resource.url,
      message: `${displayPath}:${resource.line} link target not found: ${resource.url}`
    });
  }

  return issues;
}

function shouldIgnoreUrl(url: string): boolean {
  return (
    url.startsWith("#") ||
    /^[a-z][a-z0-9+.-]*:/i.test(url) ||
    url.startsWith("//") ||
    url.startsWith("/")
  );
}

function stripUrlFragment(url: string): string {
  return url.split("#", 1)[0] ?? "";
}
