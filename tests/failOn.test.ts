import { describe, expect, it } from "vitest";
import { resolveFailOn, shouldFail } from "../src/failOn.js";
import type { FailOnConfig } from "../src/types.js";

const relaxedFailOn: FailOnConfig = {
  missing_sections: false,
  outdated_sections: false,
  broken_links: false,
  terminology_drift: false,
  image_path_broken: false
};

describe("resolveFailOn", () => {
  it("uses config values when no CLI override is provided", () => {
    const configFailOn = { ...relaxedFailOn, broken_links: true };

    expect(resolveFailOn(configFailOn)).toEqual(configFailOn);
  });

  it("uses CLI issue types as an override", () => {
    expect(resolveFailOn(relaxedFailOn, "broken_links,missing_sections")).toEqual({
      missing_sections: true,
      outdated_sections: false,
      broken_links: true,
      terminology_drift: false,
      image_path_broken: false
    });
  });

  it("rejects unknown issue types", () => {
    expect(() => resolveFailOn(relaxedFailOn, "unknown")).toThrow("Unknown fail_on issue type: unknown");
  });
});

describe("shouldFail", () => {
  it("returns true when a matching issue type is configured to fail", () => {
    expect(
      shouldFail(
        {
          source: "README.md",
          sourceIssues: [],
          targets: [
            {
              path: "README.zh-CN.md",
              issues: [
                {
                  type: "broken_link",
                  severity: "error",
                  path: "./missing.md",
                  message: "missing"
                }
              ]
            }
          ]
        },
        { ...relaxedFailOn, broken_links: true }
      )
    ).toBe(true);
  });

  it("returns false when the issue type is not configured to fail", () => {
    expect(
      shouldFail(
        {
          source: "README.md",
          sourceIssues: [],
          targets: [
            {
              path: "README.zh-CN.md",
              issues: [
                {
                  type: "terminology_drift",
                  severity: "warning",
                  term: "workspace",
                  expected: "工作区",
                  message: "drift"
                }
              ]
            }
          ]
        },
        relaxedFailOn
      )
    ).toBe(false);
  });
});
