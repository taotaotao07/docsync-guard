import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("docsync check", () => {
  it("prints a terminal report from a config file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "docsync-cli-"));
    const configPath = join(dir, "docsync.yml");

    await writeFile(
      configPath,
      ["source: README.md", "targets:", "  - path: README.zh-CN.md", "    language: zh-CN"].join("\n"),
      "utf8"
    );
    await writeFile(join(dir, "README.md"), ["# Project", "## Installation", "## API Reference"].join("\n"), "utf8");
    await writeFile(join(dir, "README.zh-CN.md"), ["# Project", "## 安装"].join("\n"), "utf8");

    try {
      const { stdout } = await execFileAsync("node", [
        "--import",
        "tsx",
        "src/cli.ts",
        "check",
        "--config",
        configPath
      ]);

      expect(stdout).toContain("DocSync Guard Report");
      expect(stdout).toContain("README.md");
      expect(stdout).toContain("README.zh-CN.md (zh-CN)");
      expect(stdout).toContain("API Reference");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("exits with code 1 when --fail-on matches reported issues", async () => {
    await expect(
      execFileAsync("node", [
        "--import",
        "tsx",
        "src/cli.ts",
        "check",
        "--config",
        "tests/fixtures/local-resources/docsync.yml",
        "--fail-on",
        "broken_links"
      ])
    ).rejects.toMatchObject({
      code: 1
    });
  });
});
