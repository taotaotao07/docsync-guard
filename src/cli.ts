#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { loadConfig } from "./config.js";
import { renderReport } from "./report.js";
import { runChecks } from "./runner.js";
import type { ReportFormat } from "./types.js";

export async function runCli(argv = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("docsync")
    .description("Catch stale translated Markdown docs before they merge.")
    .version("0.1.0");

  program
    .command("check")
    .description("Check multilingual Markdown docs for sync risks.")
    .option("-c, --config <path>", "Path to docsync config file", "docsync.yml")
    .option("-f, --format <format>", "Report format: terminal, markdown, json")
    .option("-o, --output <path>", "Write report to a file")
    .option("--fail-on <types>", "Comma-separated issue types that should fail CI")
    .option("--quiet", "Only print errors")
    .action(async (options: { config: string; format?: ReportFormat; output?: string; quiet?: boolean }) => {
      const config = await loadConfig(options.config);
      const report = await runChecks(config, options.config);
      const format = options.format ?? config.report.format;
      const rendered = renderReport(report, format);

      if (options.output) {
        await writeFile(options.output, rendered, "utf8");
      }

      if (!options.quiet && !options.output) {
        process.stdout.write(rendered);
      }
    });

  await program.parseAsync(argv);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
