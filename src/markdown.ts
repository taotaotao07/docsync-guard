import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";
import type { MarkdownHeading } from "./types.js";

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
