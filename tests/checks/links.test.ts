import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { findBrokenLocalResources } from "../../src/checks/links.js";
import { parseMarkdownResources } from "../../src/markdown.js";

describe("findBrokenLocalResources", () => {
  it("reports missing local links and images", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-links-"));
    const readmePath = join(dir, "README.md");

    await mkdir(join(dir, "docs"));
    await writeFile(join(dir, "docs", "setup.md"), "# Setup\n", "utf8");

    try {
      const resources = parseMarkdownResources(
        [
          "[Setup](./docs/setup.md)",
          "[Missing](./docs/missing-setup.md)",
          "![Missing image](./assets/missing.png)",
          "[Remote](https://example.com)",
          "[Email](mailto:hello@example.com)"
        ].join("\n")
      );

      const issues = findBrokenLocalResources(readmePath, resources, {
        checkLinks: true,
        checkImages: true,
        displayPath: "README.md"
      });

      expect(issues).toEqual([
        {
          type: "broken_link",
          severity: "error",
          target: "README.md",
          path: "./docs/missing-setup.md",
          message: "README.md:2 link target not found: ./docs/missing-setup.md"
        },
        {
          type: "broken_image",
          severity: "error",
          target: "README.md",
          path: "./assets/missing.png",
          message: "README.md:3 image path not found: ./assets/missing.png"
        }
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("respects enabled resource types", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-links-"));
    const readmePath = join(dir, "README.md");

    try {
      const resources = parseMarkdownResources(["[Missing](./missing.md)", "![Missing](./missing.png)"].join("\n"));
      const issues = findBrokenLocalResources(readmePath, resources, {
        checkLinks: true,
        checkImages: false,
        displayPath: "README.md"
      });

      expect(issues.map((issue) => issue.type)).toEqual(["broken_link"]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
