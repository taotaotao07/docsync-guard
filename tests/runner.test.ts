import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config.js";
import { runChecks } from "../src/runner.js";

describe("runChecks", () => {
  it("checks heading structure fixtures", async () => {
    const configPath = "tests/fixtures/heading-structure/docsync.yml";
    const config = await loadConfig(configPath);
    const report = await runChecks(config, configPath);
    const targetReport = report.targets.find((target) => target.path === "README.zh-CN.md");

    expect(report.sourceIssues).toEqual([]);
    expect(targetReport?.issues).toHaveLength(1);
    expect(targetReport?.issues[0]?.section).toBe("API Reference");
  });

  it("returns missing section issues for target docs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-runner-"));
    const configPath = join(dir, "docsync.yml");

    await writeFile(
      configPath,
      ["source: README.md", "targets:", "  - path: README.zh-CN.md", "    language: zh-CN"].join("\n"),
      "utf8"
    );
    await writeFile(
      join(dir, "README.md"),
      ["# Project", "## Installation", "## Quick Start", "## API Reference"].join("\n"),
      "utf8"
    );
    await writeFile(join(dir, "README.zh-CN.md"), ["# Project", "## 安装", "## 快速开始"].join("\n"), "utf8");

    try {
      const config = await loadConfig(configPath);
      const report = await runChecks(config, configPath);
      const targetReport = report.targets.find((target) => target.path === "README.zh-CN.md");

      expect(targetReport?.issues).toEqual([
        {
          type: "missing_section",
          severity: "warning",
          target: "README.zh-CN.md",
          section: "API Reference",
          message: 'README.zh-CN.md may be missing section "API Reference"'
        }
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns broken local link and image issues for target docs", async () => {
    const configPath = "tests/fixtures/local-resources/docsync.yml";
    const config = await loadConfig(configPath);
    const report = await runChecks(config, configPath);
    const targetReport = report.targets.find((target) => target.path === "README.zh-CN.md");

    expect(report.sourceIssues).toEqual([]);
    expect(targetReport?.issues).toEqual([
      {
        type: "broken_link",
        severity: "error",
        target: "README.zh-CN.md",
        path: "./docs/missing-setup.md",
        message: "README.zh-CN.md:5 link target not found: ./docs/missing-setup.md"
      },
      {
        type: "broken_image",
        severity: "error",
        target: "README.zh-CN.md",
        path: "./assets/missing.png",
        message: "README.zh-CN.md:7 image path not found: ./assets/missing.png"
      }
    ]);
  });

  it("returns broken local resource issues for the source doc", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-source-links-"));
    const configPath = join(dir, "docsync.yml");

    await writeFile(
      configPath,
      [
        "source: README.md",
        "targets:",
        "  - path: README.zh-CN.md",
        "rules:",
        "  heading_structure: false",
        "  section_hash: false",
        "  links: true",
        "  images: true",
        "  terminology: false"
      ].join("\n"),
      "utf8"
    );
    await writeFile(join(dir, "README.md"), ["# Project", "", "[Missing](./missing.md)"].join("\n"), "utf8");
    await writeFile(join(dir, "README.zh-CN.md"), ["# Project"].join("\n"), "utf8");

    try {
      const config = await loadConfig(configPath);
      const report = await runChecks(config, configPath);

      expect(report.sourceIssues).toEqual([
        {
          type: "broken_link",
          severity: "error",
          target: "README.md",
          path: "./missing.md",
          message: "README.md:3 link target not found: ./missing.md"
        }
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns terminology drift issues for target docs", async () => {
    const configPath = "tests/fixtures/terminology/docsync.yml";
    const config = await loadConfig(configPath);
    const report = await runChecks(config, configPath);
    const targetReport = report.targets.find((target) => target.path === "README.zh-CN.md");

    expect(targetReport?.issues).toEqual([
      {
        type: "terminology_drift",
        severity: "warning",
        target: "README.zh-CN.md",
        term: "workspace",
        expected: "工作区",
        message: 'README.zh-CN.md uses inconsistent terminology for "workspace": expected "工作区"'
      },
      {
        type: "terminology_drift",
        severity: "warning",
        target: "README.zh-CN.md",
        term: "pull request",
        expected: "拉取请求",
        message: 'README.zh-CN.md uses inconsistent terminology for "pull request": expected "拉取请求"'
      },
      {
        type: "terminology_drift",
        severity: "warning",
        target: "README.zh-CN.md",
        term: "release",
        expected: "发布",
        message: 'README.zh-CN.md uses inconsistent terminology for "release": expected "发布"'
      }
    ]);
  });
});
