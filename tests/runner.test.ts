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

    expect(report.targets[0]?.issues).toHaveLength(1);
    expect(report.targets[0]?.issues[0]?.section).toBe("API Reference");
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

      expect(report.targets[0]?.issues).toEqual([
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
});
