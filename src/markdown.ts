import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading, Image, Link, Nodes, Root } from "mdast";
import type { MarkdownHeading, MarkdownResource } from "./types.js";

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

function visit(node: Nodes, visitor: (node: Nodes) => void): void {
  visitor(node);

  if ("children" in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      visit(child as Nodes, visitor);
    }
  }
}
