---
name: fetch
description: Fetches a website's content locally using Node.js and converts it to readable Markdown. Use when the user wants to fetch, read, scrape, or research a web page using the local machine instead of the built-in WebFetch tool. Supports CSS selectors to target specific page sections.
argument-hint: "<url> [--selector <css-selector>]"
allowed-tools: Bash(node *)
---

# Local Web Fetch

Fetch a website's content using the local Node.js runtime and convert it to clean, readable Markdown. This runs entirely on the user's machine.

## How to use

Run the fetch script with the provided URL argument:

```bash
node .claude/plugins/local-web-fetch/scripts/fetch-website.mjs $ARGUMENTS
```

The script will:
1. Fetch the page HTML using Node.js built-in `fetch`
2. Strip non-content elements (scripts, styles, nav, ads, cookies banners)
3. Auto-detect the main content area (article, main, etc.)
4. Convert the cleaned HTML to Markdown via Turndown
5. Print the Markdown result to stdout

## Arguments

- `$0` — the URL to fetch (required). The `https://` prefix is added automatically if missing.
- `--selector <css>` — optional CSS selector to extract only a specific part of the page (e.g. `main`, `article`, `#docs-content`).

## Examples

Fetch a page:
```
/local-web-fetch:fetch https://example.com
```

Fetch only the article body:
```
/local-web-fetch:fetch https://example.com --selector article
```

## After fetching

Once you have the Markdown output, do the following based on the user's request:
- **Summarize**: Provide a concise summary of the page content.
- **Answer questions**: Use the fetched content to answer the user's question about the page.
- **Extract data**: Pull out specific information like tables, lists, code snippets, or links.
- **Compare**: If multiple URLs are fetched, compare their contents.

If the output is very large (>100 KB), inform the user and suggest using `--selector` to narrow the content.

## Troubleshooting

- If the fetch fails with a network error, check that the URL is correct and reachable.
- If the output is mostly empty, the site may require JavaScript rendering (this tool only fetches static HTML). Let the user know.
- If a selector matches nothing, the script falls back to the full page body automatically.
