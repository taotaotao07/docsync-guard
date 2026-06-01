import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { loadConfig, normalizeConfig } from "../src/config.js";

describe("normalizeConfig", () => {
  it("requires a source", () => {
    expect(() => normalizeConfig({ targets: ["README.zh-CN.md"] })).toThrow('"source" is required');
  });

  it("requires at least one target", () => {
    expect(() => normalizeConfig({ source: "README.md", targets: [] })).toThrow("at least one target");
  });

  it("applies defaults for rules, fail_on, report, and terms", () => {
    const config = normalizeConfig({
      source: "README.md",
      targets: [{ path: "README.zh-CN.md", language: "zh-CN" }]
    });

    expect(config.rules.heading_structure).toBe(true);
    expect(config.fail_on.broken_links).toBe(false);
    expect(config.report.format).toBe("terminal");
    expect(config.terms).toEqual({});
  });

  it("preserves configured values", () => {
    const config = normalizeConfig({
      source: "README.md",
      targets: [{ path: "README.zh-CN.md", language: "zh-CN" }],
      rules: { section_hash: false },
      fail_on: { broken_links: true },
      report: { format: "markdown", output: "docsync-report.md" },
      terms: {
        workspace: {
          "zh-CN": "工作区"
        }
      }
    });

    expect(config.rules.section_hash).toBe(false);
    expect(config.fail_on.broken_links).toBe(true);
    expect(config.report).toEqual({ format: "markdown", output: "docsync-report.md" });
    expect(config.terms.workspace["zh-CN"]).toBe("工作区");
  });
});

describe("loadConfig", () => {
  it("loads a YAML config file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-config-"));
    const configPath = join(dir, "docsync.yml");

    await writeFile(
      configPath,
      [
        "source: README.md",
        "targets:",
        "  - path: README.zh-CN.md",
        "    language: zh-CN",
        "fail_on:",
        "  missing_sections: true"
      ].join("\n"),
      "utf8"
    );

    try {
      const config = await loadConfig(configPath);
      expect(config.source).toBe("README.md");
      expect(config.targets[0]).toEqual({ path: "README.zh-CN.md", language: "zh-CN" });
      expect(config.fail_on.missing_sections).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
