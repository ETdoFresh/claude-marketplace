#!/usr/bin/env node

/**
 * fetch-website.mjs
 *
 * Fetches a website's HTML content using Node.js built-in fetch,
 * strips non-content elements, and converts it to clean Markdown.
 *
 * Usage: node fetch-website.mjs <url> [--selector <css-selector>]
 *
 * Options:
 *   --selector <sel>   Extract only content matching this CSS selector
 *                      (e.g. "main", "article", "#content")
 *
 * Output: Markdown text of the page content written to stdout.
 *         Errors and diagnostics go to stderr.
 */

import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { resolve } from "path";

// ── Helpers ──────────────────────────────────────────────────────────────

function printUsage() {
  console.error(
    `Usage: node fetch-website.mjs <url> [--selector <css-selector>]`
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let url = null;
  let selector = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--selector" || args[i] === "-s") {
      selector = args[++i];
    } else if (!url && !args[i].startsWith("-")) {
      url = args[i];
    }
  }

  if (!url) printUsage();

  // Auto-add https if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return { url, selector };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const { url, selector } = parseArgs(process.argv);

  console.error(`Fetching: ${url}`);

  let response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`Fetch error: ${err.message}`);
    process.exit(1);
  }

  if (!response.ok) {
    console.error(`HTTP ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml")) {
    console.error(`Warning: Content-Type is "${contentType}", may not be HTML.`);
  }

  const html = await response.text();
  console.error(`Received ${html.length} bytes of HTML`);

  // ── Parse & clean the DOM ────────────────────────────────────────────
  const $ = cheerio.load(html);

  // Extract metadata before stripping
  const title = $("title").first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  // Remove non-content elements
  const removeSelectors = [
    "script",
    "style",
    "noscript",
    "iframe",
    "svg",
    "canvas",
    "nav",
    "footer",
    "header",
    ".cookie-banner",
    ".advertisement",
    ".ads",
    ".ad",
    "#cookie-consent",
    "[role='navigation']",
    "[role='banner']",
    "[role='complementary']",
    "[aria-hidden='true']",
  ];
  $(removeSelectors.join(", ")).remove();

  // Pick the content root
  let contentHtml;
  if (selector) {
    const selected = $(selector);
    if (selected.length === 0) {
      console.error(`Warning: Selector "${selector}" matched nothing. Falling back to full body.`);
      contentHtml = $("body").html() || $.html();
    } else {
      contentHtml = selected.html();
    }
  } else {
    // Try common content containers first
    const contentSelectors = [
      "article",
      "main",
      '[role="main"]',
      "#content",
      ".content",
      ".post-content",
      ".entry-content",
      ".article-body",
    ];
    let found = false;
    for (const sel of contentSelectors) {
      const el = $(sel);
      if (el.length > 0 && el.text().trim().length > 200) {
        contentHtml = el.html();
        console.error(`Auto-detected content container: ${sel}`);
        found = true;
        break;
      }
    }
    if (!found) {
      contentHtml = $("body").html() || $.html();
    }
  }

  // ── Convert HTML → Markdown ──────────────────────────────────────────
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    hr: "---",
  });

  // Skip images with no useful alt text
  turndown.addRule("skipDecorativeImages", {
    filter: (node) =>
      node.nodeName === "IMG" && (!node.getAttribute("alt") || node.getAttribute("alt").trim() === ""),
    replacement: () => "",
  });

  // Keep useful images as markdown
  turndown.addRule("images", {
    filter: (node) =>
      node.nodeName === "IMG" && node.getAttribute("alt") && node.getAttribute("alt").trim() !== "",
    replacement: (content, node) => {
      const alt = node.getAttribute("alt") || "";
      const src = node.getAttribute("src") || "";
      return `![${alt}](${src})`;
    },
  });

  let markdown = turndown.turndown(contentHtml || "");

  // Clean up excessive blank lines
  markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

  // ── Build output ─────────────────────────────────────────────────────
  const parts = [];

  if (title) parts.push(`# ${title}\n`);
  if (metaDescription) parts.push(`> ${metaDescription}\n`);
  parts.push(`**Source:** ${url}\n`);
  parts.push("---\n");
  parts.push(markdown);

  const output = parts.join("\n");

  // Warn if output is very large
  if (output.length > 100_000) {
    console.error(
      `Warning: Output is ${output.length} chars. Consider using --selector to narrow results.`
    );
  }

  console.log(output);
}

main();
