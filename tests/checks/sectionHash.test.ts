import { describe, expect, it } from "vitest";
import { findOutdatedSections } from "../../src/checks/sectionHash.js";
import { splitMarkdownSections } from "../../src/markdown.js";

describe("findOutdatedSections", () => {
  it("reports sections whose current hash differs from the cache", () => {
    const sections = splitMarkdownSections(["# Project", "", "Intro.", "", "## Quick Start", "", "Run the new command."].join("\n"));
    const quickStart = sections.find((section) => section.heading.text === "Quick Start");

    expect(quickStart).toBeDefined();

    const issues = findOutdatedSections({
      sourcePath: "README.md",
      targetPath: "README.zh-CN.md",
      sections,
      cache: {
        version: 1,
        sources: {
          "README.md": {
            sections: {
              "quick-start": "old-hash"
            }
          }
        }
      }
    });

    expect(issues).toEqual([
      {
        type: "outdated_section",
        severity: "warning",
        target: "README.zh-CN.md",
        section: "Quick Start",
        message: 'README.zh-CN.md may be stale because source section "Quick Start" changed'
      }
    ]);
  });

  it("does not report when there is no cache", () => {
    const sections = splitMarkdownSections(["# Project", "", "Intro."].join("\n"));

    expect(
      findOutdatedSections({
        sourcePath: "README.md",
        targetPath: "README.zh-CN.md",
        sections,
        cache: null
      })
    ).toEqual([]);
  });
});
