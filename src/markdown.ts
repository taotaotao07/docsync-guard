import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import { createHash } from "node:crypto";
import type { Heading, Image, Link, Nodes, Root } from "mdast";
import type { MarkdownHeading, MarkdownResource, MarkdownSection } from "./types.js";

export function parseMarkdownHeadings(markdown: string): MarkdownHeading[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const slugger = new GithubSlugger();
  const headings: MarkdownHeading[] = [];

  for (const node of tree.children) {
    if (node.type !== "heading") {
      continue;
    }

    const heading = node as Heading;
    const text = toString(heading).trim();

    headings.push({
      depth: heading.depth,
      text,
      normalizedText: normalizeHeading(text),
      slug: slugger.slug(text),
      line: heading.position?.start.line ?? 0
    });
  }

  return headings;
}

export function normalizeHeading(text: string): string {
  return text
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[`*_~[\]()#]/g, "")
    .replace(/\s+/g, " ");
}

export function parseMarkdownResources(markdown: string): MarkdownResource[] {
  const tree = unified().use(remarkParse).parse(markdown) as Root;
  const resources: MarkdownResource[] = [];

  visit(tree, (node) => {
    if (node.type === "link") {
      const link = node as Link;
      resources.push({
        type: "link",
        url: link.url,
        label: toString(link).trim(),
        line: link.position?.start.line ?? 0
      });
    }

    if (node.type === "image") {
      const image = node as Image;
      resources.push({
        type: "image",
        url: image.url,
        label: image.alt ?? "",
        line: image.position?.start.line ?? 0
      });
    }
  });

  return resources;
}

export function splitMarkdownSections(markdown: string): MarkdownSection[] {
  const headings = parseMarkdownHeadings(markdown);
  const lines = markdown.split(/\r?\n/);
  const sections: MarkdownSection[] = [];

  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index];
    const nextHeading = headings[index + 1];
    const startLine = heading.line;
    const endLine = nextHeading ? nextHeading.line - 1 : lines.length;
    const content = lines.slice(startLine - 1, endLine).join("\n");

    sections.push({
      heading,
      content,
      hash: hashSectionContent(content)
    });
  }

  return sections;
}

export function hashSectionContent(content: string): string {
  const normalized = content
    .normalize("NFKC")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .trim();

  return createHash("sha256").update(normalized).digest("hex");
}

function visit(node: Nodes, visitor: (node: Nodes) => void): void {
  visitor(node);

  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      visit(child as Nodes, visitor);
    }
  }
}
