import { describe, expect, it } from "vitest";
import { findTerminologyDrift } from "../../src/checks/terms.js";

describe("findTerminologyDrift", () => {
  it("reports expected translations missing from a target document", () => {
    const issues = findTerminologyDrift({
      sourceMarkdown: "Use the workspace to manage files.",
      targetMarkdown: "使用工作空间管理文件。",
      targetPath: "README.zh-CN.md",
      language: "zh-CN",
      terms: {
        workspace: {
          "zh-CN": "工作区"
        }
      }
    });

    expect(issues).toEqual([
      {
        type: "terminology_drift",
        severity: "warning",
        target: "README.zh-CN.md",
        term: "workspace",
        expected: "工作区",
        message: 'README.zh-CN.md uses inconsistent terminology for "workspace": expected "工作区"'
      }
    ]);
  });

  it("does not report terms that do not appear in the source document", () => {
    const issues = findTerminologyDrift({
      sourceMarkdown: "Install the project.",
      targetMarkdown: "安装项目。",
      targetPath: "README.zh-CN.md",
      language: "zh-CN",
      terms: {
        workspace: {
          "zh-CN": "工作区"
        }
      }
    });

    expect(issues).toEqual([]);
  });

  it("does not report when the expected translation appears in the target document", () => {
    const issues = findTerminologyDrift({
      sourceMarkdown: "Use the workspace to manage files.",
      targetMarkdown: "使用工作区管理文件。",
      targetPath: "README.zh-CN.md",
      language: "zh-CN",
      terms: {
        workspace: {
          "zh-CN": "工作区"
        }
      }
    });

    expect(issues).toEqual([]);
  });
});
