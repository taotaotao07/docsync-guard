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
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
