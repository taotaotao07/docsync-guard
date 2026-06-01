import { describe, expect, it } from "vitest";
import { hashSectionContent, normalizeHeading, parseMarkdownHeadings, parseMarkdownResources, splitMarkdownSections } from "../src/markdown.js";

describe("parseMarkdownHeadings", () => {
  it("extracts heading depth, text, slug, and line number", () => {
    const headings = parseMarkdownHeadings(["# DocSync Guard", "", "## Quick Start", "", "### API Reference"].join("\n"));

    expect(headings).toEqual([
      {
        depth: 1,
        text: "DocSync Guard",
        normalizedText: "docsync guard",
        slug: "docsync-guard",
        line: 1
      },
      {
        depth: 2,
        text: "Quick Start",
        normalizedText: "quick start",
        slug: "quick-start",
        line: 3
      },
      {
        depth: 3,
        text: "API Reference",
        normalizedText: "api reference",
        slug: "api-reference",
        line: 5
      }
    ]);
  });
});

describe("normalizeHeading", () => {
  it("normalizes casing, whitespace, and markdown punctuation", () => {
    expect(normalizeHeading("  **Quick   Start**  ")).toBe("quick start");
  });
});

describe("parseMarkdownResources", () => {
  it("extracts Markdown links and images", () => {
    const resources = parseMarkdownResources(
      ["# Project", "", "[Setup](./docs/setup.md)", "", "![Architecture](./assets/architecture.png)"].join("\n")
    );

    expect(resources).toEqual([
      {
        type: "link",
        url: "./docs/setup.md",
        label: "Setup",
        line: 3
      },
      {
        type: "image",
        url: "./assets/architecture.png",
        label: "Architecture",
        line: 5
      }
    ]);
  });
});

describe("splitMarkdownSections", () => {
  it("splits markdown into heading-based sections with stable hashes", () => {
    const markdown = ["# Project", "", "Intro.", "", "## Quick Start", "", "Run it."].join("\n");
    const sections = splitMarkdownSections(markdown);

    expect(sections.map((section) => section.heading.text)).toEqual(["Project", "Quick Start"]);
    expect(sections[0]?.content).toContain("Intro.");
    expect(sections[1]?.hash).toBe(hashSectionContent(["## Quick Start", "", "Run it."].join("\n")));
  });
});
