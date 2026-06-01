import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import type { DocSyncConfig, FailOnConfig, ReportConfig, RulesConfig, TargetConfig } from "./types.js";

const defaultRules: RulesConfig = {
  heading_structure: true,
  section_hash: true,
  links: true,
  images: true,
  terminology: true
};

const defaultFailOn: FailOnConfig = {
  missing_sections: false,
  outdated_sections: false,
  broken_links: false,
  terminology_drift: false,
  image_path_broken: false
};

const defaultReport: ReportConfig = {
  format: "terminal"
};

type RawConfig = {
  source?: unknown;
  targets?: unknown;
  rules?: Partial<RulesConfig>;
  terms?: unknown;
  fail_on?: Partial<FailOnConfig>;
  report?: Partial<ReportConfig>;
};

export async function loadConfig(configPath = "docsync.yml"): Promise<DocSyncConfig> {
  const absolutePath = resolve(configPath);
  let rawText: string;

  try {
    rawText = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new Error(`Config file not found: ${configPath}`, { cause: error });
  }

  const raw = parse(rawText) as RawConfig | null;
  return normalizeConfig(raw, configPath);
}

export function normalizeConfig(raw: RawConfig | null, configPath = "docsync.yml"): DocSyncConfig {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid config in ${configPath}: expected a YAML object`);
  }

  if (typeof raw.source !== "string" || raw.source.trim() === "") {
    throw new Error(`Invalid config in ${configPath}: "source" is required`);
  }

  const targets = normalizeTargets(raw.targets, configPath);

  return {
    source: raw.source,
    targets,
    rules: {
      ...defaultRules,
      ...(raw.rules ?? {})
    },
    terms: normalizeTerms(raw.terms),
    fail_on: {
      ...defaultFailOn,
      ...(raw.fail_on ?? {})
    },
    report: {
      ...defaultReport,
      ...(raw.report ?? {})
    }
  };
}

function normalizeTargets(value: unknown, configPath: string): TargetConfig[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid config in ${configPath}: at least one target is required`);
  }

  return value.map((target, index) => {
    if (typeof target === "string" && target.trim() !== "") {
      return { path: target };
    }

    if (
      target &&
      typeof target === "object" &&
      "path" in target &&
      typeof target.path === "string" &&
      target.path.trim() !== ""
    ) {
      return {
        path: target.path,
        language: "language" in target && typeof target.language === "string" ? target.language : undefined
      };
    }

    throw new Error(`Invalid config in ${configPath}: targets[${index}] must include a path`);
  });
}

function normalizeTerms(value: unknown): Record<string, Record<string, string>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const terms: Record<string, Record<string, string>> = {};

  for (const [sourceTerm, translations] of Object.entries(value)) {
    if (!translations || typeof translations !== "object" || Array.isArray(translations)) {
      continue;
    }

    const normalizedTranslations: Record<string, string> = {};
    for (const [language, translatedTerm] of Object.entries(translations)) {
      if (typeof translatedTerm === "string" && translatedTerm.trim() !== "") {
        normalizedTranslations[language] = translatedTerm;
      }
    }

    if (Object.keys(normalizedTranslations).length > 0) {
      terms[sourceTerm] = normalizedTranslations;
    }
  }

  return terms;
}
