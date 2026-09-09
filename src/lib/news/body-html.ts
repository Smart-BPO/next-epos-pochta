import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "img",
  "br",
  "blockquote",
];

/** Convert legacy seed/body formats (JSON array or ## paragraphs) to HTML. */
export function legacyBodyToHtml(raw: string | string[]): string {
  if (Array.isArray(raw)) {
    return blocksToHtml(raw);
  }
  const trimmed = raw.trim();
  if (!trimmed) return "<p></p>";
  if (trimmed.startsWith("<")) return sanitizeNewsHtml(trimmed);
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
        return blocksToHtml(parsed as string[]);
      }
    } catch {
      // fall through
    }
  }
  const blocks = trimmed
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return blocksToHtml(blocks.length ? blocks : [trimmed]);
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blocksToHtml(blocks: string[]): string {
  return blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        return `<h2>${escapeHtml(block.slice(3))}</h2>`;
      }
      return `<p>${escapeHtml(block)}</p>`;
    })
    .join("");
}

/** Seed articles still use body: string[] — convert for CMS. */
export function seedBlocksToHtml(blocks: string[]): string {
  return blocksToHtml(blocks);
}

export function sanitizeNewsHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export function parseStoredBody(raw: string): string {
  return legacyBodyToHtml(raw);
}
