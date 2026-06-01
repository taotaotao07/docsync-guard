import { describe, expect, it } from "vitest";
import { findMissingSections } from "../../src/checks/headings.js";
import { parseMarkdownHeadings } from "../../src/markdown.js";

describe("findMissingSections", () => {
  it("reports a missing H2 section when the target has fewer same-depth sections", () => {
    const source = parseMarkdownHeadings(
      ["# Project", "## Installation", "## Quick Start", "## Configuration", "## API Reference"].join("\n")
    );
    const target = parseMarkdownHeadings(["# Project", "## 安装", "## 快速开始", "## 配置"].join("\n"));

    const issues = findMissingSections(source, target, "README.zh-CN.md");

    expect(issues).toEqual([
      {
        type: "missing_section",
        severity: "warning",
        target: "README.zh-CN.md",
        section: "API Reference",
        message: 'README.zh-CN.md may be missing section "API Reference"'
      }
    ]);
  });

  it("reports missing H3 sections as info", () => {
    const source = parseMarkdownHeadings(["# Project", "## API", "### Options"].join("\n"));
    const target = parseMarkdownHeadings(["# Project", "## API"].join("\n"));

    const issues = findMissingSections(source, target, "README.zh-CN.md");

    expect(issues[0]?.severity).toBe("info");
    expect(issues[0]?.section).toBe("Options");
  });

  it("does not report translated headings when depth positions line up", () => {
    const source = parseMarkdownHeadings(["# Project", "## Installation", "## Quick Start"].join("\n"));
    const target = parseMarkdownHeadings(["# Project", "## 安装", "## 快速开始"].join("\n"));

    expect(findMissingSections(source, target, "README.zh-CN.md")).toEqual([]);
  });
});
