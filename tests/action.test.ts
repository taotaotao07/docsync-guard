import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import { describe, expect, it } from "vitest";

describe("action.yml", () => {
  it("defines a composite action that writes a GitHub step summary", async () => {
    const action = parse(await readFile("action.yml", "utf8")) as {
      inputs: Record<string, { default?: string }>;
      runs: {
        using: string;
        steps: Array<{ name: string; run?: string }>;
      };
    };

    expect(action.inputs.config.default).toBe("docsync.yml");
    expect(action.inputs).not.toHaveProperty("comment");
    expect(action.runs.using).toBe("composite");
    expect(action.runs.steps.some((step) => step.run?.includes("GITHUB_STEP_SUMMARY"))).toBe(true);
    expect(action.runs.steps.some((step) => step.run?.includes("--format terminal"))).toBe(true);
    expect(action.runs.steps.some((step) => step.run?.includes("--format markdown"))).toBe(true);
  });
});
